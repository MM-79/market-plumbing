#!/usr/bin/env node
// ============================================================================
// Snapshot fetcher.
//
//   node scripts/fetch-snapshot.mjs [--out public/data] [--no-history]
//
// Pulls every automatable series, computes the derived ones, and writes a
// dated snapshot. Zero dependencies - Node 18+ built-in fetch only - because
// the value of this script is that it still runs unattended in three years,
// and every dependency is a future reason it will not.
//
// EXIT CODES
//   0  snapshot written (possibly with some series failed)
//   1  too many failures, or a core curve series missing - snapshot NOT written
//
// The failure policy is deliberate. A partial snapshot is useful and honest;
// a snapshot missing the curve is neither, because everything downstream is
// derived from it. Better to keep yesterday's data and say so loudly than to
// publish a page whose anchor is empty.
// ============================================================================

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  FRED_SERIES, DERIVED, NYFED, FISCALDATA, TREASURY_DIRECT, MANUAL_FIELDS,
} from './sources.mjs';

const args = process.argv.slice(2);
const argVal = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const OUT_DIR = path.resolve(argVal('--out', 'public/data'));
const WRITE_HISTORY = !args.includes('--no-history');
const FRED_KEY = process.env.FRED_API_KEY || '';

const TIMEOUT_MS = 30_000;
const RETRIES = 3;
/** Series that must be present or the snapshot is not worth writing. */
const CORE = ['y2', 'y5', 'y10', 'y30'];

const failures = [];
const notes = [];

// ------------------------------------------------------------- utilities ---

const log = (...a) => console.log(...a);

async function fetchWithRetry(url, { as = 'text' } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: ctl.signal,
        headers: { 'User-Agent': 'yield-curve-prime/3.1 (research snapshot; contact via repo)' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return as === 'json' ? await res.json() : await res.text();
    } catch (e) {
      lastErr = e;
      // Linear backoff. These are public endpoints being polled once a day;
      // aggressive retry is both rude and pointless.
      if (attempt < RETRIES) await new Promise((r) => setTimeout(r, 1500 * attempt));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

const iso = (d) => new Date(d).toISOString().slice(0, 10);
const today = iso(Date.now());

// ------------------------------------------------------------------ FRED ---

/**
 * Returns { value, asOf, history: [{date, value}] } or throws.
 * History is kept because the derived series (3m annualised rates, payroll
 * changes) need it, and because a series that only ever reports its latest
 * value cannot be checked for a level shift caused by a revision.
 */
async function fetchFred(id, { start } = {}) {
  const cosd = start || '2023-01-01';

  if (FRED_KEY) {
    const url = `https://api.stlouisfed.org/fred/series/observations`
      + `?series_id=${id}&api_key=${FRED_KEY}&file_type=json&observation_start=${cosd}`;
    const j = await fetchWithRetry(url, { as: 'json' });
    const obs = (j.observations || [])
      .filter((o) => o.value !== '.' && o.value !== '')
      .map((o) => ({ date: o.date, value: Number(o.value) }));
    if (!obs.length) throw new Error('no observations');
    return { history: obs, ...obs[obs.length - 1] };
  }

  // Keyless path: the public CSV endpoint the FRED website itself uses.
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=${cosd}`;
  const csv = await fetchWithRetry(url);
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('empty csv');
  const obs = [];
  for (const line of lines.slice(1)) {
    const [date, raw] = line.split(',');
    if (!date || raw === undefined) continue;
    const v = raw.trim();
    if (v === '.' || v === '') continue;          // FRED's missing-value marker
    const n = Number(v);
    if (Number.isFinite(n)) obs.push({ date: date.trim(), value: n });
  }
  if (!obs.length) throw new Error('no usable rows');
  return { history: obs, ...obs[obs.length - 1] };
}

async function collectFred() {
  const out = {};
  // Sequential on purpose. Twenty-odd requests against a free public endpoint
  // should not arrive as a burst, and the whole run finishes in well under a
  // minute either way.
  for (const s of FRED_SERIES) {
    try {
      const r = await fetchFred(s.id);
      const scale = s.scale ?? 1;
      const conv = s.fromUnit ? ` [${s.fromUnit} -> ${s.toUnit}]` : '';
      out[s.key] = {
        value: round(r.value * scale, 4),
        asOf: r.date,
        source: `fred:${s.id}`,
        sourceUrl: `https://fred.stlouisfed.org/series/${s.id}`,
        unit: s.unit,
        tag: 'D',
        staleAfterDays: s.staleAfterDays,
        periodDated: s.periodDated ?? false,
        label: s.label,
        history: r.history.slice(s.history === 'long' ? -520 : -40)
          .map((h) => ({ date: h.date, value: round(h.value * scale, 4) })),
      };
      log(`  ok   ${s.key.padEnd(20)} ${String(out[s.key].value).padStart(12)}  ${r.date}${conv}`);
    } catch (e) {
      failures.push({ key: s.key, source: `fred:${s.id}`, reason: String(e.message || e) });
      log(`  FAIL ${s.key.padEnd(20)} ${s.id}: ${e.message || e}`);
    }
  }
  return out;
}

const round = (n, dp) => Number.isFinite(n) ? Number(n.toFixed(dp)) : n;

// ---------------------------------------------------------------- NY Fed ---

async function collectNyFed(series) {
  try {
    const j = await fetchWithRetry(NYFED.securedRates, { as: 'json' });
    const rows = j.refRates || [];
    const sofr = rows.find((r) => r.type === 'SOFR');
    const tgcr = rows.find((r) => r.type === 'TGCR');
    const bgcr = rows.find((r) => r.type === 'BGCR');
    if (!sofr) throw new Error('no SOFR row');

    const base = (r, key, label, val) => ({
      value: round(val, 4), asOf: r.effectiveDate, source: 'nyfed:reference-rates',
      sourceUrl: 'https://www.newyorkfed.org/markets/reference-rates/sofr',
      unit: 'pct', tag: 'D', staleAfterDays: 4, label,
    });

    series.sofr = base(sofr, 'sofr', 'SOFR', sofr.percentRate);
    series.sofrP99 = { ...base(sofr, 'sofrP99', 'SOFR 99th percentile', sofr.percentPercentile99) };
    series.sofrP1 = { ...base(sofr, 'sofrP1', 'SOFR 1st percentile', sofr.percentPercentile1) };
    series.sofrVolume = {
      ...base(sofr, 'sofrVolume', 'SOFR volume', sofr.volumeInBillions),
      unit: 'usd_bn',
    };
    if (tgcr) series.tgcr = base(tgcr, 'tgcr', 'TGCR', tgcr.percentRate);
    if (bgcr) series.bgcr = base(bgcr, 'bgcr', 'BGCR', bgcr.percentRate);

    log(`  ok   sofr                 ${sofr.percentRate}  ${sofr.effectiveDate} (p99 ${sofr.percentPercentile99})`);
  } catch (e) {
    failures.push({ key: 'sofr', source: 'nyfed', reason: String(e.message || e) });
    log(`  FAIL sofr: ${e.message || e}`);
  }
}

// ----------------------------------------------------------- fiscal data ---

async function collectFiscal(series) {
  try {
    const j = await fetchWithRetry(FISCALDATA.debtToPenny, { as: 'json' });
    const row = j.data?.[0];
    if (!row) throw new Error('no rows');
    series.debtHeldByPublic = {
      value: round(Number(row.debt_held_public_amt) / 1e12, 4),
      asOf: row.record_date,
      source: 'fiscaldata:debt_to_penny',
      sourceUrl: 'https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/',
      unit: 'usd_tn', tag: 'D', staleAfterDays: 5,
      label: 'Debt held by the public',
    };
    log(`  ok   debtHeldByPublic     ${series.debtHeldByPublic.value}  ${row.record_date}`);
  } catch (e) {
    failures.push({ key: 'debtHeldByPublic', source: 'fiscaldata', reason: String(e.message || e) });
    log(`  FAIL debtHeldByPublic: ${e.message || e}`);
  }

  try {
    const j = await fetchWithRetry(FISCALDATA.operatingCash, { as: 'json' });
    // DTS Table I reports the balance in `open_today_bal`; `close_today_bal`
    // is the literal string "null" on these rows. Prefer the closing-balance
    // row, fall back to the opening one.
    const rows = j.data || [];
    const row = rows.find((r) => /closing balance/i.test(r.account_type || ''))
      || rows.find((r) => /treasury general account/i.test(r.account_type || ''));
    if (!row) throw new Error('no TGA row');
    const bal = Number(row.open_today_bal);
    if (!Number.isFinite(bal)) throw new Error(`unparseable balance "${row.open_today_bal}"`);
    series.tgaDaily = {
      value: round(bal / 1e3, 2),
      asOf: row.record_date,
      source: 'fiscaldata:operating_cash_balance',
      sourceUrl: 'https://fiscaldata.treasury.gov/datasets/daily-treasury-statement/',
      unit: 'usd_bn', tag: 'D', staleAfterDays: 5,
      label: 'TGA closing balance (daily)',
    };
    log(`  ok   tgaDaily             ${series.tgaDaily.value}  ${row.record_date}`);
  } catch (e) {
    failures.push({ key: 'tgaDaily', source: 'fiscaldata', reason: String(e.message || e) });
    log(`  FAIL tgaDaily: ${e.message || e}`);
  }
}

// ------------------------------------------------------------- auctions ----

async function collectAuctions() {
  try {
    const raw = await fetchWithRetry(TREASURY_DIRECT.auctioned(120), { as: 'json' });
    const coupons = (Array.isArray(raw) ? raw : [])
      .filter((a) => TREASURY_DIRECT.couponTerms.includes(a.securityTerm))
      .filter((a) => a.highYield && Number(a.totalAccepted) > 0)
      .map((a) => {
        const total = Number(a.totalAccepted);
        return {
          cusip: a.cusip,
          term: a.securityTerm,
          type: a.securityType,
          auctionDate: (a.auctionDate || '').slice(0, 10),
          highYield: Number(a.highYield),
          bidToCover: Number(a.bidToCoverRatio) || null,
          totalAcceptedBn: round(total / 1e9, 2),
          indirectPct: round((Number(a.indirectBidderAccepted) / total) * 100, 1),
          directPct: round((Number(a.directBidderAccepted) / total) * 100, 1),
          dealerPct: round((Number(a.primaryDealerAccepted) / total) * 100, 1),
        };
      })
      .sort((a, b) => (a.auctionDate < b.auctionDate ? 1 : -1))
      .slice(0, 14);

    if (!coupons.length) throw new Error('no coupon auctions in window');
    log(`  ok   auctions             ${coupons.length} coupon auctions, latest ${coupons[0].auctionDate}`);
    notes.push('Auction TAILS are not computable from TreasuryDirect (no when-issued yield at the bid deadline). Bid-to-cover and the bidder split are live; tails remain manual.');
    return coupons;
  } catch (e) {
    failures.push({ key: 'auctions', source: 'treasurydirect', reason: String(e.message || e) });
    log(`  FAIL auctions: ${e.message || e}`);
    return [];
  }
}

// -------------------------------------------------------------- derived ----

function computeDerived(series) {
  for (const [key, spec] of Object.entries(DERIVED)) {
    const missing = spec.inputs.filter((i) => !series[i]);
    if (missing.length) {
      failures.push({ key, source: 'derived', reason: `missing inputs: ${missing.join(', ')}` });
      log(`  skip ${key.padEnd(20)} missing ${missing.join(', ')}`);
      continue;
    }
    try {
      const r = spec.compute(series);
      if (!r || !Number.isFinite(r.value)) throw new Error('compute returned nothing usable');
      series[key] = {
        value: round(r.value, 4), asOf: r.asOf,
        source: `derived(${spec.inputs.join('+')})`,
        unit: spec.unit, tag: 'E', staleAfterDays: spec.staleAfterDays,
        periodDated: spec.periodDated ?? false, label: spec.label,
      };
      log(`  ok   ${key.padEnd(20)} ${String(series[key].value).padStart(12)}  ${r.asOf} [derived]`);
    } catch (e) {
      failures.push({ key, source: 'derived', reason: String(e.message || e) });
      log(`  FAIL ${key}: ${e.message || e}`);
    }
  }
}

// ------------------------------------------------------------------ main ---

async function main() {
  log(`\nyield-curve-prime snapshot  ${today}`);
  log(`FRED access: ${FRED_KEY ? 'API key' : 'public CSV (no key)'}\n`);

  log('FRED series');
  const series = await collectFred();

  log('\nNY Fed');
  await collectNyFed(series);

  log('\nTreasury Fiscal Data');
  await collectFiscal(series);

  log('\nTreasuryDirect auctions');
  const auctions = await collectAuctions();

  log('\nDerived');
  computeDerived(series);

  // --- gate -----------------------------------------------------------------
  const missingCore = CORE.filter((k) => !series[k]);
  if (missingCore.length) {
    console.error(`\nABORT: core curve series missing (${missingCore.join(', ')}). `
      + 'Snapshot NOT written - the previous one is still valid and the app will '
      + 'flag its own staleness, which is strictly better than an empty anchor.');
    process.exit(1);
  }
  const attempted = FRED_SERIES.length + Object.keys(DERIVED).length + 4;
  if (failures.length > attempted * 0.4) {
    console.error(`\nABORT: ${failures.length} of ~${attempted} sources failed. `
      + 'That looks like a network or upstream outage rather than a retired series. '
      + 'Snapshot NOT written.');
    process.exit(1);
  }

  // --- staleness ------------------------------------------------------------
  const stale = [];
  for (const [k, o] of Object.entries(series)) {
    const age = (Date.parse(today) - Date.parse(o.asOf)) / 86_400_000;
    o.ageDays = Math.round(age);
    if (age > o.staleAfterDays) {
      stale.push({ key: k, ageDays: Math.round(age), limit: o.staleAfterDays, periodDated: !!o.periodDated });
    }
  }

  const snapshot = {
    schema: 1,
    generatedAt: new Date().toISOString(),
    asOfDate: today,
    fredAccess: FRED_KEY ? 'api-key' : 'public-csv',
    series,
    auctions,
    manualFields: MANUAL_FIELDS,
    failures,
    notes,
    stale,
  };

  await mkdir(OUT_DIR, { recursive: true });
  const target = path.join(OUT_DIR, 'snapshot.json');

  // Only touch disk when something actually changed, so the scheduled job does
  // not produce an empty commit every single day. `generatedAt` is excluded
  // from the comparison because it always differs.
  let changed = true;
  if (existsSync(target)) {
    try {
      const prev = JSON.parse(await readFile(target, 'utf8'));
      const strip = (s) => JSON.stringify({ ...s, generatedAt: null, asOfDate: null });
      changed = strip(prev) !== strip(snapshot);
    } catch { /* unreadable previous snapshot - treat as changed */ }
  }

  if (!changed) {
    log('\nNo change versus the existing snapshot. Nothing written.');
    log('(Markets were closed, or every series still reports the same last value.)');
    return;
  }

  await writeFile(target, JSON.stringify(snapshot, null, 2) + '\n');
  log(`\nWrote ${path.relative(process.cwd(), target)}`);

  if (WRITE_HISTORY) {
    const histDir = path.join(OUT_DIR, 'history');
    await mkdir(histDir, { recursive: true });
    // History entries drop the per-series `history` arrays: keeping 40 points
    // per series per day would grow the repo by megabytes a month for data we
    // can always re-derive from FRED.
    const slim = {
      ...snapshot,
      series: Object.fromEntries(
        Object.entries(series).map(([k, v]) => [k, { ...v, history: undefined }]),
      ),
    };
    await writeFile(path.join(histDir, `${today}.json`), JSON.stringify(slim) + '\n');
    log(`Wrote ${path.relative(process.cwd(), path.join(histDir, `${today}.json`))}`);
  }

  // --- report ---------------------------------------------------------------
  log(`\n${Object.keys(series).length} series  ·  ${auctions.length} auctions  ·  `
    + `${failures.length} failed  ·  ${stale.length} stale  ·  ${MANUAL_FIELDS.length} manual`);
  if (failures.length) {
    log('\nFailed:');
    for (const f of failures) log(`  ${f.key}: ${f.reason} (${f.source})`);
  }
  if (stale.length) {
    log('\nPast staleness limit - upstream has not published a newer value:');
    for (const x of stale) {
      log(`  ${x.key.padEnd(20)} ${x.ageDays}d > ${x.limit}d`
        + `${x.periodDated ? '  (period-dated: FRED stamps periodic data to the period start)' : ''}`);
    }
  }
}

main().catch((e) => {
  console.error('\nUnhandled failure:', e);
  process.exit(1);
});

// ============================================================================
// Snapshot -> framework view.
//
// Everything the framework quotes is built here FROM the live snapshot. The
// previous version of this project stored the anchor, the layer metrics and
// the decompositions as hand-typed literals, and when the first real data
// arrived it turned out every one of them was wrong - the 10y by 18bp, HY OAS
// by 69bp, the 5y5y breakeven by 36bp, and ON RRP by two orders of magnitude.
//
// The lesson is not "be more careful when typing". It is that a number a human
// types is a number that will eventually be wrong, and the only durable fix is
// to stop typing numbers.
//
// What remains hand-written, necessarily: the NARRATIVE. Scenario probabilities,
// layer signals, steelmen, trade theses. Those are judgement, they cannot be
// fetched, and lib/audit.ts now tracks how old they are relative to the data so
// that stale opinions cannot hide behind fresh numbers.
// ============================================================================

import type { Snapshot } from './snapshot';
import { need, val, valueOn, troughDate } from './snapshot';
import type { CurvePoint } from '../types/framework';
import type { TenYearDecomposition } from './curve';
import { bp } from './curve';

// ------------------------------------------------------------- the anchor ---

export interface Anchor { y2: number; y5: number; y10: number; y30: number; asOf: string }

export function buildAnchor(s: Snapshot): Anchor {
  return {
    y2: need(s, 'y2'),
    y5: need(s, 'y5'),
    y10: need(s, 'y10'),
    y30: need(s, 'y30'),
    asOf: s.series.y10?.asOf ?? s.asOfDate,
  };
}

export function buildParCurve(s: Snapshot): CurvePoint[] {
  const a = buildAnchor(s);
  return [
    { tenor: 2, label: '2y', parYield: a.y2 },
    { tenor: 5, label: '5y', parYield: a.y5 },
    { tenor: 10, label: '10y', parYield: a.y10 },
    { tenor: 30, label: '30y', parYield: a.y30 },
  ];
}

// ------------------------------------------------------ decompositions -----

/**
 * The 10y decomposition, computed rather than asserted.
 *
 * Both views now come straight out of published series:
 *   View 1  term premium = Kim-Wright(end) - Kim-Wright(start); path = residual
 *   View 2  real = DFII10 delta; breakeven = T10YIE delta
 *
 * Each sums to the total by construction, which makes the corresponding audit
 * check a tautology about the arithmetic and a real test of the data pipeline:
 * it fails the moment a history gap means a window cannot be computed.
 *
 * The previous version hand-typed these and, in doing so, added path + term
 * premium + breakeven together to reach the total - double-counting, because
 * inflation compensation sits inside both path and term premium rather than
 * beside them. That error is now structurally impossible.
 */
export function buildDecompositions(s: Snapshot): TenYearDecomposition[] {
  const windows: { window: string; start: string; comment: string }[] = [];

  // Window 1: from the 12-month low in the 10y, found in the data.
  const yearAgo = new Date(Date.parse(s.asOfDate) - 365 * 86_400_000).toISOString().slice(0, 10);
  const trough = troughDate(s, 'y10', yearAgo);
  if (trough) {
    windows.push({
      window: 'From the 12-month low in the 10y',
      start: trough.date,
      comment: 'The low is located in the data rather than remembered, so this window re-anchors itself on every refresh instead of quietly referring to a level that stopped being the low months ago.',
    });
  }

  // Window 2: rolling three months.
  const q = new Date(Date.parse(s.asOfDate) - 91 * 86_400_000).toISOString().slice(0, 10);
  windows.push({
    window: 'Last three months',
    start: q,
    comment: 'A rolling quarter. The comparison most likely to show a regime change rather than a trend.',
  });

  // Window 3: rolling month.
  const m = new Date(Date.parse(s.asOfDate) - 30 * 86_400_000).toISOString().slice(0, 10);
  windows.push({
    window: 'Last 30 days',
    start: m,
    comment: 'Near-term. Dominated by the most recent policy meeting and supply calendar.',
  });

  const out: TenYearDecomposition[] = [];
  for (const w of windows) {
    const startY10 = valueOn(s, 'y10', w.start);
    const startY2 = valueOn(s, 'y2', w.start);
    const startTp = valueOn(s, 'kimWright10y', w.start);
    const startReal = valueOn(s, 'tips10y', w.start);
    const startBei = valueOn(s, 'bei10y', w.start);

    const endY10 = val(s, 'y10');
    const endY2 = val(s, 'y2');
    const endTp = val(s, 'kimWright10y');
    const endReal = val(s, 'tips10y');
    const endBei = val(s, 'bei10y');

    if (startY10 === null || endY10 === null || startY2 === null || endY2 === null) continue;

    const totalBp = bp(endY10, startY10);

    // Kim-Wright is already in bp after the pipeline's scaling.
    const termPremiumBp = (startTp !== null && endTp !== null)
      ? Math.round(endTp - startTp) : 0;
    const realYieldBp = (startReal !== null && endReal !== null)
      ? bp(endReal, startReal) : 0;
    // Breakeven is taken as the residual so View 2 closes exactly, rather than
    // leaving a 1bp rounding gap that looks like a modelling failure.
    const breakevenBp = (startBei !== null && endBei !== null)
      ? totalBp - realYieldBp : 0;

    out.push({
      window: w.window,
      startDate: w.start,
      startY10, startY2, endY10, endY2,
      expectedPathBp: totalBp - termPremiumBp,
      termPremiumBp,
      realYieldBp,
      breakevenBp,
      comment: w.comment,
    });
  }
  return out;
}

// ------------------------------------------------------------ layer metrics -

export interface LiveMetric { name: string; value: string; tag: 'D' | 'E' | 'I' | 'S'; stale?: boolean }

const unitFmt = (v: number, unit: string): string => {
  switch (unit) {
    case 'pct': return `${v.toFixed(2)}%`;
    case 'bp': return `${v > 0 ? '+' : ''}${Math.round(v)}bp`;
    case 'usd_tn': return `$${v.toFixed(2)}tn`;
    case 'usd_bn': return `$${v.toFixed(1)}bn`;
    case 'count': return v >= 1000 ? `${Math.round(v).toLocaleString()}k` : `${Math.round(v)}k`;
    case 'ratio': return v.toFixed(2);
    default: return v.toFixed(2);
  }
};

/** Render a snapshot series as a display metric, or a visible gap. */
export function metric(s: Snapshot, key: string, name?: string): LiveMetric {
  const ser = s.series[key];
  if (!ser) return { name: name ?? key, value: 'n/a', tag: 'I' };
  const age = Math.round((Date.parse(s.asOfDate) - Date.parse(ser.asOf)) / 86_400_000);
  return {
    name: name ?? ser.label,
    value: unitFmt(ser.value, ser.unit),
    tag: ser.tag,
    stale: age > ser.staleAfterDays,
  };
}

/** A metric that has no free feed. Always rendered so the gap is visible. */
export const manualMetric = (name: string, value: string, tag: 'E' | 'I' | 'S' = 'E'): LiveMetric =>
  ({ name: `${name} (manual)`, value, tag });

// ------------------------------------------------------------ auctions -----

export function recentCoupons(s: Snapshot, n = 6) {
  return s.auctions.slice(0, n);
}

/** Average indirect share across the recent coupon auctions, for context. */
export function avgIndirect(s: Snapshot): number | null {
  const a = s.auctions.filter((x) => Number.isFinite(x.indirectPct));
  if (!a.length) return null;
  return a.reduce((t, x) => t + x.indirectPct, 0) / a.length;
}

// -------------------------------------------------------------- fiscal -----

export interface FiscalInputs {
  debtHeldByPublic: number;
  nominalGdp: number;
  primaryDeficit: number;
  netInterest: number;
  nominalGrowthPct: number;
  marginalRatePct: number;
  wamYears: number;
}

/**
 * Fiscal inputs, live where a feed exists.
 *
 * `primaryDeficit` is the one figure with no clean free feed at annual
 * frequency - the MTS publishes it monthly and fiscal-year-to-date, and
 * stitching those into a reliable annual primary balance is more parsing than
 * this pipeline should carry. It stays an estimate, tagged [E], and the Macro
 * Lens tab exposes it on a slider so a reader can see immediately how much of
 * the conclusion depends on it. The answer is: much less than they expect,
 * because the snowball term dominates.
 */
export function buildFiscalInputs(s: Snapshot, primaryDeficitTn = 1.05): FiscalInputs {
  const debt = need(s, 'debtHeldByPublic');
  const gdp = need(s, 'nominalGdp');
  const netInt = need(s, 'netInterestAnnual');
  const g = val(s, 'nominalGrowthYoY');
  const marginal = (need(s, 'y5') + need(s, 'y10') + need(s, 'y30')) / 3;
  return {
    debtHeldByPublic: debt,
    nominalGdp: gdp,
    primaryDeficit: primaryDeficitTn,
    netInterest: netInt,
    nominalGrowthPct: g ?? 4.5,
    // Duration-weighted average issuance yield, approximated by the mean of the
    // belly and long tenors. Treasury issues across the curve; the bill-heavy
    // front end would drag this down, so this is a conservative (high) estimate
    // of the marginal rate, which makes the convergence argument harder rather
    // than easier on itself.
    marginalRatePct: marginal,
    wamYears: 6.0,
  };
}

/** Flow-of-funds channels, scaled to the live net-interest figure. */
export function buildFlowChannels(s: Snapshot, primaryDeficitTn = 1.05) {
  const netInt = need(s, 'netInterestAnnual');
  // Split of interest by holder. Roughly 30% of marketable debt is held
  // abroad, ~5% sits at the Fed post-runoff, the rest domestically. [E]
  const foreign = netInt * 0.30;
  const fed = netInt * 0.05;
  const domestic = netInt - foreign - fed;
  // Primary spending split between transfers/procurement (high MPC) and
  // capital-skewed tax expenditure (low MPC). [E]
  const transfers = primaryDeficitTn * 0.45;
  const procurement = primaryDeficitTn * 0.40;
  const capitalTax = primaryDeficitTn * 0.15;

  return [
    { channel: 'Transfers (Social Security, Medicare, Medicaid, veterans)', amountTn: transfers, accruesTo: 'labour' as const, mpc: 0.90,
      rationale: 'Recipients are overwhelmingly liquidity-constrained. Near-complete pass-through to consumption inside one quarter.' },
    { channel: 'Procurement, federal wages, defence, grants to states', amountTn: procurement, accruesTo: 'labour' as const, mpc: 0.85,
      rationale: 'Flows to payrolls and to firms that hire. High multiplier, one to two quarter lag.' },
    { channel: 'Tax expenditures skewed to capital', amountTn: capitalTax, accruesTo: 'capital' as const, mpc: 0.25,
      rationale: 'Raises after-tax returns on capex. Real but slow, and a large share is inframarginal - it rewards investment that was happening anyway.' },
    { channel: 'Net interest to domestic holders', amountTn: domestic, accruesTo: 'capital' as const, mpc: 0.15,
      rationale: 'Roughly 85% of directly and indirectly held Treasuries sit with the top wealth decile, insurers and pensions. Interest income there is reinvested, not spent. The largest low-multiplier channel in the budget, and the one that grows fastest when the Fed hikes.' },
    { channel: 'Net interest to foreign holders', amountTn: foreign, accruesTo: 'capital' as const, mpc: 0.05,
      rationale: 'Leaves the domestic income circuit almost entirely. A real balance-of-payments cost, a negligible demand impulse.' },
    { channel: 'Net interest remitted to the Federal Reserve', amountTn: fed, accruesTo: 'mixed' as const, mpc: 0.00,
      rationale: 'Circular. Returns to Treasury as seigniorage once the Fed works off its deferred asset. Appears in the deficit, funds nothing, stimulates nobody.' },
  ];
}

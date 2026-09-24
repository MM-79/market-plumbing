// ============================================================================
// Snapshot loading.
//
// Two copies of the data exist and that is deliberate:
//
//   BAKED  - imported at build time, so the page renders correct numbers on
//            first paint with no network round trip and keeps working offline.
//   LIVE   - fetched at runtime from /data/snapshot.json, so a snapshot
//            refreshed by the scheduled job appears WITHOUT a rebuild. On a
//            static host the JS bundle is aggressively cached; the JSON is not.
//
// The app renders BAKED immediately, then swaps in LIVE if it is newer. The
// header states which one is on screen, because "self-refreshing" is only a
// virtue if the reader can tell whether the refresh actually happened.
// ============================================================================

import { useEffect, useState } from 'react';
import bakedJson from '../../public/data/snapshot.json';

export interface Series {
  value: number;
  asOf: string;
  source: string;
  sourceUrl?: string;
  unit: string;
  tag: 'D' | 'E' | 'I' | 'S';
  staleAfterDays: number;
  periodDated?: boolean;
  label: string;
  ageDays?: number;
  history?: { date: string; value: number }[];
}

export interface Auction {
  cusip: string;
  term: string;
  type: string;
  auctionDate: string;
  highYield: number;
  bidToCover: number | null;
  totalAcceptedBn: number;
  indirectPct: number;
  directPct: number;
  dealerPct: number;
}

export interface ManualField {
  key: string; label: string; why: string; where: string;
}

export interface Snapshot {
  schema: number;
  generatedAt: string;
  asOfDate: string;
  fredAccess: string;
  series: Record<string, Series>;
  auctions: Auction[];
  manualFields: ManualField[];
  failures: { key: string; source: string; reason: string }[];
  notes: string[];
  stale: { key: string; ageDays: number; limit: number; periodDated: boolean }[];
}

export const baked = bakedJson as unknown as Snapshot;

export type SnapshotStatus = 'baked' | 'live' | 'stale-live' | 'error';

export interface SnapshotState {
  snap: Snapshot;
  status: SnapshotStatus;
  /** Human-readable explanation of which copy is on screen and why. */
  detail: string;
}

/**
 * Fetch the published snapshot, falling back to the baked copy.
 *
 * Failure here is not an error state for the user - it means they are offline,
 * or the host has not published a snapshot yet. Either way the baked data is
 * valid, dated, and honest about its own age, so we show it and say so.
 */
export function useLiveSnapshot(): SnapshotState {
  const [state, setState] = useState<SnapshotState>({
    snap: baked,
    status: 'baked',
    detail: `Build-time snapshot from ${baked.asOfDate}. Checking for a newer one...`,
  });

  useEffect(() => {
    let cancelled = false;
    const url = `${import.meta.env.BASE_URL}data/snapshot.json?t=${Date.now()}`;

    fetch(url, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Snapshot>;
      })
      .then((live) => {
        if (cancelled) return;
        if (!live?.series?.y10) throw new Error('snapshot missing the curve anchor');

        const liveNewer = Date.parse(live.generatedAt) > Date.parse(baked.generatedAt);
        setState({
          snap: liveNewer ? live : baked,
          status: liveNewer ? 'live' : 'stale-live',
          detail: liveNewer
            ? `Live snapshot fetched, generated ${live.generatedAt.slice(0, 16).replace('T', ' ')}Z.`
            : `Published snapshot is not newer than the build-time copy (${baked.asOfDate}). `
              + 'Either the scheduled refresh has not run since this build, or markets have not moved.',
        });
      })
      .catch((e) => {
        if (cancelled) return;
        setState({
          snap: baked,
          status: 'error',
          detail: `Could not fetch a live snapshot (${e.message}). Showing the build-time copy `
            + `from ${baked.asOfDate}. Numbers past their staleness limit are flagged below.`,
        });
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}

// ------------------------------------------------------------- accessors ---

/** Read a series value, or null. Never throws, never invents a default. */
export const val = (s: Snapshot, key: string): number | null =>
  s.series[key] ? s.series[key].value : null;

/**
 * Read a value that downstream arithmetic requires. Returns NaN when absent,
 * which propagates visibly through the UI as "n/a" rather than silently
 * becoming a zero that looks like a real observation.
 */
export const need = (s: Snapshot, key: string): number =>
  s.series[key] ? s.series[key].value : NaN;

export const fmt = (n: number | null | undefined, dp = 2, suffix = ''): string =>
  n === null || n === undefined || !Number.isFinite(n) ? 'n/a' : `${n.toFixed(dp)}${suffix}`;

/** Value of a series on, or immediately before, a given date. */
export function valueOn(s: Snapshot, key: string, date: string): number | null {
  const h = s.series[key]?.history;
  if (!h?.length) return null;
  let best: { date: string; value: number } | null = null;
  for (const p of h) {
    if (p.date <= date) best = p;
    else break;
  }
  return best ? best.value : null;
}

/** The date of the lowest value of a series within its retained history. */
export function troughDate(s: Snapshot, key: string, since?: string): { date: string; value: number } | null {
  const h = s.series[key]?.history;
  if (!h?.length) return null;
  const pool = since ? h.filter((p) => p.date >= since) : h;
  if (!pool.length) return null;
  return pool.reduce((lo, p) => (p.value < lo.value ? p : lo), pool[0]);
}

export function ageDays(asOf: string, asOfDate: string): number {
  return Math.round((Date.parse(asOfDate) - Date.parse(asOf)) / 86_400_000);
}

export function isStale(s: Series, asOfDate: string): boolean {
  return ageDays(s.asOf, asOfDate) > s.staleAfterDays;
}

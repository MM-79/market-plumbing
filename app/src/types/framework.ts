// ============================================================================
// Yield-Curve-Prime — core type contracts
//
// WHY THIS FILE EXISTS
// The v1 framework stored market state as loose object literals. A single
// mistyped key (`s5s30s` instead of `s5s30`) rendered a blank column in three
// of twelve scenario path rows and nobody noticed, because nothing in the
// system had an opinion about what a path row must contain. Types are the
// cheapest possible auditor: they run on every keystroke and cost nothing.
//
// Rule of the house: if a number is quoted to the reader, it either carries a
// provenance tag or it is DERIVED by src/lib/curve.ts from something that does.
// ============================================================================

/** Evidence tag required on every quantitative claim (Leviathan §3.1). */
export type Tag = 'D' | 'E' | 'I' | 'S';

export const TAG_MEANING: Record<Tag, string> = {
  D: 'Data — observed value, with date and source',
  E: 'Estimate — modelled or inferred from data, method stated',
  I: 'Inference — reasoned conclusion, not measured',
  S: 'Speculation — plausible mechanism, no supporting observation yet',
};

/** A number that knows where it came from and how old it is. */
export interface Observation {
  value: number;
  unit: 'pct' | 'bp' | 'usd_bn' | 'usd_tn' | 'index' | 'ratio' | 'count';
  tag: Tag;
  asOf: string;            // ISO date of the observation itself, NOT the run date
  source: string;          // short source key, must exist in SOURCES
  /** Max age in days before the UI marks this stale. Weekly series get 10, daily get 4. */
  staleAfterDays: number;
  note?: string;
}

/** Tenor in years. Kept numeric so curve math can actually use it. */
export type TenorYears = number;

export interface CurvePoint {
  tenor: TenorYears;
  label: string;           // '2y', '10y' — display only
  parYield: number;        // percent, e.g. 5.14
}

/**
 * Scenario keys. 'D' was added in v3.0: the framework offered only grind, doom
 * and recession, so the distribution had no branch in which yields fall for a
 * good reason. Widening this union forced every downstream consumer - trade
 * mappings, the scorecard, the institution lens - to say something about that
 * branch rather than silently omit it.
 */
export type ScenarioKey = 'A' | 'B' | 'C' | 'D';

/**
 * One row of a scenario path, MATERIALISED against the live anchor.
 *
 * This is now an output type, not an input type. Nobody writes one of these by
 * hand; `materialisePath()` builds them from the live curve plus a PathDelta.
 * Spreads are still deliberately absent - they are derived at render time by
 * `spreads()`, so a spread can never disagree with the yields it comes from.
 */
export interface PathRow {
  label: string;
  monthsAhead: 0 | 1 | 3 | 6;
  fedFundsLow: number;
  fedFundsHigh: number;
  y2: number;
  y5: number;
  y10: number;
  y30: number;
  termPremium: number;     // bp
  swapSpread10y: number;   // bp, negative = swaps through Treasuries
  sofrMinusIorb: number;   // bp
  mortgage30y: number;     // percent
  igOas: number;           // bp
  hyOas: number;           // bp
  move: number;            // index
}

/**
 * What an analyst actually writes: a view about CHANGE, expressed in basis
 * points from wherever the market happens to be today.
 *
 * This is the second-order version of the same lesson that removed spreads from
 * PathRow. v3.0 stored absolute levels, which meant every scenario silently
 * decayed the moment the market moved - the paths had been drawn against a 5.14
 * 10y and the tape was at 4.96, so all four scenarios were describing a world
 * that no longer existed. Storing deltas makes the paths REBASE THEMSELVES on
 * every data refresh.
 *
 * Two fields stay absolute on purpose. `fedFunds*` is a view about a policy
 * level, not a drift from today's level. `move` is absolute because the MOVE
 * index has no free feed, so there is no live base to apply a delta to.
 */
export interface PathDelta {
  label: string;
  monthsAhead: 0 | 1 | 3 | 6;
  fedFundsLow: number;
  fedFundsHigh: number;
  dy2: number;             // bp from today
  dy5: number;
  dy10: number;
  dy30: number;
  dTermPremium: number;    // bp
  dSwapSpread: number;     // bp
  dSofrIorb: number;       // bp
  dMortgage: number;       // bp
  dIgOas: number;          // bp
  dHyOas: number;          // bp
  move: number;            // absolute index level
}

export interface Scenario {
  key: ScenarioKey;
  name: string;
  subtitle: string;
  probability: number;              // integers, must sum to 100 across scenarios
  priorProbability: number;         // last run's probability — forces an explicit delta
  definition: string;
  triggers: string[];
  signposts: string[];
  path: PathDelta[];
  curveShape: string;
  analog: { episode: string; why: string; biggerOrSmaller: string };
  invalidation: string;
  /** What the market is telling you vs what the Fed is telling you (Sehgal §1). */
  dualNarrative: { market: string; fed: string; divergence: string };
}

/** Trade expression with an explicit asymmetry test (Sehgal §6). */
export interface TradeExpression {
  name: string;
  type: 'Curve' | 'Swap Spread' | 'Credit' | 'Breakevens' | 'Vol' | 'Basis' | 'Cross-Asset';
  scenarios: ScenarioKey[];
  entry: string;
  /** DV01 weighting, where the trade is a spread. */
  sizing: string;
  carryBpPerQuarter: number;        // negative = costs money to hold
  targetBp: number;                 // gain in bp of the spread/level if right
  stopBp: number;                   // loss in bp if wrong
  invalidation: string;
  /** Sehgal's asymmetry test: is the payoff bounded-linear or multiplicative? */
  payoffShape: 'linear-bounded' | 'convex' | 'multiplicative';
  asymmetryNote: string;
}

export interface SourceRef {
  key: string;
  title: string;
  url: string;
  cadence: string;
}

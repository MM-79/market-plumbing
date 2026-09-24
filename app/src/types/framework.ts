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
 * One row of a scenario path. Every field is REQUIRED and numeric.
 *
 * v1 stored these as strings ('4.75') which made them uncheckable — you cannot
 * assert that 2s10s equals 10y minus 2y on a string. Spreads are deliberately
 * ABSENT from this type: they are derived in curve.ts, never authored, so they
 * can never disagree with the yields they are supposedly computed from.
 */
export interface PathRow {
  label: string;           // 'Today' | 'Month 1' | 'Month 3' | 'Month 6'
  monthsAhead: 0 | 1 | 3 | 6;
  fedFundsLow: number;
  fedFundsHigh: number;
  y2: number;
  y5: number;              // v1 quoted 5s30s with no 5y anywhere in the table
  y10: number;
  y30: number;
  acmTermPremium: number;  // bp
  swapSpread10y: number;   // bp, negative = swaps through Treasuries
  sofrMinusIorb: number;   // bp
  mortgage30y: number;     // percent
  igOas: number;           // bp
  hyOas: number;           // bp
  move: number;            // index
}

/**
 * Scenario keys. 'D' was added in v3: v1 offered only grind, doom and
 * recession, so the distribution had no branch in which yields fall for a good
 * reason. Widening this union is what forced every downstream consumer - trade
 * mappings, the scorecard, the institution lens - to say something about that
 * branch rather than silently omit it.
 */
export type ScenarioKey = 'A' | 'B' | 'C' | 'D';

export interface Scenario {
  key: ScenarioKey;
  name: string;
  subtitle: string;
  probability: number;              // integers, must sum to 100 across scenarios
  priorProbability: number;         // last run's probability — forces an explicit delta
  definition: string;
  triggers: string[];
  signposts: string[];
  path: PathRow[];
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

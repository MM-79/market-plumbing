// ============================================================================
// Curve analytics - par to zero to forward, DV01, hedge ratios, carry & roll.
//
// Everything the dashboard quotes as a SPREAD or a FORWARD is computed here
// from par yields. Nothing is hand-typed. That is the whole point: in v1 the
// par-curve panel said 2s10s = +21bp while the scenario tables said +39bp,
// because both numbers were typed by hand from different snapshots. A spread
// is not a fact to be remembered; it is a function of two facts.
//
// Conventions: semiannual coupons, act/act, par yields in percent.
// ============================================================================

import type { CurvePoint, PathRow, TenorYears } from '../types/framework';

// ---------------------------------------------------------------- spreads ---

export const bp = (a: number, b: number): number => Math.round((a - b) * 100);

export interface CurveSpreads {
  s2s10: number;
  s5s30: number;
  s2s30: number;
  s5s10: number;
  /** Butterfly: 2 * belly - wings. Positive = belly cheap to the wings. */
  fly2s5s10: number;
  fly5s10s30: number;
}

export function spreads(p: { y2: number; y5: number; y10: number; y30: number }): CurveSpreads {
  return {
    s2s10: bp(p.y10, p.y2),
    s5s30: bp(p.y30, p.y5),
    s2s30: bp(p.y30, p.y2),
    s5s10: bp(p.y10, p.y5),
    fly2s5s10: Math.round((2 * p.y5 - p.y2 - p.y10) * 100),
    fly5s10s30: Math.round((2 * p.y10 - p.y5 - p.y30) * 100),
  };
}

/** Curve regime, named from the two-dimensional move rather than asserted. */
export type Regime =
  | 'bear steepener' | 'bear flattener'
  | 'bull steepener' | 'bull flattener'
  | 'bear twist' | 'bull twist' | 'parallel' | 'unchanged';

/**
 * Leviathan section 2.2: "do not assume a bear steepener without measuring it
 * per window." This measures it. Direction comes from the sum of the wings;
 * shape comes from the change in 2s10s.
 */
export function classifyRegime(
  start: { y2: number; y10: number },
  end: { y2: number; y10: number },
  thresholdBp = 3,
): { regime: Regime; d10: number; d2: number; dSlope: number } {
  const d10 = bp(end.y10, start.y10);
  const d2 = bp(end.y2, start.y2);
  const dSlope = bp(end.y10 - end.y2, start.y10 - start.y2);

  if (Math.abs(d10) < thresholdBp && Math.abs(d2) < thresholdBp) {
    return { regime: 'unchanged', d10, d2, dSlope };
  }
  const bear = d10 + d2 > 0;

  // A twist is wings moving in opposite directions, not merely a slope change.
  if (Math.sign(d10) !== Math.sign(d2) && Math.abs(d10) > thresholdBp && Math.abs(d2) > thresholdBp) {
    return { regime: bear ? 'bear twist' : 'bull twist', d10, d2, dSlope };
  }
  if (Math.abs(dSlope) < thresholdBp) return { regime: 'parallel', d10, d2, dSlope };

  const steep = dSlope > 0;
  return {
    regime: `${bear ? 'bear' : 'bull'} ${steep ? 'steepener' : 'flattener'}` as Regime,
    d10, d2, dSlope,
  };
}

// ------------------------------------------------- par to zero to forwards ---

/** Linear interpolation of par yields onto an arbitrary tenor. */
export function interpPar(curve: CurvePoint[], t: TenorYears): number {
  const s = [...curve].sort((a, b) => a.tenor - b.tenor);
  if (t <= s[0].tenor) return s[0].parYield;
  if (t >= s[s.length - 1].tenor) return s[s.length - 1].parYield;
  for (let i = 0; i < s.length - 1; i++) {
    const a = s[i], b = s[i + 1];
    if (t >= a.tenor && t <= b.tenor) {
      const w = (t - a.tenor) / (b.tenor - a.tenor);
      return a.parYield + w * (b.parYield - a.parYield);
    }
  }
  return s[s.length - 1].parYield;
}

/**
 * Bootstrap semiannual zero-coupon discount factors from the par curve.
 *
 * A par bond at tenor n pays c/2 each period and 100 at maturity, priced at
 * 100, so:   DF_n = (1 - (c/2) * sum(DF_i, i<n)) / (1 + c/2)
 *
 * Honest caveat: with only 2y/5y/10y/30y quoted we linearly interpolate par
 * yields onto the semiannual grid before bootstrapping. Linear-on-par is a
 * cruder interpolator than monotone-convex or a Nelson-Siegel-Svensson fit; it
 * is adequate for the spread and forward arithmetic we quote in the 2-30y
 * range, and it is wrong in the 0-2y stub where we have no data at all. We do
 * not quote anything inside 2y off this curve. See docs/DATA_DICTIONARY.md.
 */
export function bootstrapDiscountFactors(curve: CurvePoint[], maxYears = 30): number[] {
  const periods = maxYears * 2;
  const df: number[] = [];
  let sum = 0;
  for (let i = 1; i <= periods; i++) {
    const t = i / 2;
    const c = interpPar(curve, t) / 100;
    const dfi = (1 - (c / 2) * sum) / (1 + c / 2);
    df.push(dfi);
    sum += dfi;
  }
  return df;
}

/** Semiannually-compounded zero rate, in percent, at tenor t. */
export function zeroRate(df: number[], t: TenorYears): number {
  const i = Math.round(t * 2) - 1;
  const d = df[Math.max(0, Math.min(df.length - 1, i))];
  return (Math.pow(1 / d, 1 / (2 * t)) - 1) * 2 * 100;
}

/**
 * Implied forward rate covering [start, start+tenor], in percent.
 *
 * 5y5y (start=5, tenor=5) is the market's cleanest read on "the terminal rate,
 * plus whatever term premium is demanded to own that terminal rate" - which is
 * precisely the quantity Parts 1 and 2 spend their time arguing about. Quoting
 * the spot 10y in that argument is a category error: the spot 10y is
 * contaminated by the next two years of policy, which is the one part of the
 * path nobody disputes.
 */
export function forwardRate(df: number[], start: TenorYears, tenor: TenorYears): number {
  const i0 = Math.round(start * 2) - 1;
  const i1 = Math.round((start + tenor) * 2) - 1;
  const d0 = df[Math.max(0, i0)];
  const d1 = df[Math.max(0, i1)];
  return (Math.pow(d0 / d1, 1 / (2 * tenor)) - 1) * 2 * 100;
}

// ---------------------------------------------------------- risk & sizing ---

/**
 * DV01 per $1mm notional of a PAR bond, in dollars.
 * Closed form for a par bond, semiannual: Dmod = (1/y)(1 - (1+y/2)^(-2n)).
 * Sanity anchors: 10y at 5.14% gives $774/mm; 30y at 5.34% gives $1,487/mm.
 */
export function dv01PerMM(parYieldPct: number, years: number): number {
  const y = parYieldPct / 100;
  if (y <= 0) return 1e6 * years * 1e-4;
  const dmod = (1 / y) * (1 - Math.pow(1 + y / 2, -2 * years));
  return 1e6 * dmod * 1e-4;
}

/**
 * DV01-neutral leg ratio for a spread trade (Leviathan Part 5).
 * Returns the notional of the FRONT leg required per $100mm of the BACK leg.
 *
 * A 5s30s steepener is not "sell 100mm 5y, buy 100mm 30y". At today's levels
 * the 30y carries 3.4x the risk per million of the 5y, and ignoring that turns
 * a curve view into an accidental outright duration position - the single
 * most common way a correct curve call still loses money.
 */
export function dv01NeutralRatio(
  front: { parYieldPct: number; years: number },
  back: { parYieldPct: number; years: number },
): { frontPer100mmBack: number; frontDv01: number; backDv01: number } {
  const f = dv01PerMM(front.parYieldPct, front.years);
  const b = dv01PerMM(back.parYieldPct, back.years);
  return { frontPer100mmBack: (b / f) * 100, frontDv01: f, backDv01: b };
}

/**
 * Roll-down in bp over `months` for a single leg: how much lower (or higher)
 * the bond's quoted yield will be once it has aged, holding the curve still.
 * Positive = yield falls as it ages = the holder gains.
 */
export function rollDownBp(curve: CurvePoint[], tenor: TenorYears, months: number): number {
  const aged = Math.max(0.5, tenor - months / 12);
  return bp(interpPar(curve, tenor), interpPar(curve, aged));
}

/** Carry-and-roll on a curve spread trade, in bp of the spread, over `months`. */
export function spreadCarryRoll(
  curve: CurvePoint[],
  frontTenor: TenorYears,
  backTenor: TenorYears,
  months: number,
): { frontRoll: number; backRoll: number; netRollBp: number } {
  const frontRoll = rollDownBp(curve, frontTenor, months);
  const backRoll = rollDownBp(curve, backTenor, months);
  return { frontRoll, backRoll, netRollBp: backRoll - frontRoll };
}

// --------------------------------------------------------- decomposition ---

/**
 * Split a change in the 10y two ways. The two splits are ORTHOGONAL views of
 * the same move and must each sum to the total on their own.
 *
 * v1 slipped on exactly this: it wrote "~35bp path + 32bp term premium + 35bp
 * breakeven = 102bp", which double-counts. Inflation compensation does not sit
 * alongside path and term premium - it sits inside both of them. Keeping the
 * two decompositions in separate fields makes the error impossible to type.
 */
export interface TenYearDecomposition {
  window: string;
  startDate: string;
  startY10: number;
  startY2: number;
  endY10: number;
  endY2: number;
  // View 1 - risk-neutral expectation vs risk premium. Sums to total.
  expectedPathBp: number;
  termPremiumBp: number;
  // View 2 - real yield vs inflation compensation. ALSO sums to total.
  realYieldBp: number;
  breakevenBp: number;
  comment: string;
}

export function decompositionCheck(d: TenYearDecomposition) {
  const totalBp = bp(d.endY10, d.startY10);
  return {
    totalBp,
    view1Residual: totalBp - (d.expectedPathBp + d.termPremiumBp),
    view2Residual: totalBp - (d.realYieldBp + d.breakevenBp),
    regime: classifyRegime(
      { y2: d.startY2, y10: d.startY10 },
      { y2: d.endY2, y10: d.endY10 },
    ),
  };
}

// ------------------------------------------------------------- path utils ---

export const pathSpreads = (r: PathRow) => spreads(r);

export const fedFundsMid = (r: PathRow) => (r.fedFundsLow + r.fedFundsHigh) / 2;

/** Curve points implied by a scenario path row, for charting. */
export const rowToCurve = (r: PathRow): CurvePoint[] => [
  { tenor: 2, label: '2y', parYield: r.y2 },
  { tenor: 5, label: '5y', parYield: r.y5 },
  { tenor: 10, label: '10y', parYield: r.y10 },
  { tenor: 30, label: '30y', parYield: r.y30 },
];

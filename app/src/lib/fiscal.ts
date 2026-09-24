// ============================================================================
// Fiscal arithmetic - debt dynamics and the flow-of-funds decomposition.
//
// This module exists because the v1 framework asserted "fiscal doom" from a
// headline deficit number and never once wrote down the debt dynamics
// equation. The equation is not controversial, it is not new, and it takes one
// line. Any argument about debt sustainability that does not contain it is a
// vibe, and vibes have been short the long end since 2011.
// ============================================================================

/**
 * The standard debt-dynamics identity.
 *
 *   d(D/Y) = primaryDeficit/Y + (r - g) * (D/Y)
 *
 * where r is the EFFECTIVE interest rate actually paid on the stock (not the
 * marginal rate on new issuance) and g is NOMINAL GDP growth (not real).
 *
 * The entire debt-sustainability debate reduces to the sign of (r - g). While
 * nominal growth exceeds the effective coupon, the stock deflates itself and a
 * primary deficit can be run indefinitely without the ratio exploding. This is
 * not a trick - it is how the United States went from 106% debt/GDP in 1946 to
 * under 40% by 1970 while never once running a meaningful primary surplus.
 */
export interface DebtDynamicsInput {
  debtHeldByPublic: number;   // $tn
  nominalGdp: number;         // $tn
  primaryDeficit: number;     // $tn, positive = deficit
  netInterest: number;        // $tn
  nominalGrowthPct: number;   // %
}

export interface DebtDynamicsResult {
  debtToGdp: number;          // ratio
  primaryDeficitPctGdp: number;
  netInterestPctGdp: number;
  headlineDeficitPctGdp: number;
  effectiveRatePct: number;   // r
  nominalGrowthPct: number;   // g
  rMinusG: number;
  snowballPctGdp: number;     // (r-g) * D/Y, the automatic term
  annualChangePctGdp: number; // total d(D/Y)
  yearsTo150: number | null;  // at this pace, years until debt/GDP hits 150%
  verdict: string;
}

export function debtDynamics(i: DebtDynamicsInput): DebtDynamicsResult {
  const debtToGdp = i.debtHeldByPublic / i.nominalGdp;
  const effectiveRatePct = (i.netInterest / i.debtHeldByPublic) * 100;
  const rMinusG = effectiveRatePct - i.nominalGrowthPct;
  const snowballPctGdp = (rMinusG / 100) * debtToGdp * 100;
  const primaryDeficitPctGdp = (i.primaryDeficit / i.nominalGdp) * 100;
  const netInterestPctGdp = (i.netInterest / i.nominalGdp) * 100;
  const annualChangePctGdp = primaryDeficitPctGdp + snowballPctGdp;

  const yearsTo150 = annualChangePctGdp > 0
    ? (150 - debtToGdp * 100) / annualChangePctGdp
    : null;

  const verdict =
    annualChangePctGdp <= 0
      ? 'Ratio is FALLING. Nominal growth is outrunning the effective coupon by more than the primary deficit adds.'
      : annualChangePctGdp < 2
        ? `Ratio rises ${annualChangePctGdp.toFixed(1)}pp/yr. Uncomfortable, not explosive. This is a slow leak, and slow leaks get fixed by growth, inflation or one modest tax bill.`
        : annualChangePctGdp < 4
          ? `Ratio rises ${annualChangePctGdp.toFixed(1)}pp/yr. This is the zone where the market starts demanding term premium for the trajectory rather than the level.`
          : `Ratio rises ${annualChangePctGdp.toFixed(1)}pp/yr. Spiral arithmetic. At this pace the market will price the fiscal path, not the policy path.`;

  return {
    debtToGdp, primaryDeficitPctGdp, netInterestPctGdp,
    headlineDeficitPctGdp: primaryDeficitPctGdp + netInterestPctGdp,
    effectiveRatePct, nominalGrowthPct: i.nominalGrowthPct,
    rMinusG, snowballPctGdp, annualChangePctGdp, yearsTo150, verdict,
  };
}

/**
 * The effective rate is a lagging average of past issuance. It converges on the
 * marginal rate over roughly one weighted-average-maturity. This projects that
 * convergence, which is the honest counter to the comfortable r-g arithmetic:
 * today's r is low because the stock was issued when rates were zero.
 */
export function effectiveRatePath(
  currentEffectivePct: number,
  marginalRatePct: number,
  wamYears: number,
  years: number,
): number[] {
  const out: number[] = [];
  for (let t = 0; t <= years; t++) {
    const share = Math.min(1, t / wamYears);
    out.push(currentEffectivePct + share * (marginalRatePct - currentEffectivePct));
  }
  return out;
}

/**
 * Sehgal's central move: a dollar of deficit is not a dollar of stimulus.
 * Decompose spending by WHO RECEIVES IT and apply a marginal propensity to
 * consume to each channel.
 *
 * Interest expense accrues overwhelmingly to holders of financial assets, who
 * are concentrated in the top decile and whose MPC out of interest income is
 * low. Primary spending - transfers, procurement, wages - reaches households
 * whose MPC is high. A headline deficit that is half interest expense delivers
 * roughly half the demand impulse the headline implies.
 *
 * The reflexive sting: raising policy rates INCREASES the transfer to capital,
 * which increases the headline deficit, which the bond market reads as more
 * supply. But it does not increase demand much, because the recipients do not
 * spend it. So tightening makes the fiscal headline worse and the inflation
 * impulse smaller at the same time - and the market consistently trades the
 * headline.
 */
export interface FlowChannel {
  channel: string;
  amountTn: number;
  accruesTo: 'labour' | 'capital' | 'mixed';
  mpc: number;          // marginal propensity to consume, [E]
  rationale: string;
}

export function effectiveStimulus(channels: FlowChannel[], nominalGdp: number) {
  const headline = channels.reduce((a, c) => a + c.amountTn, 0);
  const effective = channels.reduce((a, c) => a + c.amountTn * c.mpc, 0);
  return {
    headlineTn: headline,
    effectiveTn: effective,
    headlinePctGdp: (headline / nominalGdp) * 100,
    effectivePctGdp: (effective / nominalGdp) * 100,
    leakageTn: headline - effective,
    multiplier: effective / headline,
  };
}

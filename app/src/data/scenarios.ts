// ============================================================================
// Scenarios A-D, stored as DELTAS from the live anchor.
//
// WHY DELTAS (the change that matters most in this file)
//
// v3.0 stored absolute path levels. They were drawn against a 10y of 5.14%.
// The first time real data arrived the tape was at 4.96%, the 5y5y breakeven
// was 2.36% rather than 2.72%, and HY OAS was 273bp rather than 342bp - so all
// four scenarios were describing a market that did not exist, and the audit
// failed on every path simultaneously.
//
// A scenario is not a view about levels. It is a view about CHANGE: "the long
// end sells off 50bp and the front does not follow." That view survives the
// market moving underneath it. Storing deltas makes every scenario rebase
// itself automatically on each data refresh, which is precisely what "the data
// refreshes itself" has to mean for the analytical layer, not just the tiles.
//
// `narrativeReviewedOn` is the date a human last re-reasoned the words. The
// audit compares it against the data date and complains when the gap opens up,
// because the failure mode of an auto-refreshing framework is stale judgement
// hiding behind fresh numbers.
// ============================================================================

import type { PathDelta, PathRow, Scenario } from '../types/framework';
import type { Anchor } from '../lib/derive';
import type { Snapshot } from '../lib/snapshot';
import { val } from '../lib/snapshot';

/** Last date a human re-reasoned the scenario narratives, not the numbers. */
export const narrativeReviewedOn = '2026-09-24';

const ZERO: Omit<PathDelta, 'label' | 'monthsAhead' | 'fedFundsLow' | 'fedFundsHigh' | 'move'> = {
  dy2: 0, dy5: 0, dy10: 0, dy30: 0,
  dTermPremium: 0, dSwapSpread: 0, dSofrIorb: 0, dMortgage: 0, dIgOas: 0, dHyOas: 0,
};

/** Today is, by construction, zero change from today. The audit cannot fail. */
const today = (move: number): PathDelta =>
  ({ label: 'Today', monthsAhead: 0, fedFundsLow: 3.75, fedFundsHigh: 4.00, ...ZERO, move });

// ---------------------------------------------------------- materialise -----

/**
 * Turn a delta path into absolute levels against the live anchor.
 * Manual fields (term premium, swap spread, MOVE) fall back to the stated
 * manual base when no feed exists, and the UI marks them accordingly.
 */
export function materialisePath(
  deltas: PathDelta[],
  anchor: Anchor,
  base: { termPremium: number; swapSpread10y: number; sofrMinusIorb: number; mortgage30y: number; igOas: number; hyOas: number },
): PathRow[] {
  return deltas.map((d) => ({
    label: d.label,
    monthsAhead: d.monthsAhead,
    fedFundsLow: d.fedFundsLow,
    fedFundsHigh: d.fedFundsHigh,
    y2: round2(anchor.y2 + d.dy2 / 100),
    y5: round2(anchor.y5 + d.dy5 / 100),
    y10: round2(anchor.y10 + d.dy10 / 100),
    y30: round2(anchor.y30 + d.dy30 / 100),
    termPremium: Math.round(base.termPremium + d.dTermPremium),
    swapSpread10y: Math.round(base.swapSpread10y + d.dSwapSpread),
    sofrMinusIorb: round1(base.sofrMinusIorb + d.dSofrIorb),
    mortgage30y: round2(base.mortgage30y + d.dMortgage / 100),
    igOas: Math.round(base.igOas + d.dIgOas),
    hyOas: Math.round(base.hyOas + d.dHyOas),
    move: d.move,
  }));
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round1 = (n: number) => Math.round(n * 10) / 10;

/** The live base levels the deltas are applied to. */
export function pathBase(s: Snapshot, manual: { move: number; swapSpread10y: number; acm10y: number }) {
  return {
    // Kim-Wright is live; ACM is manual. We anchor the path on the live model
    // and show the manual one beside it, because a term premium path built on
    // a number nobody can refresh is a path that rots.
    termPremium: val(s, 'kimWright10y') ?? manual.acm10y,
    swapSpread10y: manual.swapSpread10y,
    sofrMinusIorb: val(s, 'sofrMinusIorb') ?? 0,
    mortgage30y: val(s, 'mortgage30y') ?? 0,
    igOas: val(s, 'igOas') ?? 0,
    hyOas: val(s, 'hyOas') ?? 0,
  };
}

// ============================================================== scenarios ===

export const scenarios: Record<'A' | 'B' | 'C' | 'D', Scenario> = {
  // ------------------------------------------------------------------- A ---
  A: {
    key: 'A',
    name: '"Higher for Longer" Grind',
    subtitle: 'Muddle-Through',
    probability: 40,
    priorProbability: 45,
    definition: 'The Fed holds near 4%, the labour market keeps cooling without cracking, and credit stays where it already is - which is close to the tights. Core PCE grinds sideways in the low threes. The defining feature of this scenario is not the level of anything; it is that realised volatility stays suppressed, and suppressed volatility is not the absence of risk. It is the mechanism by which leverage accumulates.',
    triggers: [
      'Core PCE 3m annualised holding near 3% rather than re-accelerating',
      'Payroll 3m average stabilising rather than continuing to decelerate',
      'Coupon auctions clearing with indirect participation near its recent average',
      'VIX remaining in the low teens and MOVE drifting lower',
    ],
    signposts: [
      'Two consecutive core CPI prints in the 0.2-0.3% m/m range',
      'HY OAS staying inside 300bp while CCC-BB stops widening',
      'SOFR-IORB staying negative through quarter-end',
      'Initial claims 4-week average holding near 200k',
    ],
    path: [
      today(96),
      { label: 'Month 1', monthsAhead: 1, fedFundsLow: 3.75, fedFundsHigh: 4.00, ...ZERO, dy2: 2, dy5: 2, dy10: 3, dy30: 4, dTermPremium: 2, dSofrIorb: 1, dMortgage: 3, dIgOas: 3, dHyOas: 12, move: 94 },
      { label: 'Month 3', monthsAhead: 3, fedFundsLow: 3.75, fedFundsHigh: 4.00, ...ZERO, dy2: 6, dy5: 4, dy10: 2, dy30: 0, dTermPremium: -4, dSwapSpread: 2, dMortgage: 2, dIgOas: 6, dHyOas: 25, move: 90 },
      { label: 'Month 6', monthsAhead: 6, fedFundsLow: 3.50, fedFundsHigh: 3.75, ...ZERO, dy2: 0, dy5: -6, dy10: -10, dy30: -14, dTermPremium: -12, dSwapSpread: 4, dMortgage: -12, dIgOas: 2, dHyOas: 15, move: 88 },
    ],
    curveShape: 'A mild bear flattener for the first quarter as the front end gives up the cuts it currently prices, then a bull steepener from month four as the easing cycle comes back into view. 2s10s compresses toward the mid-teens before re-widening. The mechanism for the late steepening is not a forecast of the Fed - it is that with the real policy rate at roughly +0.5% against an r* near 1%, the front end has very little room to rise and a great deal of room to fall, while the long end is pinned by a term premium that is already near 100bp on Kim-Wright and has no obvious reason to compress further.',
    analog: {
      episode: '2006 H2',
      why: 'Policy parked, credit at the tights, realised vol grinding toward nothing while leverage quietly rebuilt underneath the calm.',
      biggerOrSmaller: 'Smaller in credit terms, larger in fiscal terms. The primary deficit is a far higher share of GDP than in 2006 and the effective coupon on the debt stock is climbing every month as low-rate paper rolls. But the more useful part of the 2006 analogy is how that regime ended: not because anyone forecast it, but because low volatility had let leverage build to the point where a modest shock had large consequences. With VIX in the low teens and HY inside 280bp, that is the live risk in this scenario, not the level of yields.',
    },
    invalidation: 'Core PCE 3m annualised breaking above 3.5%, or two consecutive negative payroll prints. Either ends muddle-through, in opposite directions.',
    dualNarrative: {
      market: "The market's telling: the Fed is essentially done, the next move is a cut, and credit at the tights is a rational response to an economy that has landed softly. Low vol is the evidence.",
      fed: "The Fed's telling: with the real policy rate near +0.5% against an r* estimate close to 1%, we have not yet been restrictive for a single day of this cycle. We have been removing accommodation. Those are different operations with different endpoints.",
      divergence: 'The gap is not about the peak, it is about the plateau. The market prices a short summit; the Fed describes a long one. That disagreement lives in the belly - the 5y is the tenor that has to be wrong if the Fed means what it says - which is why the 2s5s10s butterfly is the cheapest way to own it.',
    },
  },

  // ------------------------------------------------------------------- B ---
  B: {
    key: 'B',
    name: 'Fiscal-Dominance Meltdown',
    subtitle: 'Bear Steepener to Hell',
    probability: 20,
    priorProbability: 22,
    definition: 'The market stops clearing duration at a price Treasury is willing to pay, inside a single auction cycle. The sequence is mechanical and has a known order: weak auctions with a high dealer takedown, dealer balance sheets saturate, repo haircuts on the resulting inventory rise, the cash-futures basis gaps, levered accounts de-gross into a market with no other buyer, off-the-run bid-offer widens to multiples of normal, and a quarter-end that would ordinarily be a nuisance becomes the accelerant.',
    triggers: [
      'Three consecutive coupon auctions with indirect participation well below its trailing average and dealer takedown above 25%',
      'Kim-Wright 10y term premium breaking above 130bp',
      '10y swap spread moving materially more negative',
      'Levered-account de-grossing into weakness rather than into strength',
    ],
    signposts: [
      'Indirect share below 55% on a 10y or 30y auction',
      'SOFR printing above IORB on a non-quarter-end day',
      'The SOFR 99th-percentile tail widening beyond 25bp while the median stays calm',
      'Any non-zero standing repo facility take-up outside a settlement date',
    ],
    path: [
      today(96),
      { label: 'Month 1', monthsAhead: 1, fedFundsLow: 3.75, fedFundsHigh: 4.00, ...ZERO, dy2: 6, dy5: 20, dy10: 38, dy30: 48, dTermPremium: 30, dSwapSpread: -6, dSofrIorb: 5, dMortgage: 45, dIgOas: 28, dHyOas: 110, move: 128 },
      { label: 'Month 3', monthsAhead: 3, fedFundsLow: 3.75, fedFundsHigh: 4.00, ...ZERO, dy2: 10, dy5: 32, dy10: 58, dy30: 76, dTermPremium: 45, dSwapSpread: -12, dSofrIorb: 8, dMortgage: 70, dIgOas: 50, dHyOas: 180, move: 145 },
      { label: 'Month 6', monthsAhead: 6, fedFundsLow: 3.50, fedFundsHigh: 3.75, ...ZERO, dy2: -12, dy5: 14, dy10: 38, dy30: 55, dTermPremium: 25, dSwapSpread: -4, dSofrIorb: 0, dMortgage: 50, dIgOas: 38, dHyOas: 130, move: 122 },
    ],
    curveShape: 'A violent bear steepener led from the back. The 30y adds roughly 48bp in a month against 6bp in the 2y, because this is a duration-supply problem and duration supply is priced at the back. By month six the front end falls as the Fed eases for financial-stability reasons while inflation is still near 3% - and the long end refuses to follow, which is exactly what distinguishes B from C. In a normal easing cycle 2s10s would go to +100 and beyond; here it stalls, because the market is pricing a central bank that was forced rather than one that chose.',
    analog: {
      episode: 'October 2023 term-premium surge, with the unwind mechanics of the April 2025 swap-spread and basis dislocation',
      why: 'Both were duration indigestion rather than credit events, both saw swap spreads collapse as the cash leg became the expensive one to hold, and both were resolved through issuance and balance-sheet policy rather than monetary policy.',
      biggerOrSmaller: 'Smaller than it would have been two years ago on the policy-response side and larger on the buffer side. The standing repo facility now exists and is pre-positioned; against that, ON RRP is empty - take-up is under a billion dollars against the two and a half trillion it absorbed in 2022 - so the next drain comes straight out of reserves with nothing in between. The UK LDI comparison remains the wrong one: gilts are a fraction of the size and had a single forced seller with a margin clock. Treasuries have many sellers and no single clock.',
    },
    invalidation: 'A refunding announcement guiding the bill share materially higher, or an expansion of Treasury buybacks. Either absorbs the duration and the thesis dies on the announcement rather than on the data.',
    dualNarrative: {
      market: "The market's telling: America has lost the ability to fund itself at a sane price, and the term premium is going to 150bp because somebody has to be paid to warehouse a deficit nobody will address.",
      fed: "The Fed's telling: this is a market-functioning problem, not a monetary-policy problem, and it has market-functioning answers. Treasury sets the issuance mix; we set the price of reserves. Conflating the two is how a country loses an independent central bank.",
      divergence: 'The disagreement is about WHO OWNS THE PROBLEM, and it is the most consequential one in the framework. If it is a Treasury problem it is solved with an issuance announcement and costs the market nothing structural. If the Fed is forced to own it, the 1951 Accord starts getting quoted in research notes and the inflation risk premium that follows dwarfs the original supply shock. Watch which institution speaks first - the ordering is the signal.',
    },
  },

  // ------------------------------------------------------------------- C ---
  C: {
    key: 'C',
    name: 'Stagflationary Breakage',
    subtitle: 'Capitulation',
    probability: 28,
    priorProbability: 23,
    definition: 'Growth cracks while core inflation stays pinned above 3%. The Fed faces the only genuinely hard problem in its mandate: both sides deteriorating at once. Credit, which starts this scenario close to its tights with almost no cushion, widens fast. The weight on this scenario went UP on the live data, and for one specific reason: the three-month average of payroll growth is materially weaker than the headline print suggests, and a labour market decelerating from a low base has less room than one decelerating from a high one.',
    triggers: [
      'Payroll 3m average continuing to fall, with negative prints appearing',
      'Sahm indicator turning up decisively from its current low reading',
      'Initial claims 4-week average breaking above 250k',
      'HY OAS breaking above 400bp with CCC continuing to lead',
    ],
    signposts: [
      'ISM employment sub-index below 48',
      'Senior loan officer survey showing net tightening above 40%',
      'CCC-BB widening past 1,100bp',
      'VIX above 25 and MOVE above 130 in the same fortnight - correlated vol is the regime tell',
    ],
    path: [
      today(96),
      { label: 'Month 1', monthsAhead: 1, fedFundsLow: 3.75, fedFundsHigh: 4.00, ...ZERO, dy2: -28, dy5: -26, dy10: -20, dy30: -14, dTermPremium: -8, dSwapSpread: 2, dSofrIorb: 1, dMortgage: -18, dIgOas: 40, dHyOas: 120, move: 126 },
      { label: 'Month 3', monthsAhead: 3, fedFundsLow: 3.00, fedFundsHigh: 3.25, ...ZERO, dy2: -90, dy5: -80, dy10: -55, dy30: -40, dTermPremium: -30, dSwapSpread: 6, dSofrIorb: 2, dMortgage: -55, dIgOas: 85, dHyOas: 250, move: 150 },
      { label: 'Month 6', monthsAhead: 6, fedFundsLow: 2.50, fedFundsHigh: 2.75, ...ZERO, dy2: -135, dy5: -118, dy10: -80, dy30: -60, dTermPremium: -45, dSwapSpread: 8, dSofrIorb: 2, dMortgage: -85, dIgOas: 65, dHyOas: 200, move: 134 },
    ],
    curveShape: 'The shape here is a SEQUENCE, and collapsing it to one label is the most common analytical error made about stagflation. STAGE 1, weeks 0-4: a bull FLATTENER. The growth shock lands before the Fed responds, so the long end rallies on flight-to-quality while the front stays pinned by a committee that cannot cut into 3% core. STAGE 2, weeks 4-12: the handover. The Fed capitulates, the front collapses, and the curve re-steepens violently. STAGE 3, months 4-6: a bull steepener that stalls - the front keeps falling but the long end stops, because a Fed easing into 3% inflation rebuilds the inflation risk premium it spent two years destroying. How long Stage 1 lasts depends on exactly one thing: whether the committee treats 3% core as a constraint or an inconvenience.',
    analog: {
      episode: '2007-08 easing into sticky headline inflation, spliced with the correlated-vol shock of March 2020',
      why: '2007-08 supplies the shape: the Fed cut hard while headline inflation ran above 4%, and the curve bull-steepened the whole way. March 2020 supplies the speed and the correlation, where every hedge stopped working at once.',
      biggerOrSmaller: 'Harder than 2007 on the inflation side and on the starting valuation. Core inflation is meaningfully higher than it was in September 2007, which halves the room to ease; and credit begins this scenario at spreads close to the cycle tights with CCC-BB already near 950bp, so the index has almost no cushion before it starts repricing. Easier on bank capital, and the leverage that matters most now sits in private credit, which marks slowly and calls no margin. Slow-marking leverage means less cascade and more grind - better for the system, considerably worse for anyone who owns it.',
    },
    invalidation: 'Payroll growth re-accelerating above 150k on the 3m average while core PCE falls below 3%. That is not stagflation, it is Scenario A with better data. Note also that a Fed cutting PRE-EMPTIVELY into decent data is A, not C - the defining feature of C is that the Fed is late.',
    dualNarrative: {
      market: "The market's telling: the Fed broke it, the Fed will fix it, and every weak print is another cut. Rate-cut trades work until, abruptly, they do not.",
      fed: "The Fed's telling: we cannot underwrite a supply shock, and cutting into one spends the credibility that took three years to rebuild.",
      divergence: 'The market prices cuts as a mechanical function of growth; the Fed prices them as a function of inflation expectations staying anchored. The observable that settles it is breakeven behaviour during the first 50bp of easing. The 5y5y breakeven currently sits comfortably below target-consistent levels, which is the single strongest argument that the Fed would have room to ease - and it is the first thing to watch, because if it starts rising as the Fed cuts, the easing stops and every long-duration trade put on for the cycle is wrong at the worst possible moment.',
    },
  },

  // ------------------------------------------------------------------- D ---
  D: {
    key: 'D',
    name: 'The Pain Trade',
    subtitle: 'Positioning Squeeze / Relief Rally',
    probability: 12,
    priorProbability: 10,
    definition: 'Nothing breaks. Inflation prints softly, the refunding leans on bills, and a market carrying a high term premium and a crowded short in duration discovers it cannot cover into a bid that is not there. Yields fall hard for an unglamorous reason: everyone was already positioned for them to rise. The term premium does not get repriced by fundamentals - it gets squeezed out by a crowd trying to exit through a door it is standing in.',
    triggers: [
      'A soft core PCE print with the long end failing to make a new yield high',
      'A coupon auction stopping through with indirect participation well above average',
      'Refunding guidance leaning toward a higher bill share',
      'Kim-Wright term premium rolling over from near 100bp without a growth scare',
    ],
    signposts: [
      'Two consecutive sessions where hot data or heavy supply fails to produce new yield highs',
      'MOVE falling while the 30y is unchanged - vol sellers returning before direction resolves',
      '10y swap spread retracing, which is the cleanest evidence that balance-sheet scarcity was the binding constraint rather than fiscal fear',
      'Dealer inventory clearing without a yield rise',
    ],
    path: [
      today(96),
      { label: 'Month 1', monthsAhead: 1, fedFundsLow: 3.75, fedFundsHigh: 4.00, ...ZERO, dy2: -10, dy5: -18, dy10: -26, dy30: -34, dTermPremium: -22, dSwapSpread: 4, dMortgage: -24, dIgOas: -4, dHyOas: -18, move: 86 },
      { label: 'Month 3', monthsAhead: 3, fedFundsLow: 3.75, fedFundsHigh: 4.00, ...ZERO, dy2: -4, dy5: -20, dy10: -30, dy30: -42, dTermPremium: -34, dSwapSpread: 6, dMortgage: -28, dIgOas: -6, dHyOas: -25, move: 80 },
      { label: 'Month 6', monthsAhead: 6, fedFundsLow: 3.75, fedFundsHigh: 4.00, ...ZERO, dy2: -12, dy5: -26, dy10: -32, dy30: -42, dTermPremium: -38, dSwapSpread: 7, dMortgage: -30, dIgOas: -8, dHyOas: -30, move: 78 },
    ],
    curveShape: 'A bull FLATTENER led from the back, which is the shape almost nobody is positioned for. The 30y rallies roughly 34bp in a month against 10bp in the 2y, because the short base is concentrated in the long end and short-covering is indiscriminate about fundamentals. By month three 2s10s is flat to slightly inverted with the Fed still near 4% and no recession in sight. That configuration feels absurd, which is exactly why it is the pain trade: it requires abandoning the fiscal-doom story AND the rate-cut story at the same time, and most books are long one of the two. The mechanism is not a change in fundamentals. Term premium is the price of warehousing risk, and when the people short the warehouse need to get flat, that price collapses before anything real changes.',
    analog: {
      episode: 'The November 2023 to January 2024 reversal, and the post-October-1998 squeeze',
      why: 'In late 2023 the 10y fell over 100bp in nine weeks with no recession and no pivot, from a starting point where consensus was unanimously bearish duration and positioning was heavily short. The fundamental news that started it was mild; the magnitude was almost entirely positioning.',
      biggerOrSmaller: 'Smaller in magnitude, similar in mechanism. The short today sits substantially in relative-value basis books rather than macro funds, and those de-gross more gradually because the position is a hedge rather than a view. That caps the squeeze nearer 40bp than 110bp - but it also means it can happen with no macro catalyst at all, purely on a margin or balance-sheet change.',
    },
    invalidation: 'A coupon auction tailing badly with weak indirect participation, or the term premium breaking to new highs. Either says the short is a view rather than a crowd, and views do not squeeze.',
    dualNarrative: {
      market: "The market's telling: there is no telling, and that is the point. This is not a macro view. It is the observation that when consensus is unanimous, the consensus itself becomes the largest single risk factor in the price, and no amount of fundamental analysis will find it because it is not in the fundamentals.",
      fed: "The Fed's telling: financial conditions eased materially without any policy change, which is itself a reason to stay tighter for longer.",
      divergence: 'This is the only scenario where the divergence runs the other way - the Fed would be MORE hawkish than the market, not less, because a rally it did not sanction is a loosening it must offset. That reflexivity is what caps the squeeze rather than letting it run.',
    },
  },
};

export const scenarioList = [scenarios.A, scenarios.B, scenarios.C, scenarios.D];

// ============================================================================
// Scenario C deep-dive: the policy reaction function.
// ============================================================================

export const fedToolkitLadder = [
  {
    rung: 1,
    tool: 'Treasury issuance mix',
    owner: 'Treasury, not the Fed',
    authority: 'Ordinary debt-management discretion',
    trigger: 'Persistent weak auctions with soft indirect participation',
    mechanics: 'Shift the bill share up, removing tens of billions a month of duration from the market without changing a single policy rate.',
    cost: 'Rollover risk and a shorter weighted-average maturity. Politically cheap, financially real.',
    speed: 'One announcement, at the next scheduled refunding.',
  },
  {
    rung: 2,
    tool: 'Treasury buybacks, scaled',
    owner: 'Treasury',
    authority: 'Existing liquidity-support buyback programme',
    trigger: 'Off-the-run illiquidity, wide bid-offer in seasoned issues',
    mechanics: 'Raise operation sizes, concentrated in the sectors where bid-offer has gapped. Cash-managed, not balance-sheet expanding.',
    cost: 'Minimal. The most under-appreciated tool in the stack.',
    speed: 'Two weeks to scale.',
  },
  {
    rung: 3,
    tool: 'Standing Repo Facility',
    owner: 'Fed',
    authority: 'Already authorised, standing',
    trigger: 'SOFR printing above IORB, dealer funding strain',
    mechanics: 'Caps the repo rate by lending against Treasury collateral at a fixed rate. Already sized to do this; the constraint is stigma and counterparty breadth, not capacity.',
    cost: 'Effectively zero, which is why it exists. Its failure mode is that firms will not use it.',
    speed: 'Same day.',
  },
  {
    rung: 4,
    tool: 'SLR / eSLR relief on Treasury holdings',
    owner: 'Fed, OCC and FDIC jointly',
    authority: 'Rulemaking, or a temporary exclusion on the 2020 template',
    trigger: 'Dealer inventory at capacity with bid-offer widening',
    mechanics: 'Exclude Treasuries and reserves from the leverage exposure denominator, freeing dealer balance sheet to intermediate.',
    cost: 'High in political capital. Reads as a bank giveaway and requires an interagency process.',
    speed: 'Weeks to months. Too slow to be a crisis tool, which is the argument for doing it before a crisis.',
  },
  {
    rung: 5,
    tool: 'FIMA repo',
    owner: 'Fed',
    authority: 'Standing, for foreign official account holders',
    trigger: 'Foreign official selling of Treasuries to raise dollars',
    mechanics: 'Lets foreign central banks borrow dollars against Treasuries instead of selling them. Converts a forced seller into a borrower.',
    cost: 'Zero, and it addresses the cross-border channel directly.',
    speed: 'Same day.',
  },
  {
    rung: 6,
    tool: 'Market-functioning purchases',
    owner: 'Fed / FOMC',
    authority: 'Section 14(b) of the Federal Reserve Act - ordinary open-market authority for US government obligations. No 13(3), no Treasury indemnity, no emergency finding.',
    trigger: 'Disorderly conditions: on-the-run/off-the-run spreads at multiples of normal, bid-offer gapping, failed price discovery',
    mechanics: 'Outright purchases targeted at the dysfunctional sector rather than at a rate.',
    cost: 'Very high in credibility terms while inflation is above target. This is the rung where "fiscal dominance" stops being rhetorical.',
    speed: 'One FOMC directive. Legally trivial, institutionally enormous.',
  },
];

export const inventedFacility = {
  acronym: 'CLAMP',
  name: 'Coupon Liquidity And Market Provision facility',
  tagline: 'A cap on the speed of the move, never on the level. That is the whole trick.',
  legalAuthority:
    'Section 14(b) of the Federal Reserve Act. This is the quiet scandal of the entire discussion: the Fed needs no emergency authority whatsoever to buy Treasuries. No 13(3) finding, no "unusual and exigent circumstances", no Treasury indemnity, no Congressional notification. A corporate bond facility requires all of that. Buying the sovereign requires an FOMC directive and a phone call to the Desk. The binding constraint on CLAMP is entirely institutional, which means it can be crossed in an afternoon by a committee that decides it wants to.',
  mechanics:
    'The Desk stands ready to purchase off-the-run coupons in the 7-30y sector, in unlimited size, whenever the on-the-run / off-the-run yield spread in any sector exceeds roughly four times its normal level for two consecutive sessions. Critically, the FOMC never names a yield. It names a SPREAD - a market-functioning metric, not a policy metric - and the statement says so in its first sentence.',
  sizing:
    'Announced as uncapped, which is the entire point: a capped backstop is a target for the market to test. Expected take-up in the low hundreds of billions over a couple of months [E], scaled down from March 2020 on the reasoning that this dysfunction is confined to one sector of one market rather than spanning every asset class at once.',
  sterilisation:
    'Purchases are offset by accelerated bill runoff, so the balance sheet does not grow. This lets the FOMC state, accurately, that the stance of policy is unchanged - it is a duration swap, not an expansion. Operation Twist in a hi-vis jacket.',
  exit:
    'Deactivates automatically when the on-the-run/off-the-run spread holds near normal for ten consecutive sessions. Automatic rather than discretionary, because every discretionary exit in Fed history has been front-run and every automatic one has not.',
  whyItIsYccInEffect:
    'Here is the mechanism that never makes the press release. The off-the-run spread does not widen randomly. It widens almost exclusively when the long end is selling off fast enough that dealers cannot warehouse the flow. A facility triggered by that spread is therefore, functionally, a facility triggered by the SPEED of a selloff. CLAMP caps the second derivative of the long end while leaving the level entirely free. The Fed can say with a straight face that it has not targeted a yield, and it will be telling the truth. But every trader will correctly conclude that a fast 60bp selloff summons an unlimited buyer while a slow one does not, and will position accordingly: sell the long end gently, never in size, never into a gap. The market imposes the cap on itself, for free, and the Fed never signs anything.',
  whyItIsNotYccInLaw:
    'Yield curve control, as practised by the BoJ and by the Fed from 1942 to 1951, requires a public commitment to a numerical yield. That commitment is what subordinates monetary policy to fiscal financing, because once you have promised a yield you must print whatever quantity the promise costs. The 1951 Treasury-Fed Accord exists precisely to prevent that subordination and is the founding document of central bank independence in the United States. CLAMP never makes the commitment, so the Accord is never breached, so nobody has to have the argument. The cost of the elegance is accountability: the market gets the backstop without the public commitment that a stated yield target would carry.',
  failureMode:
    'The spread trigger is gameable. A fast-money book that wants the Fed bidding can push the off-the-run spread through the threshold with relatively modest size in an illiquid seasoned issue, because the trigger is measured on the least liquid part of the curve. The first exploitation of this would be the end of the facility and, plausibly, of a career at the Desk.',
};

export const fedProbabilityTree = {
  root: 'Scenario C has begun: payroll growth has turned negative, claims are rising, and core inflation is still near 3%',
  branches: [
    {
      id: 'C1',
      label: 'Fed cuts promptly and keeps cutting',
      weight: 45,
      condition: 'Labour deterioration is unambiguous AND the 5y5y breakeven stays anchored',
      path: 'Funds toward 2.50-2.75% by month six. Bull steepener, 2s10s wide.',
      rateImplication: 'The base case inside C, and what the path table shows.',
      tell: 'A committee that cuts 50bp at the first meeting rather than 25bp. Size, not timing, reveals the reaction function.',
    },
    {
      id: 'C2',
      label: 'Fed cuts, then stops on an inflation-expectations scare',
      weight: 30,
      condition: 'The 5y5y breakeven breaks decisively higher during the first 75bp of easing',
      path: 'Easing pauses. The front end reprices HIGHER from month four. The curve bear-flattens from a bull-steepened position - the single most punishing sequence for a book that put on steepeners for the easing cycle.',
      rateImplication: '10y stalls well short of the path table, and the 2y backs up sharply from its lows.',
      tell: 'Any Fed speaker using "well-anchored" defensively rather than descriptively.',
    },
    {
      id: 'C3',
      label: 'Fed holds - the credibility trap',
      weight: 18,
      condition: 'Energy-driven headline inflation makes cutting politically and institutionally impossible',
      path: 'No cuts for months despite visible labour damage. The bull FLATTENER persists instead of handing over to a steepener: the long end rallies on growth fear while the front stays pinned. 2s10s compresses toward zero and inverts.',
      rateImplication: 'The most under-priced path in the entire framework, and the one that destroys a book positioned for the easing cycle.',
      tell: 'The Fed emphasising headline rather than core in its statement language. That switch is never accidental.',
    },
    {
      id: 'C4',
      label: 'Emergency inter-meeting action',
      weight: 7,
      condition: 'A credit event, or a funding market that stops clearing',
      path: 'Inter-meeting cut of 50-75bp plus the toolkit from rung 3 downward within a fortnight. CLAMP activated.',
      rateImplication: 'Everything gaps, then partially retraces as the inflation risk premium rebuilds.',
      tell: 'Bid-offer in off-the-run 20y coupons widening beyond 4/32nds. Plumbing always speaks before policy does.',
    },
  ],
};

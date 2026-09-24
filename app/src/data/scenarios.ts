// ============================================================================
// Scenarios A-D, with typed path tables.
//
// STRUCTURAL CHANGE vs v1: there are now FOUR scenarios, not three.
//
// v1 offered grind, fiscal doom, and recession. Read that list again: there was
// no path in which yields fall for a good reason. A framework whose entire
// distribution is "bad, worse, or differently bad" is not a distribution, it is
// a mood, and it will be structurally long the consensus trade forever. Sehgal's
// bandwagon point is precisely this - when everyone is worried about the long
// end, that consensus is itself a reason the long end is cheap, and the crowd
// cannot exit through a door it is standing in. Scenario D is that door.
//
// Every spread in these tables is DERIVED by lib/curve.ts from y2/y5/y10/y30.
// None is typed. v1 typed them, mistyped the key on three rows, and rendered
// blanks nobody caught.
// ============================================================================

import type { Scenario } from '../types/framework';

const TODAY = {
  label: 'Today', monthsAhead: 0 as const,
  fedFundsLow: 3.75, fedFundsHigh: 4.00,
  y2: 4.75, y5: 4.84, y10: 5.14, y30: 5.34,
  acmTermPremium: 78, swapSpread10y: -12, sofrMinusIorb: -1.8,
  mortgage30y: 7.22, igOas: 108, hyOas: 342, move: 118,
};

export const scenarios: Record<'A' | 'B' | 'C' | 'D', Scenario> = {
  // ------------------------------------------------------------------- A ---
  A: {
    key: 'A',
    name: '"Higher for Longer" Grind',
    subtitle: 'Muddle-Through',
    probability: 45,
    priorProbability: 50,
    definition: 'The Fed delivers the signalled December hike to 4.00-4.25% and holds through H1 2027. Core PCE plateaus at 2.8-3.2%. Growth slows to 1.5-1.8% without breaking. Credit digests a 5% long end because all-in yield, not spread, is what clears paper at these levels. Volatility bleeds out rather than exploding, which is the part most people get wrong: falling vol is not the absence of risk, it is the mechanism by which risk accumulates.',
    triggers: [
      'Core PCE 3m SAAR holding the 3.0-3.4% band through the October and November prints',
      'NFP printing 100k+ with the 3m average above 90k',
      'Coupon auction tails normalising below 2bp with indirects back above 65%',
      'MOVE drifting below 110 without a policy catalyst',
    ],
    signposts: [
      'October and November core CPI in the 0.2-0.3% m/m range',
      '5y auction tail below 2.5bp at the October refunding',
      'HY OAS range-bound 320-370bp while CCC-BB stops widening',
      'ON RRP stable in the 50-100B corridor through quarter-end',
    ],
    path: [
      TODAY,
      { label: 'Month 1', monthsAhead: 1, fedFundsLow: 3.75, fedFundsHigh: 4.00, y2: 4.72, y5: 4.80, y10: 5.08, y30: 5.28, acmTermPremium: 72, swapSpread10y: -10, sofrMinusIorb: -1.5, mortgage30y: 7.15, igOas: 105, hyOas: 335, move: 112 },
      { label: 'Month 3', monthsAhead: 3, fedFundsLow: 4.00, fedFundsHigh: 4.25, y2: 4.85, y5: 4.88, y10: 5.15, y30: 5.35, acmTermPremium: 68, swapSpread10y: -8, sofrMinusIorb: -2.0, mortgage30y: 7.28, igOas: 112, hyOas: 355, move: 105 },
      { label: 'Month 6', monthsAhead: 6, fedFundsLow: 4.00, fedFundsHigh: 4.25, y2: 4.80, y5: 4.78, y10: 5.05, y30: 5.18, acmTermPremium: 60, swapSpread10y: -6, sofrMinusIorb: -1.2, mortgage30y: 7.10, igOas: 100, hyOas: 320, move: 95 },
    ],
    curveShape: 'Bear flattener first as the December hike is priced into the front, taking 2s10s from +39 to roughly +30. Then a mild bull steepener from month four as the strip starts pricing 2027 cuts against a still-elevated term premium. The 5s30s stays wider than 2s10s throughout because the belly is where the supply lands. The mechanism for the late flattening is not a forecast of the Fed - it is that a 4.85% 2y with the funds rate at 4.125% is already pricing another hike, so the front has less room to rise than the long end has to fall.',
    analog: {
      episode: '2006 H2',
      why: 'Fed parked at 5.25%, long end pinned by strong foreign demand, credit tight, realised vol grinding toward nothing while leverage quietly rebuilt underneath.',
      biggerOrSmaller: 'Smaller in credit terms, larger in fiscal terms. The primary deficit is roughly 3% of GDP against 1.8% then, and the foreign official bid is materially weaker. But the 2006 analogy carries the more useful warning: that regime ended not because anyone forecast it, but because the low-vol grind had let leverage build to the point where a small shock had large consequences. The $312B basis position is this cycle\'s version of that.',
    },
    invalidation: 'Core PCE 3m SAAR breaking above 3.5% (forces a faster path than "one and hold") or NFP printing negative (forces a pivot). Either kills muddle-through, in opposite directions.',
    dualNarrative: {
      market: 'The market\'s telling: the Fed is nearly done, one more hike is insurance, and by mid-2027 we are talking about cuts. Positioning reflects this - the strip prices a terminal rate and then an immediate glide lower.',
      fed: 'The Fed\'s telling: with the real policy rate at +0.28% against an r* near 0.95%, we are still removing accommodation. We have not yet been restrictive for a single day of this cycle. Talk of cuts is premature by a year.',
      divergence: 'The gap is not about the peak, it is about the plateau. The market prices a short summit; the Fed describes a long one. That divergence is expressed most cleanly in the belly - the 5y is the tenor that has to be wrong if the Fed means what it says, which is why the 2s5s10s fly is the cheapest way to own this disagreement.',
    },
  },

  // ------------------------------------------------------------------- B ---
  B: {
    key: 'B',
    name: 'Fiscal-Dominance Meltdown',
    subtitle: 'Bear Steepener to Hell',
    probability: 22,
    priorProbability: 25,
    definition: 'The market stops clearing duration at any price the Treasury is willing to pay in a single auction cycle. The sequence is mechanical and it has a known order: badly tailed auctions with dealer takedown above 25% -> dealer balance sheets saturate -> repo haircuts on the resulting inventory rise -> the cash-futures basis gaps -> leveraged funds de-gross into a market with no other buyer -> off-the-run bid-offer widens to multiples of normal -> and the quarter-end or settlement date that would ordinarily be a nuisance becomes the accelerant.',
    triggers: [
      'Three consecutive coupon auctions tailing more than 2.5bp with indirects below 58%',
      'ACM 10y term premium breaking above +100bp',
      '10y swap spread more negative than -18bp',
      'CFTC leveraged-fund gross shorts rising more than 10% in a fortnight while the long end still sells off - de-grossing into weakness, not conviction',
    ],
    signposts: [
      'Indirect bidder share below 60% on a 10y auction',
      'Primary dealer takedown above 25% on any coupon',
      'SOFR printing more than 10bp above IORB intraday on a non-quarter-end day',
      'MOVE above 135 with the 99th-percentile SOFR tail above 25bp',
    ],
    path: [
      TODAY,
      { label: 'Month 1', monthsAhead: 1, fedFundsLow: 3.75, fedFundsHigh: 4.00, y2: 4.82, y5: 5.02, y10: 5.45, y30: 5.78, acmTermPremium: 105, swapSpread10y: -18, sofrMinusIorb: 2.5, mortgage30y: 7.65, igOas: 135, hyOas: 410, move: 142 },
      { label: 'Month 3', monthsAhead: 3, fedFundsLow: 3.75, fedFundsHigh: 4.00, y2: 4.88, y5: 5.18, y10: 5.62, y30: 6.05, acmTermPremium: 120, swapSpread10y: -24, sofrMinusIorb: 5.0, mortgage30y: 7.95, igOas: 155, hyOas: 480, move: 155 },
      { label: 'Month 6', monthsAhead: 6, fedFundsLow: 3.50, fedFundsHigh: 3.75, y2: 4.65, y5: 4.92, y10: 5.35, y30: 5.72, acmTermPremium: 95, swapSpread10y: -15, sofrMinusIorb: -1.0, mortgage30y: 7.55, igOas: 140, hyOas: 425, move: 130 },
    ],
    curveShape: 'A violent bear steepener led from the back. The 30y adds 70bp in a month against 7bp in the 2y, because the selling pressure is a duration-supply problem and duration supply is priced at the back. 2s10s goes to +74 by month three. The front only follows lower at month six, and note the mechanism there: the funds rate falls to 3.50-3.75% not because inflation fell but because the Fed cut for financial-stability reasons while inflation was still 3%. That is the tell that distinguishes B from C - in B the Fed eases into hot inflation because the plumbing forced it, and the long end refuses to follow, which is why 2s10s stays at +70 rather than the +100 a normal easing cycle would produce.',
    analog: {
      episode: 'October 2023 term-premium surge, with the unwind mechanics of the April 2025 swap-spread and basis dislocation',
      why: 'Both were duration indigestion rather than credit events, both saw swap spreads collapse as the cash leg became the expensive one to hold, and both resolved through issuance and balance-sheet policy rather than through monetary policy.',
      biggerOrSmaller: 'Larger in position terms, smaller in policy-lag terms. The basis position is $312B against roughly $650B in 2025 by gross measures but with materially less dealer capacity to intermediate the unwind, and central clearing is only part-phased. Against that, the Fed now has a standing repo facility that did not exist in 2019 and was barely used in 2023, plus a live buyback programme it can scale on a week\'s notice. The cascade is faster; so is the response. The UK LDI comparison is the wrong one - gilts are a fifth the size and had a single forced seller with a margin clock. USTs have many sellers and no single clock.',
    },
    invalidation: 'Treasury guiding bill share above 22% at the 7 November refunding, or the Fed expanding buybacks beyond $30B/month. Either absorbs the duration and the thesis dies on the announcement, not on the data.',
    dualNarrative: {
      market: 'The market\'s telling: America has lost the ability to fund itself at a sane price, the bond vigilantes are back, and the term premium is going to 150bp because someone has to be paid to warehouse a deficit nobody will address.',
      fed: 'The Fed\'s telling: this is a market-functioning problem, not a monetary-policy problem, and it has market-functioning answers. Treasury sets the issuance mix; we set the price of reserves. Conflating the two is how you lose an independent central bank.',
      divergence: 'The divergence here is about WHO OWNS THE PROBLEM, and it is the most consequential disagreement in the whole framework. If it is a Treasury problem it is solved with a bill-share announcement and costs the market nothing structural. If the Fed is forced to own it, the 1951 Accord starts getting quoted in research notes, and the inflation risk premium repricing that follows dwarfs the original supply shock. Watch which institution speaks first: that ordering is the actual signal.',
    },
  },

  // ------------------------------------------------------------------- C ---
  C: {
    key: 'C',
    name: 'Stagflationary Breakage',
    subtitle: 'Capitulation',
    probability: 23,
    priorProbability: 25,
    definition: 'Growth cracks under a 4% funds rate, a 7.2% mortgage and a $92 barrel while core inflation stays pinned near 3%. The Fed faces the only genuinely hard problem in its mandate: both sides of the dual mandate deteriorating at once. Credit widens 100-150bp, private-credit marks stop being fiction, and the curve does something counterintuitive in stages rather than one thing overall.',
    triggers: [
      'NFP negative for two consecutive months',
      'Sahm indicator crossing 0.50',
      'WTI sustained above $110 on Gulf escalation',
      'HY OAS above 450bp with CCC above 900bp',
    ],
    signposts: [
      'Initial claims 4-week average above 280k',
      'ISM employment sub-index below 48',
      'Bank senior loan officer survey showing net tightening above 40%',
      'MOVE above 160 alongside VIX above 30 - correlated vol is the regime tell',
    ],
    path: [
      TODAY,
      { label: 'Month 1', monthsAhead: 1, fedFundsLow: 3.75, fedFundsHigh: 4.00, y2: 4.45, y5: 4.58, y10: 4.92, y30: 5.18, acmTermPremium: 65, swapSpread10y: -8, sofrMinusIorb: -1.5, mortgage30y: 7.05, igOas: 130, hyOas: 405, move: 138 },
      { label: 'Month 3', monthsAhead: 3, fedFundsLow: 3.25, fedFundsHigh: 3.50, y2: 3.85, y5: 4.08, y10: 4.55, y30: 4.82, acmTermPremium: 45, swapSpread10y: -4, sofrMinusIorb: -1.0, mortgage30y: 6.62, igOas: 165, hyOas: 520, move: 158 },
      { label: 'Month 6', monthsAhead: 6, fedFundsLow: 2.75, fedFundsHigh: 3.00, y2: 3.40, y5: 3.70, y10: 4.20, y30: 4.55, acmTermPremium: 30, swapSpread10y: -2, sofrMinusIorb: -0.8, mortgage30y: 6.15, igOas: 145, hyOas: 465, move: 140 },
    ],
    curveShape: 'This is the scenario where the curve shape is a SEQUENCE, not a state, and collapsing it to one label is the most common analytical error made about stagflation. STAGE 1 (weeks 0-4) is a bull FLATTENER: the growth shock arrives before the Fed responds, so the long end rallies on flight-to-quality while the front is pinned by a Fed that cannot cut into 3% core. 2s10s compresses toward +30. STAGE 2 (weeks 4-12) is the handover - the Fed capitulates and cuts 50-75bp, the front collapses, and the curve re-steepens violently to +70. STAGE 3 (months 4-6) is a bull steepener that stalls: the front keeps falling toward 2.75% but the long end stops at 4.20% because a Fed easing into 3% inflation rebuilds the inflation risk premium it just spent two years destroying. The 30y at 4.55% with the funds rate at 2.875% is a curve that does not believe the easing cycle. Whether Stage 1 lasts four weeks or fourteen depends on exactly one thing: whether the Fed treats 3% core as a constraint or an inconvenience.',
    analog: {
      episode: '2007-08 Fed cutting into sticky headline inflation, spliced with the March 2020 correlated-vol shock',
      why: '2007-08 supplies the shape - the Fed cut 325bp between September 2007 and April 2008 while headline CPI ran above 4%, and the curve bull-steepened the whole way. March 2020 supplies the speed and the correlation, where every hedge stopped working at once.',
      biggerOrSmaller: 'Harder than 2007 on the inflation side, easier on the credit side. Starting core inflation is 3.3% against 2.2% in September 2007, which halves the Fed\'s room; but bank capital is materially stronger and the toxic leverage sits in private credit, which marks slowly and calls no margin. Slow-marking leverage means less cascade and more grind. The pain is spread over quarters rather than concentrated into a fortnight, which is better for the system and much worse for anyone who owns it.',
    },
    invalidation: 'NFP rebounding above 150k while core PCE drops below 3.0%. That combination is not stagflation, it is Scenario A with better data. Note also that a Fed cutting PRE-EMPTIVELY while the data is still fine is A, not C - the distinguishing feature of C is that the Fed is late.',
    dualNarrative: {
      market: 'The market\'s telling: the Fed broke it, the Fed will fix it, and every 25bp of bad data is another 25bp of cuts. Rate-cut trades work until they suddenly do not.',
      fed: 'The Fed\'s telling: we cannot underwrite a supply shock. Energy-driven inflation is not something monetary policy can address without destroying employment, and cutting into it spends the credibility that took three years to rebuild.',
      divergence: 'The market prices cuts as a mechanical function of growth; the Fed prices them as a function of inflation expectations staying anchored. The observable that settles it is 5y5y breakeven behaviour during the first 50bp of cuts. If 5y5y rises through 3.00% as the Fed eases, the Fed stops, and every long-duration trade put on for the easing cycle is wrong at the worst possible moment.',
    },
  },

  // ------------------------------------------------------------------- D ---
  D: {
    key: 'D',
    name: 'The Pain Trade',
    subtitle: 'Positioning Squeeze / Relief Rally',
    probability: 10,
    priorProbability: 0,
    definition: 'Nothing breaks. The August PCE print comes in soft, the QRA leans into bills, and a market that is record-short duration discovers it cannot cover into a bid that is not there. Yields fall hard for an unglamorous reason: everyone was already positioned for them to rise. The term premium does not get "repriced" by fundamentals - it gets squeezed out by a crowd trying to exit through a door it is standing in.',
    triggers: [
      'CFTC leveraged-fund gross shorts at or near a record while the long end stops making new highs - the classic exhaustion signature',
      'A coupon auction stopping through the screws with indirects above 68%',
      'August core PCE at or below 0.20% m/m on 26 September',
      'QRA on 7 November guiding bill share toward 21-22%',
    ],
    signposts: [
      'Two consecutive sessions where bad news (hot data, heavy supply) fails to produce new yield highs',
      'MOVE falling while the 30y is unchanged - vol sellers returning before direction resolves',
      'Dealer UST inventory falling below $240B without a yield rise, meaning the inventory cleared into real demand',
      '10y swap spread retracing toward -5bp, the cleanest evidence that balance-sheet scarcity was the binding constraint rather than fiscal fear',
    ],
    path: [
      TODAY,
      { label: 'Month 1', monthsAhead: 1, fedFundsLow: 3.75, fedFundsHigh: 4.00, y2: 4.62, y5: 4.62, y10: 4.82, y30: 4.98, acmTermPremium: 58, swapSpread10y: -8, sofrMinusIorb: -1.8, mortgage30y: 6.92, igOas: 100, hyOas: 320, move: 105 },
      { label: 'Month 3', monthsAhead: 3, fedFundsLow: 4.00, fedFundsHigh: 4.25, y2: 4.70, y5: 4.60, y10: 4.72, y30: 4.88, acmTermPremium: 44, swapSpread10y: -5, sofrMinusIorb: -1.6, mortgage30y: 6.80, igOas: 95, hyOas: 305, move: 92 },
      { label: 'Month 6', monthsAhead: 6, fedFundsLow: 4.00, fedFundsHigh: 4.25, y2: 4.60, y5: 4.52, y10: 4.70, y30: 4.90, acmTermPremium: 40, swapSpread10y: -4, sofrMinusIorb: -1.5, mortgage30y: 6.78, igOas: 92, hyOas: 300, move: 88 },
    ],
    curveShape: 'A bull FLATTENER led from the back, which is the shape almost nobody is positioned for. The 30y rallies 36bp in a month against 13bp in the 2y, because the short base is concentrated in the long end and short-covering is indiscriminate about fundamentals. By month three 2s10s is at +2bp - a flat curve with the Fed at 4.00-4.25% and no recession. That configuration feels absurd, which is exactly why it is the pain trade: it requires simultaneously abandoning the fiscal-doom story AND the rate-cut story, and most books are long one of the two. The mechanism is not a change in fundamentals; it is that term premium is a price for warehousing risk, and when the people who were short the warehouse need to get flat, the price of warehousing collapses before anything real changes.',
    analog: {
      episode: 'The November 2023 - January 2024 reversal, and the post-October-1998 squeeze',
      why: 'In November 2023 the 10y fell 110bp in nine weeks with no recession and no pivot, from a starting point where consensus was unanimously bearish duration and positioning was heavily short. The fundamental news that started it was mild; the magnitude was entirely positioning.',
      biggerOrSmaller: 'Smaller in magnitude, similar in mechanism. The 2023 short was concentrated in macro funds; today it sits substantially in relative-value basis books, which de-gross more gradually because the position is a hedge, not a view. That caps the squeeze at roughly 45bp rather than 110bp - but it also means it can happen without any macro catalyst at all, purely on a balance-sheet or margin change.',
    },
    invalidation: 'A coupon auction tailing more than 3bp with indirects below 58%, or ACM breaking +90bp. Either says the short is a view rather than a crowd, and views do not squeeze.',
    dualNarrative: {
      market: 'The market\'s telling: there is no telling. That is the point. This scenario is not a macro view at all - it is the observation that when consensus is unanimous, the consensus itself becomes the largest single risk factor in the price, and no amount of fundamental analysis will find it because it is not in the fundamentals.',
      fed: 'The Fed\'s telling: financial conditions eased materially without any policy change, which is itself a reason to stay tighter for longer. Note the trap - in this scenario the rally is its own partial antidote, because a 40bp fall in the 10y and a 40bp tightening in HY is worth roughly 25bp of easing the Fed did not authorise.',
      divergence: 'This is the only scenario where the divergence runs the other way: the Fed would be MORE hawkish than the market, not less, because a rally it did not sanction is a loosening it must offset. That reflexivity is what caps the squeeze near 4.70% on the 10y rather than letting it run to 4.25%.',
    },
  },
};

export const scenarioList = [scenarios.A, scenarios.B, scenarios.C, scenarios.D];

// ============================================================================
// Scenario C deep-dive: the policy reaction function
// Required by Leviathan Part 4 and entirely absent from v1.
// ============================================================================

/**
 * The real toolkit, in the order it actually gets used. The ordering matters
 * more than the contents: each rung is chosen because it is cheaper in
 * institutional capital than the one below it, not because it is more
 * effective. Analysts who jump straight to "the Fed will do QE" skip four
 * rungs that between them resolve most episodes.
 */
export const fedToolkitLadder = [
  {
    rung: 1,
    tool: 'Treasury issuance mix',
    owner: 'Treasury, not the Fed',
    authority: 'Ordinary debt-management discretion',
    trigger: 'Persistent coupon tails with weak indirects',
    mechanics: 'Shift the bill share from 18.2% toward 22%, removing roughly $40B/month of duration from the market without changing a single policy rate.',
    cost: 'Rollover risk and a shorter WAM. Politically cheap, financially real.',
    speed: 'One announcement. 7 Nov is the scheduled opportunity.',
  },
  {
    rung: 2,
    tool: 'Treasury buybacks, scaled',
    owner: 'Treasury',
    authority: 'Existing liquidity-support buyback programme',
    trigger: 'Off-the-run illiquidity, wide bid-offer in seasoned issues',
    mechanics: 'Raise operations from $18B/month toward $30-40B, concentrated in the sectors where the bid-offer has gapped. Cash-managed, not balance-sheet expanding.',
    cost: 'Minimal. This is the most under-appreciated tool in the stack.',
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
    owner: 'Fed, OCC, FDIC jointly',
    authority: 'Rulemaking, or the 2020-style temporary exclusion',
    trigger: 'Dealer inventory at capacity with bid-offer widening',
    mechanics: 'Exclude Treasuries and reserves from the leverage exposure denominator, freeing dealer balance sheet to intermediate.',
    cost: 'High in political capital. Reads as a bank giveaway, requires an interagency process, and the 2020 precedent expired amid controversy.',
    speed: 'Weeks to months. Too slow to be a crisis tool, which is the argument for doing it before a crisis.',
  },
  {
    rung: 5,
    tool: 'FIMA repo',
    owner: 'Fed',
    authority: 'Standing, for foreign official account holders',
    trigger: 'Foreign official selling of USTs to raise dollars',
    mechanics: 'Lets foreign central banks borrow dollars against USTs instead of selling them. Converts a forced seller into a borrower.',
    cost: 'Zero, and it directly addresses the L4 channel.',
    speed: 'Same day.',
  },
  {
    rung: 6,
    tool: 'Market-functioning purchases',
    owner: 'Fed / FOMC',
    authority: 'Section 14(b) of the Federal Reserve Act - ordinary open-market authority for US government obligations. No 13(3), no Treasury indemnity, no emergency finding required.',
    trigger: 'Disorderly conditions: on-the-run/off-the-run spreads at multiples of normal, bid-offer gapping, failed price discovery',
    mechanics: 'Outright purchases of Treasuries, targeted at the dysfunctional sector rather than at a rate.',
    cost: 'Very high in credibility terms while inflation is above target. This is the rung where the phrase "fiscal dominance" stops being rhetorical.',
    speed: 'One FOMC directive. Legally trivial, institutionally enormous.',
  },
];

/**
 * The invented facility, required by Leviathan Part 4.
 *
 * Design brief: it must be legally unremarkable, operationally deliverable,
 * and it must function as yield-curve control without ever being one - because
 * the constraint that actually binds the Fed is not law, it is the 1951 Accord
 * and everything the institution believes about itself.
 */
export const inventedFacility = {
  acronym: 'CLAMP',
  name: 'Coupon Liquidity And Market Provision facility',
  tagline: 'A cap on the speed of the move, never on the level. That is the whole trick.',
  legalAuthority:
    'Section 14(b) of the Federal Reserve Act. This is the quiet scandal of the entire discussion: the Fed needs no emergency authority whatsoever to buy Treasuries. No 13(3) finding, no "unusual and exigent circumstances", no Treasury indemnity, no Congressional notification. A corporate bond facility requires all of that. Buying the sovereign requires an FOMC directive and a phone call to the Desk. The binding constraint on CLAMP is entirely institutional, which means it can be crossed in an afternoon by a committee that decides it wants to.',
  mechanics:
    'The Desk stands ready to purchase off-the-run coupons in the 7-30y sector, in unlimited size, whenever the on-the-run / off-the-run yield spread in any sector exceeds 12bp for two consecutive sessions - roughly four times its normal level. Critically, the FOMC never names a yield. It names a SPREAD. The facility targets a market-functioning metric, not a policy metric, and the statement says so in its first sentence.',
  sizing:
    'Announced as uncapped, which is the entire point - a capped backstop is a target for the market to test. Expected take-up of $150-250B over eight weeks [E], scaled down from the $1.6T the Fed bought in three months in March 2020 on the reasoning that this dysfunction is confined to one sector of one market rather than spanning every asset class simultaneously.',
  sterilisation:
    'Purchases are offset by accelerated bill runoff, so SOMA does not grow. This lets the FOMC state, accurately, that the balance sheet is unchanged and the stance of policy is unchanged - it is a duration swap, not an expansion. Operation Twist wearing a hi-vis jacket.',
  exit:
    'The facility deactivates automatically when the on-the-run/off-the-run spread holds below 6bp for ten consecutive sessions. Automatic deactivation, not discretionary withdrawal, because every discretionary exit in Fed history has been front-run and every automatic one has not.',
  whyItIsYccInEffect:
    'Here is the mechanism nobody puts in the press release. The off-the-run spread does not widen randomly - it widens almost exclusively when the long end is selling off fast enough that dealers cannot warehouse the flow. So a facility triggered by that spread is, functionally, a facility triggered by the SPEED of a selloff. CLAMP therefore caps the second derivative of the long end while leaving the level entirely free. The Fed can say with a straight face that it has not targeted a yield, and it will be telling the truth. But every trader will correctly conclude that a fast 60bp selloff summons an unlimited buyer while a slow one does not, and will position accordingly: sell the long end gently, never in size, never into a gap. The market will impose the yield cap on itself, for free, and the Fed will never have to sign anything.',
  whyItIsNotYccInLaw:
    'Yield curve control, as practised by the BoJ and by the Fed from 1942 to 1951, requires a public commitment to a numerical yield. That commitment is what subordinates monetary policy to fiscal financing, because once you have promised a yield you must print whatever quantity that promise costs. The 1951 Treasury-Fed Accord exists precisely to prevent that subordination, and it is the founding document of central bank independence in the United States. CLAMP never makes the commitment, so the Accord is never breached, so no one has to have the argument. The cost of this elegance is honesty: the market gets the backstop without the public accountability that a stated yield target would carry.',
  failureMode:
    'The spread trigger is gameable. A fast-money book that wants the Fed bidding can push the off-the-run spread through 12bp with relatively modest size in an illiquid seasoned issue, because the trigger is measured on the least liquid part of the curve. The first exploitation of this would be the end of the facility and, plausibly, the end of a career at the Desk.',
};

/**
 * Fed probability tree inside Scenario C, required by Leviathan Part 4.
 * Conditional probabilities within C only; the branch weights sum to 100.
 */
export const fedProbabilityTree = {
  root: 'Scenario C has begun: two negative payroll prints, Sahm through 0.50, core PCE still near 3.0%',
  branches: [
    {
      id: 'C1',
      label: 'Fed cuts promptly and keeps cutting',
      weight: 45,
      condition: 'Labour deterioration is unambiguous AND 5y5y breakevens stay below 2.85%',
      path: 'Funds to 2.75-3.00% by month six. Bull steepener, 2s10s to +80bp.',
      rateImplication: 'The base case inside C and the one the path table shows.',
      tell: 'A committee that cuts 50bp at the first meeting rather than 25bp. Size, not timing, reveals the reaction function.',
    },
    {
      id: 'C2',
      label: 'Fed cuts, then stops on an inflation-expectations scare',
      weight: 30,
      condition: '5y5y breakevens break above 3.00% during the first 75bp of cuts',
      path: 'Funds pause at 3.25-3.50%. The front end reprices HIGHER from month four. The curve bear-flattens from a bull-steepened position - the single most punishing sequence for a book that put on steepeners for the easing cycle.',
      rateImplication: '10y stalls at 4.60% rather than reaching 4.20%. 2y backs up 40bp from its lows.',
      tell: 'Any Fed speaker using the phrase "well-anchored" defensively rather than descriptively.',
    },
    {
      id: 'C3',
      label: 'Fed holds, credibility-trap variant',
      weight: 18,
      condition: 'Energy-driven headline above 4% makes cutting politically and institutionally impossible',
      path: 'No cuts for four months despite visible labour damage. Bull FLATTENER persists rather than handing over to a steepener - the long end rallies on growth fear while the front stays pinned. 2s10s compresses toward zero and then inverts.',
      rateImplication: '10y to 4.40% with funds still at 3.75-4.00%. The most under-priced path in the entire framework.',
      tell: 'The Fed emphasising headline rather than core in its statement language. That switch is never accidental.',
    },
    {
      id: 'C4',
      label: 'Emergency inter-meeting action',
      weight: 7,
      condition: 'Credit event, or a funding market that stops clearing',
      path: 'Inter-meeting cut of 50-75bp plus the toolkit ladder from rung 3 downward within a fortnight. CLAMP activated.',
      rateImplication: 'Everything gaps. 2y to 3.00%, 10y to 4.00%, then a violent partial retracement as the inflation risk premium rebuilds.',
      tell: 'Bid-offer in off-the-run 20y coupons widening beyond 4/32nds. Plumbing always speaks before policy does.',
    },
  ],
};

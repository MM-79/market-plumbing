// ============================================================================
// Part 5 - Synthesis: scorecard, trade expressions, watchlist.
//
// Two changes of substance vs v1.
//
// 1. The scorecard now states the PROBABILITY SHIFT each threshold triggers, in
//    percentage points, rather than merely naming a level. "HY OAS above 400bp"
//    is an observation. "HY above 400 with IG above 130 in the same fortnight
//    moves 8pp from A to C" is a decision rule, and only the second one can be
//    checked against the tape afterwards.
//
// 2. Every expression now carries an explicit asymmetry field. The v1 book was
//    four bounded-linear spread trades plus one long straddle bleeding 55bp of
//    theta a month. If the thesis paid, the upside was capped; if a tail
//    arrived, the one convex line item had already decayed. That is a
//    directional book with an expensive apology attached to it.
//
// UNITS: targetBp and stopBp are basis points of the traded spread or level for
// linear trades, and basis points of premium for option structures. The sizing
// field states which, per trade, because mixing them silently is how a book
// ends up with a reward-to-risk ratio that is arithmetically meaningless.
// ============================================================================

import type { TradeExpression } from '../types/framework';

export interface ScorecardRow {
  indicator: string;
  weight: 'High' | 'Med' | 'Low';
  current: string;
  /** Thresholds are written as decision rules with an explicit pp shift. */
  rules: { condition: string; shift: string; toward: 'A' | 'B' | 'C' | 'D' }[];
  nextPrint: string;
}

export const scorecard: ScorecardRow[] = [
  {
    indicator: 'Core PCE 3m SAAR',
    weight: 'High',
    current: '3.6% (July, STALE)',
    rules: [
      { condition: 'August m/m at or below 0.20%', shift: '+8pp', toward: 'D' },
      { condition: 'Holds the 3.0-3.4% band for two prints', shift: '+6pp', toward: 'A' },
      { condition: 'Breaks above 3.5% with services ex-housing above 4.0%', shift: '+7pp', toward: 'B' },
    ],
    nextPrint: '26 Sep 2026 - the single largest information event in this run',
  },
  {
    indicator: 'Coupon auction tail + indirect share',
    weight: 'High',
    current: '5y +3.1bp (18 Sep); 10y +2.4bp, indirect 62.8% (11 Sep)',
    rules: [
      { condition: 'Three consecutive tails above 2.5bp with indirects below 58%', shift: '+10pp', toward: 'B' },
      { condition: 'Any coupon stopping through with indirects above 68%', shift: '+6pp', toward: 'D' },
      { condition: 'Tails normalising below 2bp for two auctions', shift: '+5pp', toward: 'A' },
    ],
    nextPrint: '10 Oct 10y ($39B), 11 Oct 30y ($22B)',
  },
  {
    indicator: 'ACM 10y term premium',
    weight: 'High',
    current: '+78bp (Kim-Wright +65bp - note the 13bp model disagreement)',
    rules: [
      { condition: 'Breaks above +100bp', shift: '+9pp', toward: 'B' },
      { condition: 'Falls below +60bp without a growth scare', shift: '+7pp', toward: 'D' },
      { condition: 'Falls below +50bp WITH a growth scare', shift: '+6pp', toward: 'C' },
    ],
    nextPrint: 'Daily, two-day lag',
  },
  {
    indicator: '10y SOFR swap spread',
    weight: 'High',
    current: '-12bp',
    rules: [
      { condition: 'More negative than -18bp', shift: '+7pp', toward: 'B' },
      { condition: 'Retraces to -5bp or better', shift: '+6pp', toward: 'D' },
    ],
    nextPrint: 'Daily. Watch this before the auction tails - it prices balance-sheet scarcity directly, and it moves first.',
  },
  {
    indicator: 'Payrolls and the Sahm rule',
    weight: 'High',
    current: '+142k Aug, 3m avg +118k, Sahm 0.43',
    rules: [
      { condition: 'Two consecutive negative prints or Sahm above 0.50', shift: '+12pp', toward: 'C' },
      { condition: '3m average holding above 90k', shift: '+5pp', toward: 'A' },
    ],
    nextPrint: '4 Oct (September), 1 Nov (October)',
  },
  {
    indicator: 'CFTC leveraged-fund gross short',
    weight: 'Med',
    current: '$312B',
    rules: [
      { condition: 'New record short while the 30y fails to make a new yield high', shift: '+8pp', toward: 'D' },
      { condition: 'Gross short falling more than 10% in a fortnight while yields RISE', shift: '+8pp', toward: 'B' },
    ],
    nextPrint: 'Fridays 15:30 ET, Tuesday data. The de-grossing signature is the single most useful weekly release in this framework and it is three days stale on arrival.',
  },
  {
    indicator: 'HY OAS with IG confirmation',
    weight: 'Med',
    current: 'HY +342bp, IG +108bp, CCC-BB +540bp',
    rules: [
      { condition: 'HY above 400 AND IG above 130 within a fortnight', shift: '+8pp', toward: 'C' },
      { condition: 'CCC-BB widening past 600bp with the index unchanged', shift: '+4pp', toward: 'C' },
      { condition: 'HY inside 320 with the index tightening', shift: '+4pp', toward: 'A' },
    ],
    nextPrint: 'Daily',
  },
  {
    indicator: 'SOFR-IORB, and the 99th-percentile tail',
    weight: 'Med',
    current: '-1.8bp median; 99th pct minus median = 14bp',
    rules: [
      { condition: 'Median above +5bp on a non-quarter-end day, or any SRF take-up', shift: '+8pp', toward: 'B' },
      { condition: '99th-pct tail above 25bp while the median is calm', shift: '+4pp', toward: 'B' },
    ],
    nextPrint: 'Daily 08:00 ET. Quarter-end 30 Sep is the near-term test.',
  },
  {
    indicator: 'MOVE and the vol regime',
    weight: 'Med',
    current: '118 (Q2 average 95)',
    rules: [
      { condition: 'Above 135', shift: '+5pp', toward: 'B' },
      { condition: 'Above 160 with VIX above 30', shift: '+6pp', toward: 'C' },
      { condition: 'Below 105 with the 30y unchanged', shift: '+5pp', toward: 'D' },
    ],
    nextPrint: 'Daily',
  },
  {
    indicator: 'WTI',
    weight: 'Med',
    current: '$92',
    rules: [
      { condition: 'Sustained above $110', shift: '+7pp', toward: 'C' },
      { condition: 'Back below $78', shift: '+4pp', toward: 'D' },
    ],
    nextPrint: 'Continuous. OPEC+ meeting and any Gulf escalation.',
  },
];

// ------------------------------------------------------------- the book ----

export const trades: TradeExpression[] = [
  {
    name: '5s30s steepener',
    type: 'Curve',
    scenarios: ['A', 'B'],
    entry: 'Current +50bp. Scale in on any 5y auction tailing more than 2.5bp.',
    sizing: 'DV01-neutral: $338mm 5y per $100mm 30y (5y DV01 $440/mm, 30y DV01 $1,487/mm, both computed by lib/curve.ts from the live anchor, not typed). Units below are bp of the 5s30s spread. Getting this ratio wrong converts a curve view into an accidental short-duration position, which is how a correct curve call still loses money.',
    carryBpPerQuarter: -1,
    targetBp: 25,
    stopBp: 12,
    invalidation: 'Spread through +38bp, or the 7 Nov QRA guiding bill share above 22% - the second kills the thesis before the price moves.',
    payoffShape: 'linear-bounded',
    asymmetryNote: 'The honest read: 2.1:1 on stated levels, and that is as good as it gets. There is no version of a par curve trade that pays multiplicatively. Note also that the carry claim has been corrected downward - the three-month roll-down computed off the live curve is -1bp, not the +4bp originally asserted, because the 5y sector is the flattest part of the curve and rolls almost nowhere. This trade is in the book because it is the cleanest expression of the supply thesis, not because it pays to wait.',
  },
  {
    name: '2s5s10s belly cheapener (sell the belly)',
    type: 'Curve',
    scenarios: ['A'],
    entry: 'Fly at -21bp. Sell 5y against 2y and 10y wings.',
    sizing: 'DV01-neutral 50/50 wings. Units are bp of the fly.',
    carryBpPerQuarter: -2,
    targetBp: 16,
    stopBp: 12,
    invalidation: 'Fly through -33bp, or any Fed speaker explicitly endorsing 2027 cuts.',
    payoffShape: 'linear-bounded',
    asymmetryNote: 'This is the direct expression of the dual-narrative gap in Scenario A: the market prices a short summit, the Fed describes a long plateau. If the Fed is right, the belly is the tenor that has to be wrong, because the 5y is where "high for a while" and "high then cuts" disagree most. A clean way to own a disagreement rather than a direction.',
  },
  {
    name: 'Long 10y swap spread (own cash, pay fixed)',
    type: 'Swap Spread',
    scenarios: ['B', 'D'],
    entry: '-12bp. Add at -16bp.',
    sizing: 'DV01-matched cash vs swap. Units are bp of the spread.',
    carryBpPerQuarter: -2,
    targetBp: 8,
    stopBp: 10,
    invalidation: 'Through -22bp. That level says balance-sheet scarcity is structural rather than cyclical, and the mean-reversion premise is dead.',
    payoffShape: 'linear-bounded',
    asymmetryNote: 'Deliberately below 1:1 on reward-to-risk, and the audit panel flags it - correctly. It is in the book anyway because it is a mean-reversion trade with a historically high hit rate (swap spreads have retraced from every level beyond -20bp since 2021), and because it is the one expression that pays in BOTH the meltdown and the squeeze: in B because the Fed responds, in D because the inventory clears. A low-RR, high-hit-rate, scenario-straddling hedge is a legitimate thing to own, but only if you say out loud that that is what it is.',
  },
  {
    name: 'Conditional bull steepener (6m2y receiver vs 6m10y receiver)',
    type: 'Vol',
    scenarios: ['C'],
    entry: 'Buy 6m2y receiver, sell 6m10y receiver, struck 25bp out of the money. Net premium roughly 60bp.',
    sizing: 'Vega-weighted, not DV01-weighted. Units are bp of premium.',
    carryBpPerQuarter: -30,
    targetBp: 180,
    stopBp: 60,
    invalidation: 'Premium loss capped at the 60bp paid. Structurally cannot lose more.',
    payoffShape: 'convex',
    asymmetryNote: 'This is the right way to own Scenario C and a linear steepener is the wrong way. C bull-FLATTENS in Stage 1 before it bull-steepens in Stage 2 - a cash steepener bleeds through the first four weeks and is often stopped out before the thesis pays. The conditional version only engages in the rally, so it sits out the whipsaw entirely. 3:1 on stated levels, with the loss capped at premium by construction. The cost is 30bp a quarter of theta, which is what convexity costs when you buy it honestly.',
  },
  {
    name: 'Long 5y5y breakeven',
    type: 'Breakevens',
    scenarios: ['A', 'B'],
    entry: '2.72%. Add on any CPI above 0.3% m/m.',
    sizing: 'Real-rate DV01-matched TIPS vs nominal. Units are bp of the breakeven.',
    carryBpPerQuarter: 3,
    targetBp: 20,
    stopBp: 15,
    invalidation: 'Below 2.57%, or WTI sustained under $78.',
    payoffShape: 'linear-bounded',
    asymmetryNote: '1.3:1, positive carry. The real reason it is in the book is correlation, not expected value: it is the only line that profits if the Fed cuts into 3% inflation, which is the branch (C2 in the probability tree, 30% conditional) that hurts every other expression simultaneously.',
  },
  {
    name: 'Long 3m30y receiver, 25-delta',
    type: 'Vol',
    scenarios: ['D'],
    entry: 'Roughly 35bp of premium with MOVE at 118.',
    sizing: 'Small - 10-15% of the book risk budget. Units are bp of premium.',
    carryBpPerQuarter: -35,
    targetBp: 175,
    stopBp: 35,
    invalidation: 'Expiry. Maximum loss is the premium.',
    payoffShape: 'multiplicative',
    asymmetryNote: 'The only genuinely multiplicative line in the book, and it exists because of the term-premium attribution: about 22 of 78bp of term premium has no fundamental owner. If a crowded short covers into a soft PCE print, the 30y rallies 40bp in a fortnight with no macro change at all, and a 25-delta receiver bought at 35bp is worth several multiples of that. 5:1 on stated levels. It also hedges the largest single risk to the rest of the book, which is that the 5s30s steepener and the breakeven are both, underneath, short duration.',
  },
  {
    name: 'CDX HY payer spread (Dec, 375/450 strikes)',
    type: 'Credit',
    scenarios: ['C'],
    entry: 'Buy 375 payer, sell 450 payer. Net premium roughly 45bp.',
    sizing: 'Units are bp of premium. Defined risk.',
    carryBpPerQuarter: -45,
    targetBp: 150,
    stopBp: 45,
    invalidation: 'Expiry. Loss capped at premium.',
    payoffShape: 'convex',
    asymmetryNote: 'Replaces v1\'s cash HY-vs-IG decompression, which cost 20bp a year of negative carry to hold a linear view with unlimited downside if spreads ground tighter. The payer spread expresses exactly the same thesis with the loss capped and a 3.3:1 payoff. The 450 strike is sold because the framework does not have a view on spreads beyond 450 - selling the part of the distribution you have no opinion about is free money for as long as you are honest about the boundary.',
  },
];

// ------------------------------------------------------------- watchlist ---

export const watchlist = [
  { date: '2026-09-26', event: 'August PCE deflator', impact: 'THE event of this run. At or below 0.20% m/m shifts 8pp to D and guts the December pricing. Above 0.30% shifts 7pp to B.', weight: 'CRITICAL' },
  { date: '2026-09-30', event: 'Quarter-end', impact: 'The plumbing test. SOFR-IORB above +5bp or any SRF take-up moves 8pp to B. A clean turn is genuine evidence for A.', weight: 'HIGH' },
  { date: '2026-10-01', event: 'Q4 begins; ISM manufacturing', impact: 'ISM employment sub-index below 48 is an early C signpost.', weight: 'MED' },
  { date: '2026-10-04', event: 'September payrolls', impact: 'Below 50k or a negative revision to August shifts toward C. Above 180k locks in A.', weight: 'HIGH' },
  { date: '2026-10-09', event: 'CFTC TFF (1 Oct data)', impact: 'The de-grossing signature. Short covering into falling yields is the D confirmation; rising shorts into rising yields confirms B.', weight: 'MED' },
  { date: '2026-10-10', event: '10y auction, $39B', impact: 'Tail above 2.5bp with indirects below 58% is the single cleanest B trigger. Stopping through with indirects above 68% is the D trigger.', weight: 'CRITICAL' },
  { date: '2026-10-11', event: '30y auction, $22B', impact: 'Tail above 3bp confirms. Watch dealer takedown above 25% more than the tail itself.', weight: 'HIGH' },
  { date: '2026-10-14', event: 'September CPI', impact: 'Core above 0.35% m/m forces a hawkish repricing. Watch the CPI-PCE wedge - shelter and used cars carry different weights and the divergence has been running 20bp.', weight: 'HIGH' },
  { date: '2026-10-15', event: 'Retail sales; bank Q3 earnings begin', impact: 'Bank commentary on deposit costs and CRE reserve builds is the best available read on the credit cycle before the data shows it.', weight: 'MED' },
  { date: '2026-10-22', event: 'Fed speakers, pre-blackout', impact: 'Listen for "well-anchored" used defensively, and for any shift from core to headline emphasis. Both are C2 tells.', weight: 'MED' },
  { date: '2026-10-28', event: 'FOMC, day 1', impact: 'Two-day meeting. No SEP. The statement language on the balance sheet matters more than the rate decision.', weight: 'HIGH' },
  { date: '2026-10-29', event: 'FOMC decision', impact: 'Hold is priced. The dissent count is the information - a 9-3 repeat keeps December live, a 11-1 hold takes it to a coin flip.', weight: 'CRITICAL' },
  { date: '2026-10-31', event: 'Month-end; Treasury financing estimates', impact: 'The pre-announcement to the QRA. Borrowing estimates land here and set up 7 Nov.', weight: 'HIGH' },
  { date: '2026-11-01', event: 'October payrolls', impact: 'The last labour print before December. Sets the hike question.', weight: 'HIGH' },
  { date: '2026-11-07', event: 'Quarterly Refunding Announcement', impact: 'The single most consequential scheduled event for Scenario B, and the cheapest possible resolution of it. Bill share guided above 22% removes roughly $40B/month of duration and kills B at a stroke. Below 19% and B gets 10pp.', weight: 'CRITICAL' },
];

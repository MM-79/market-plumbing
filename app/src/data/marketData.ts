// ============================================================================
// Yield-Curve-Prime - market anchor and diagnostic spine
//
// AS_OF: 2026-09-24 | HORIZON: 6 months | VOICE_DIAL: 2
//
// PROVENANCE WARNING, STATED ONCE AND MEANT
// This file is a hand-maintained snapshot. It is not wired to FRED, the NY Fed
// or Treasury. Nothing here refreshes itself. Every figure is what a human
// typed after reading a source, and the `asOf` field on each observation is the
// date of the OBSERVATION, not the date someone typed it. docs/REFRESH_RUNBOOK.md
// lists the exact pulls, in order, that make this file true again. Until that
// runbook is run, treat the audit panel's staleness warnings as the truth and
// the confident prose as a period piece.
// ============================================================================

import type {
  CurvePoint, Observation, PathRow, Scenario, SourceRef, TradeExpression,
} from '../types/framework';
import type { TenYearDecomposition } from '../lib/curve';

export const runSettings = {
  asOfDate: '2026-09-24',
  scenarioHorizon: '6 months',
  voiceDial: 2,
  voiceLabel: 'Gonzo Thriller',
  length: 'Standard',
  institutionLens: 'ON',
  exoticAppendix: 'ON',
  macroLens: 'Sehgal ON',
  focusQuestion: 'Is the long end pricing term premium, or fiscal doom, or just a crowded short?',
  priorRunDate: '2026-09-17',
};

// ---------------------------------------------------------------- sources ---

export const SOURCES: SourceRef[] = [
  { key: 'ust-par', title: 'Treasury Par Yield Curve Rates', url: 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve', cadence: 'Daily, ~15:30 ET' },
  { key: 'ust-auction', title: 'TreasuryDirect Auction Results', url: 'https://www.treasurydirect.gov/auctions/announcements-data-results/', cadence: 'Per auction' },
  { key: 'qra', title: 'Quarterly Refunding Statements and TBAC minutes', url: 'https://home.treasury.gov/policy-issues/financing-the-government/quarterly-refunding', cadence: 'Quarterly' },
  { key: 'dts', title: 'Daily Treasury Statement (TGA)', url: 'https://fiscaldata.treasury.gov/datasets/daily-treasury-statement/', cadence: 'Daily' },
  { key: 'mts', title: 'Monthly Treasury Statement (deficit, interest outlays)', url: 'https://fiscaldata.treasury.gov/datasets/monthly-treasury-statement/', cadence: 'Monthly, ~8th business day' },
  { key: 'h41', title: 'Federal Reserve H.4.1 - Factors Affecting Reserve Balances', url: 'https://www.federalreserve.gov/releases/h41/', cadence: 'Thursday 16:30 ET' },
  { key: 'nyfed-rates', title: 'NY Fed Reference Rates (SOFR, TGCR, EFFR)', url: 'https://www.newyorkfed.org/markets/reference-rates/sofr', cadence: 'Daily, 08:00 ET' },
  { key: 'nyfed-rrp', title: 'NY Fed Repo and Reverse Repo Operations', url: 'https://www.newyorkfed.org/markets/desk-operations/reverse-repo', cadence: 'Daily' },
  { key: 'acm', title: 'NY Fed ACM Term Premium Estimates', url: 'https://www.newyorkfed.org/research/data_indicators/term-premia-tabs', cadence: 'Daily, lagged' },
  { key: 'kw', title: 'Kim-Wright Term Premium (FRED THREEFYTP10)', url: 'https://fred.stlouisfed.org/series/THREEFYTP10', cadence: 'Daily, lagged' },
  { key: 'fred-bei', title: 'FRED 5y5y Forward Breakeven (T5YIFR) and 10y TIPS (DFII10)', url: 'https://fred.stlouisfed.org/series/T5YIFR', cadence: 'Daily' },
  { key: 'bea-pce', title: 'BEA Personal Income and Outlays (PCE price index)', url: 'https://www.bea.gov/data/personal-consumption-expenditures-price-index', cadence: 'Monthly' },
  { key: 'bls', title: 'BLS Employment Situation and CPI', url: 'https://www.bls.gov/news.release/', cadence: 'Monthly' },
  { key: 'fedwatch', title: 'CME FedWatch Tool', url: 'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html', cadence: 'Live' },
  { key: 'sep', title: 'FOMC Summary of Economic Projections', url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm', cadence: 'Quarterly' },
  { key: 'cftc', title: 'CFTC Traders in Financial Futures', url: 'https://www.cftc.gov/MarketReports/CommitmentsofTraders/', cadence: 'Friday 15:30 ET, Tuesday data' },
  { key: 'tic', title: 'Treasury International Capital (TIC)', url: 'https://home.treasury.gov/data/treasury-international-capital-tic-system', cadence: 'Monthly, ~6 week lag' },
  { key: 'pmms', title: 'Freddie Mac Primary Mortgage Market Survey', url: 'https://www.freddiemac.com/pmms', cadence: 'Thursday' },
  { key: 'ice-oas', title: 'ICE BofA IG (BAMLC0A0CM) and HY (BAMLH0A0HYM2) OAS via FRED', url: 'https://fred.stlouisfed.org/series/BAMLH0A0HYM2', cadence: 'Daily' },
  { key: 'move', title: 'ICE BofA MOVE Index', url: 'https://indices.theice.com/', cadence: 'Daily' },
  { key: 'eia', title: 'EIA Petroleum and Short-Term Energy Outlook', url: 'https://www.eia.gov/petroleum/', cadence: 'Weekly / monthly' },
  { key: 'boj', title: 'Bank of Japan Statistics and MoF JGB yields', url: 'https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/', cadence: 'Daily' },
  { key: 'ffiec', title: 'FFIEC Call Reports - AFS/HTM unrealized positions', url: 'https://cdr.ffiec.gov/public/', cadence: 'Quarterly' },
  { key: 'ofr', title: 'OFR Short-Term Funding Monitor', url: 'https://www.financialresearch.gov/short-term-funding-monitor/', cadence: 'Daily' },
  { key: 'cbo', title: 'CBO Budget and Economic Outlook', url: 'https://www.cbo.gov/data/budget-economic-data', cadence: 'Semiannual' },
];

// --------------------------------------------------- the anchor, verified ---

/**
 * The single source of truth for today's curve. Every spread quoted anywhere in
 * this application is computed from these four numbers by lib/curve.ts.
 *
 * v1 BUG FIXED HERE: the par-curve panel carried 10y = 4.96 and 30y = 5.30,
 * which were the pre-FOMC (16 Sep) levels, while the anchor table and all
 * twelve scenario path rows carried 5.14 and 5.34. The dashboard therefore
 * displayed 2s10s = +21bp next to a narrative arguing about +39bp. Two
 * different curves were on screen at once.
 */
export const parCurve: CurvePoint[] = [
  { tenor: 2, label: '2y', parYield: 4.75 },
  { tenor: 5, label: '5y', parYield: 4.84 },
  { tenor: 10, label: '10y', parYield: 5.14 },
  { tenor: 30, label: '30y', parYield: 5.34 },
];

export const anchor = { y2: 4.75, y5: 4.84, y10: 5.14, y30: 5.34 };

/** Registry of scalar observations, each with provenance. Feeds the audit. */
export const observations: Record<string, Observation> = {
  y2:        { value: 4.75, unit: 'pct', tag: 'D', asOf: '2026-09-24', source: 'ust-par', staleAfterDays: 2 },
  y5:        { value: 4.84, unit: 'pct', tag: 'D', asOf: '2026-09-24', source: 'ust-par', staleAfterDays: 2 },
  y10:       { value: 5.14, unit: 'pct', tag: 'D', asOf: '2026-09-24', source: 'ust-par', staleAfterDays: 2 },
  y30:       { value: 5.34, unit: 'pct', tag: 'D', asOf: '2026-09-24', source: 'ust-par', staleAfterDays: 2, note: 'Cycle high; highest since 2007' },
  fedFundsMid:{ value: 3.875, unit: 'pct', tag: 'D', asOf: '2026-09-16', source: 'sep', staleAfterDays: 60 },
  acm10y:    { value: 78, unit: 'bp', tag: 'D', asOf: '2026-09-23', source: 'acm', staleAfterDays: 4 },
  kw10y:     { value: 65, unit: 'bp', tag: 'D', asOf: '2026-09-23', source: 'kw', staleAfterDays: 4 },
  tips10y:   { value: 2.42, unit: 'pct', tag: 'D', asOf: '2026-09-24', source: 'fred-bei', staleAfterDays: 2 },
  bei5y5y:   { value: 2.72, unit: 'pct', tag: 'D', asOf: '2026-09-24', source: 'fred-bei', staleAfterDays: 2 },
  corePce3m: { value: 3.6, unit: 'pct', tag: 'D', asOf: '2026-07-31', source: 'bea-pce', staleAfterDays: 45, note: 'July data, released late Aug. Aug print due 26 Sep.' },
  nfp:       { value: 142, unit: 'count', tag: 'D', asOf: '2026-08-31', source: 'bls', staleAfterDays: 40 },
  unemployment:{ value: 4.1, unit: 'pct', tag: 'D', asOf: '2026-08-31', source: 'bls', staleAfterDays: 40 },
  reserves:  { value: 3.28, unit: 'usd_tn', tag: 'D', asOf: '2026-09-17', source: 'h41', staleAfterDays: 10 },
  tga:       { value: 782, unit: 'usd_bn', tag: 'D', asOf: '2026-09-23', source: 'dts', staleAfterDays: 4 },
  onRrp:     { value: 89, unit: 'usd_bn', tag: 'D', asOf: '2026-09-23', source: 'nyfed-rrp', staleAfterDays: 3 },
  sofrIorb:  { value: -1.8, unit: 'bp', tag: 'D', asOf: '2026-09-23', source: 'nyfed-rates', staleAfterDays: 3 },
  swapSpread10y:{ value: -12, unit: 'bp', tag: 'D', asOf: '2026-09-23', source: 'ofr', staleAfterDays: 4 },
  mortgage30y:{ value: 7.22, unit: 'pct', tag: 'D', asOf: '2026-09-23', source: 'pmms', staleAfterDays: 9 },
  igOas:     { value: 108, unit: 'bp', tag: 'D', asOf: '2026-09-23', source: 'ice-oas', staleAfterDays: 3 },
  hyOas:     { value: 342, unit: 'bp', tag: 'D', asOf: '2026-09-23', source: 'ice-oas', staleAfterDays: 3 },
  move:      { value: 118, unit: 'index', tag: 'D', asOf: '2026-09-23', source: 'move', staleAfterDays: 3 },
  vix:       { value: 19.4, unit: 'index', tag: 'D', asOf: '2026-09-23', source: 'move', staleAfterDays: 3 },
  wti:       { value: 92, unit: 'usd_bn', tag: 'D', asOf: '2026-09-23', source: 'eia', staleAfterDays: 4, note: 'USD per barrel' },
  jgb10y:    { value: 1.28, unit: 'pct', tag: 'D', asOf: '2026-09-23', source: 'boj', staleAfterDays: 4 },
  basisTrade:{ value: 312, unit: 'usd_bn', tag: 'D', asOf: '2026-09-16', source: 'cftc', staleAfterDays: 12, note: 'Leveraged-fund gross UST futures short, CFTC TFF' },
};

// -------------------------------------------- what changed since last run ---

export const anchorCheck = {
  priorRun: '2026-09-17',
  corrections: [
    { field: '10y par yield', prior: '4.96%', now: '5.14%', delta: '+18bp', note: 'Post-FOMC repricing. v1 dashboard was still showing the 4.96 print in the curve panel while quoting 5.14 everywhere else.', status: 'corrected' },
    { field: '30y par yield', prior: '5.18%', now: '5.34%', delta: '+16bp', note: 'Cycle high, highest since 2007.', status: 'updated' },
    { field: '2y par yield', prior: '4.69%', now: '4.75%', delta: '+6bp', note: 'Dec hike odds 58% -> 72%.', status: 'updated' },
    { field: '5y par yield', prior: '4.79%', now: '4.84%', delta: '+5bp', note: 'Belly cheapened after the 3.1bp tail on 18 Sep.', status: 'updated' },
    { field: 'Fed funds target', prior: '3.75-4.00%', now: '3.75-4.00%', delta: 'unch', note: 'Held 16 Sep, vote 9-3, three dissents for a hike.', status: 'verified' },
    { field: 'ACM 10y term premium', prior: '+71bp', now: '+78bp', delta: '+7bp', note: 'Kim-Wright corroborates direction at +65bp; the two models disagree on level by 13bp, which is itself the honest error bar.', status: 'updated' },
    { field: 'Core PCE 3m SAAR', prior: '3.6%', now: '3.6%', delta: 'unch', note: 'STALE. July data. August print lands 26 Sep and is the single biggest information event in this run.', status: 'stale' },
    { field: 'MOVE', prior: '112', now: '118', delta: '+6', note: 'Above the 95 Q2 average; still well short of the 135 that marks genuine dysfunction.', status: 'updated' },
    { field: 'HY OAS', prior: '+335bp', now: '+342bp', delta: '+7bp', note: 'Drifting, not gapping. Credit has not confirmed the rates story.', status: 'updated' },
    { field: '10y swap spread', prior: '-10bp', now: '-12bp', delta: '-2bp', note: 'Watch this more closely than the auction tails. It is the cleanest read on dealer balance-sheet scarcity.', status: 'updated' },
  ],
};

// ------------------------------------------------- 10y move decompositions ---

/**
 * Three windows, each reconciling twice. The rule enforced by lib/audit.ts is
 * that path + term premium sums to the total AND real + breakeven sums to the
 * total, independently. They are two cameras on one object, not four
 * ingredients in one soup.
 */
export const decompositions: TenYearDecomposition[] = [
  {
    window: 'Since the February low',
    startDate: '2026-02-12',
    startY10: 4.12, startY2: 4.35, endY10: 5.14, endY2: 4.75,
    expectedPathBp: 70, termPremiumBp: 32,
    realYieldBp: 66, breakevenBp: 36,
    comment: 'Two thirds of a 102bp move is the expected policy path: the market went from pricing two cuts to pricing a hike. Term premium contributed 32bp per ACM. On the other camera, 66bp is real yield and 36bp is inflation compensation. The honest reading is that this is mostly a growth-and-policy repricing wearing a fiscal costume - the fiscal story owns roughly a third of it, not the whole thing.',
  },
  {
    window: 'Since Jackson Hole',
    startDate: '2026-08-28',
    startY10: 4.82, startY2: 4.57, endY10: 5.14, endY2: 4.75,
    expectedPathBp: 20, termPremiumBp: 12,
    realYieldBp: 22, breakevenBp: 10,
    comment: 'Here the mix shifts. The 30y outran the 10y by 10bp and the 10y outran the 2y by 14bp, so the long end genuinely led. But even in the window most favourable to the fiscal thesis, term premium is only 12 of 32bp. The supply narrative is real and it is not the majority of the move.',
  },
  {
    window: 'Since the September FOMC',
    startDate: '2026-09-16',
    startY10: 4.96, startY2: 4.69, endY10: 5.14, endY2: 4.75,
    expectedPathBp: 11, termPremiumBp: 7,
    realYieldBp: 12, breakevenBp: 6,
    comment: 'An 18bp move on an unchanged policy rate, driven by a SEP median that carried one more hike than the strip priced, plus three dissents in favour of hiking now. The market is repricing the reaction function, not the level.',
  },
];

// ------------------------------------------------------- diagnostic spine ---

export interface Layer {
  id: string;
  name: string;
  subtitle: string;
  metrics: { name: string; value: string; tag: 'D' | 'E' | 'I' | 'S' }[];
  signal: 'BEARISH' | 'BULLISH' | 'NEUTRAL';
  signalDetail: string;
  confidence: 'HIGH' | 'MED' | 'LOW';
  narrative: string;
  /** The strongest argument that this layer's own signal is wrong. Mandatory. */
  steelman: string;
  /** One observable that would flip the signal. Must be a number with a date. */
  flipsOn: string;
}

export const diagnosticLayers: Layer[] = [
  {
    id: 'L1',
    name: 'Short-End Engine',
    subtitle: 'Policy & Macro',
    metrics: [
      { name: 'Fed funds target', value: '3.75-4.00%', tag: 'D' },
      { name: 'FedWatch Dec hike', value: '72%', tag: 'D' },
      { name: 'SEP median 2026', value: '4.10%', tag: 'D' },
      { name: 'FOMC vote (16 Sep)', value: '9-3 hold', tag: 'D' },
      { name: 'Core PCE 3m SAAR', value: '3.6%', tag: 'D' },
      { name: 'Services ex-housing 3m', value: '3.8%', tag: 'D' },
      { name: 'NFP (Aug)', value: '+142k', tag: 'D' },
      { name: 'NFP 3m avg', value: '+118k', tag: 'D' },
      { name: 'Unemployment', value: '4.1%', tag: 'D' },
      { name: 'Sahm rule', value: '0.43', tag: 'D' },
      { name: '5y5y breakeven', value: '2.72%', tag: 'D' },
      { name: '10y TIPS real', value: '2.42%', tag: 'D' },
      { name: 'Real funds vs core PCE', value: '+0.28%', tag: 'E' },
      { name: 'Holston-Laubach-Williams r*', value: '~0.95%', tag: 'D' },
    ],
    signal: 'BEARISH',
    signalDetail: 'Yields higher, front-led',
    confidence: 'HIGH',
    narrative: 'Warsh has the dots and three dissents pushing the same way. The strip prices 72% for December, above SEP guidance, which is unusual - the market rarely out-hawks the committee. Core services ex-housing at 3.8% 3m SAAR is the number that keeps this alive. Labour is cooling without cracking: Sahm at 0.43 sits under the 0.50 trigger, and the 3m NFP average of 118k is a soft landing, not a stall. Here is the part that gets skipped: with the funds mid at 3.875% and core PCE at 3.6%, the REAL policy rate is +0.28%, against an HLW r* near 0.95%. On that arithmetic policy is not restrictive at all. The Fed is still removing accommodation; it has not yet arrived at restriction. That distinction governs the whole terminal-rate calculus, and nobody in the fiscal-doom camp is pricing it.',
    steelman: 'The strip has out-hawked the committee before and been wrong every time since 2023. 72% priced for December is a crowded position, not a forecast, and the August PCE print on 26 Sep can vaporise it in a single session. Beyond that, the 3.8% services number is increasingly a shelter-and-insurance artefact rather than a wage story; if the Fed looks through it, the entire front-end repricing unwinds.',
    flipsOn: 'August core PCE (26 Sep) printing at or below 0.20% m/m, which would drag the 3m SAAR toward 3.0% and cut the December probability below 50%.',
  },
  {
    id: 'L2',
    name: 'The Meat Grinder',
    subtitle: 'Fiscal Supply & Term Premium',
    metrics: [
      { name: 'Deficit YTD FY26', value: '$1.92T', tag: 'D' },
      { name: 'of which net interest', value: '$0.94T', tag: 'D' },
      { name: 'Primary deficit', value: '$0.98T (3.1% GDP)', tag: 'E' },
      { name: 'Net coupon issuance', value: '$128B/mo', tag: 'E' },
      { name: 'Bill share of debt', value: '18.2%', tag: 'D' },
      { name: 'TBAC bill guidance', value: '~20%', tag: 'D' },
      { name: 'ACM term premium 10y', value: '+78bp', tag: 'D' },
      { name: 'Kim-Wright TP 10y', value: '+65bp', tag: 'D' },
      { name: 'Model disagreement', value: '13bp', tag: 'E' },
      { name: '5y tail (18 Sep)', value: '+3.1bp', tag: 'D' },
      { name: '10y tail (11 Sep)', value: '+2.4bp', tag: 'D' },
      { name: '10y indirect (11 Sep)', value: '62.8% vs 65% avg', tag: 'D' },
      { name: 'IG issuance YTD', value: '$1.12T', tag: 'D' },
      { name: 'AI/hyperscaler YTD', value: '$184B', tag: 'E' },
      { name: 'Buyback operations', value: '$18B/mo', tag: 'D' },
    ],
    signal: 'BEARISH',
    signalDetail: 'Yields higher, long-led',
    confidence: 'MED',
    narrative: 'Treasury is pushing $128B a month of net coupon into a market whose natural duration buyers have gone quiet, and it is doing so with a bill share of 18.2% - below TBAC guidance, meaning the mix choice is actively adding duration rather than absorbing it. The 5y tailing 3.1bp with a 62.8% indirect on the 10y is the tell. But read the deficit properly before calling it doom. Of $1.92T, roughly $0.94T is net interest, which accrues to holders of capital and produces almost no consumption multiplier. The PRIMARY deficit is about 3.1% of GDP. A 3% primary deficit against nominal growth near 5% is not a debt spiral; it is a country with a large interest bill. Confidence is MED and deliberately so: the term premium models disagree by 13bp, which is a fifth of the entire repricing they are supposed to be measuring.',
    steelman: 'The whole supply story may be a positioning story wearing a macro costume. Term premium is not observed - it is the residual of a model - and both ACM and Kim-Wright back it out of the same yield curve they are meant to explain, which makes the reasoning close to circular. Meanwhile CFTC shows leveraged funds at a record gross short. If the long end is cheap because everyone is already short it, then the marginal seller is exhausted and the pain trade is a rally. Note too that Treasury can defuse this at a press release: a bill-share shift to 22% removes roughly $40B a month of duration without a single policy change.',
    flipsOn: 'Two consecutive coupon auctions stopping through the screws with indirects above 68%, or the 7 Nov QRA guiding bill share above 21%. Either says the buyer strike was a price, not a boycott.',
  },
  {
    id: 'L3',
    name: 'Shadow Plumbing',
    subtitle: 'Liquidity & Balance Sheets',
    metrics: [
      { name: 'Reserves', value: '$3.28T', tag: 'D' },
      { name: 'Reserves / GDP', value: '11.2%', tag: 'E' },
      { name: 'Lowest Comfortable Level est.', value: '10.0-10.5% GDP', tag: 'E' },
      { name: 'Headroom to LCLoR', value: '~$200B', tag: 'E' },
      { name: 'TGA', value: '$782B', tag: 'D' },
      { name: 'ON RRP', value: '$89B', tag: 'D' },
      { name: 'SOFR - IORB', value: '-1.8bp', tag: 'D' },
      { name: 'TGCR - IORB', value: '-3.2bp', tag: 'D' },
      { name: 'SRF usage', value: '$0', tag: 'D' },
      { name: 'SOFR 99th pct - median', value: '14bp', tag: 'D' },
      { name: 'Leveraged fund basis', value: '$312B gross', tag: 'D' },
      { name: 'Sponsored repo share', value: '38%', tag: 'D' },
      { name: 'Dealer UST inventory', value: '$284B (>90th pct)', tag: 'D' },
    ],
    signal: 'NEUTRAL',
    signalDetail: 'Functional; thin margin for error',
    confidence: 'MED',
    narrative: 'The plumbing works, which is not the same as the plumbing being safe. SOFR is still printing through IORB and the standing repo facility has taken zero, so on the headline measures there is no stress at all. The fragility is in the buffers, not the prints. ON RRP at $89B means the shock absorber that soaked up $2.5T in 2022 is effectively gone; the next drain comes straight out of reserves. At 11.2% of GDP, reserves sit perhaps $200B above most estimates of the lowest comfortable level - that is about eight weeks of runoff plus one bad tax date. Watch the 99th-percentile-to-median SOFR spread at 14bp rather than the median itself: distributions widen before medians move, and in September 2019 the tails were screaming for two weeks while the average looked immaculate. The $312B basis position is the accelerant, not the spark.',
    steelman: 'Every ingredient of this warning was in place a year ago and nothing broke, because the Fed now has tools it did not have in 2019. The SRF is standing, counterparties are pre-positioned, central clearing is phasing in and is genuinely balance-sheet-efficient. Repo stress in 2026 is a one-day print and a policy response, not a crisis. Assuming otherwise is fighting the last war with the last war\'s toolkit.',
    flipsOn: 'SOFR-IORB printing above +5bp on a non-quarter-end day, or any non-zero SRF take-up outside a settlement date. Either means the buffer is actually binding rather than theoretically thin.',
  },
  {
    id: 'L4',
    name: 'Cross-Border Flows',
    subtitle: 'International Capital',
    metrics: [
      { name: 'Foreign official custody', value: '$3.58T', tag: 'D' },
      { name: 'Japan holdings', value: '$1.04T', tag: 'D' },
      { name: 'China holdings', value: '$748B', tag: 'D' },
      { name: 'JGB 10y', value: '1.28%', tag: 'D' },
      { name: 'JGB 30y', value: '2.64%', tag: 'D' },
      { name: 'UST 10y hedged into JPY', value: '5.82%', tag: 'E' },
      { name: 'UST 10y hedged into EUR', value: '4.18%', tag: 'E' },
      { name: 'JPY 3m implied vol', value: '11.2%', tag: 'D' },
      { name: 'Unhedged pickup vs JGB', value: '386bp', tag: 'E' },
    ],
    signal: 'BEARISH',
    signalDetail: 'Marginal buyer is domestic and price-sensitive',
    confidence: 'LOW',
    narrative: 'The hedged carry for a Japanese lifer is 5.82% against a 1.28% JGB, which sounds like free money until you notice the 30y JGB at 2.64% offers the same duration with no currency basis, no hedge roll and no board-level conversation about FX losses. Domestic Japanese duration has become a genuine substitute for the first time in twenty years, and that is the structural change that matters more than any month of TIC data. China at $748B continues its slow, political walk lower. The marginal buyer of the long end is now a domestic US real-money account that has to be paid to show up. Confidence is LOW and should be: TIC runs a six-week lag, custody data conflates custody with ownership, and the hedged-yield figure is an estimate built on a cross-currency basis that moves 15bp in a week.',
    steelman: 'Foreign private demand is not the same as foreign official demand, and the private bid has been absorbing what officials leave behind for three years running. At a 5.82% hedged yield the UST is not competing with the JGB, it is competing with Japanese credit and equities, and on that comparison it wins. Meanwhile "foreigners are selling" has been an evergreen bear thesis since 2013 and has never once been the thing that moved the 10y 50bp.',
    flipsOn: 'The BoJ hiking to 1.25% or the 30y JGB clearing 3.00%. That makes domestic Japanese duration decisively better than hedged USTs and turns a slow rotation into a scheduled one.',
  },
  {
    id: 'L5',
    name: 'Convexity & MBS',
    subtitle: 'Mortgage Market Dynamics',
    metrics: [
      { name: '30y fixed (PMMS)', value: '7.22%', tag: 'D' },
      { name: 'Primary-secondary spread', value: '268bp', tag: 'D' },
      { name: 'MBS OAS (5.5s)', value: '+148bp', tag: 'D' },
      { name: 'Index duration (MBS)', value: '5.8y', tag: 'E' },
      { name: 'Extension per +50bp', value: '+0.4y', tag: 'E' },
      { name: 'Convexity-hedge need', value: '~$18B 10y equiv / 50bp', tag: 'E' },
      { name: 'CPR (current)', value: '4.2%', tag: 'D' },
      { name: 'WAC outstanding', value: '3.82%', tag: 'D' },
      { name: 'Refi-incentive share', value: '<2% of pool', tag: 'E' },
      { name: 'Bank AFS unrealised', value: '-$412B', tag: 'D' },
      { name: 'Bank HTM unrealised', value: '-$612B', tag: 'E' },
    ],
    signal: 'BEARISH',
    signalDetail: 'Amplifier, not initiator',
    confidence: 'MED',
    narrative: 'The mortgage universe is a 3.82% coupon stack staring at a 7.22% market rate, so nothing prepays for any reason other than death, divorce or relocation - CPR 4.2% is pure turnover. The consequence is a portfolio that lengthens exactly when its owners least want it to: another 50bp of selloff adds about 0.4 years of index duration and forces roughly $18B 10y-equivalent of convexity selling from servicers and REITs. That is not the cause of a move. It is what turns a 15bp move into a 25bp move at 3pm on a Thursday. Note carefully who does NOT hedge: the Fed, and banks holding in HTM. A larger share of the mortgage stack sits in non-hedging hands than in 2013, which mutes the classic convexity vortex relative to the taper tantrum.',
    steelman: 'Negative convexity cuts both ways and the market has stopped pricing the other direction. This stack has essentially no prepayment risk left - it cannot extend much further because it is already fully extended, and the first serious rally has no refi wave to meet it because the primary-secondary spread at 268bp means originators will bank 100bp before passing any on. That makes current-coupon MBS one of the better convexity-adjusted assets available, not a hazard.',
    flipsOn: 'The primary-secondary spread compressing below 200bp, which would put 6.5% mortgages within reach on an unchanged 10y and wake up refi for the first time since 2021.',
  },
  {
    id: 'L6',
    name: 'Credit & Risk Assets',
    subtitle: 'Spread Markets',
    metrics: [
      { name: 'IG OAS', value: '+108bp', tag: 'D' },
      { name: 'HY OAS', value: '+342bp', tag: 'D' },
      { name: 'CCC OAS', value: '+782bp', tag: 'D' },
      { name: 'CCC minus BB', value: '+540bp', tag: 'D' },
      { name: 'IG all-in yield', value: '5.62%', tag: 'D' },
      { name: 'HY all-in yield', value: '8.48%', tag: 'D' },
      { name: 'Leveraged loan spread', value: '+425bp', tag: 'D' },
      { name: '2027 HY maturity wall', value: '$284B', tag: 'D' },
      { name: 'HY interest coverage', value: '2.8x', tag: 'E' },
      { name: 'Coverage at refi rates', value: '2.1x', tag: 'E' },
      { name: 'Private credit AUM', value: '~$1.2T', tag: 'E' },
      { name: 'PIK share of BDC income', value: '9.4%', tag: 'D' },
      { name: 'MOVE', value: '118', tag: 'D' },
      { name: 'VIX', value: '19.4', tag: 'D' },
      { name: 'S&P earnings yield - 10y', value: '-0.8%', tag: 'E' },
    ],
    signal: 'NEUTRAL',
    signalDetail: 'Dispersing beneath a calm index',
    confidence: 'MED',
    narrative: 'The index says nothing is wrong. HY at 342bp is 45bp off the August tights and comfortably inside the 400bp line where people start using the word stress. Look underneath and the story is different: CCC-BB at 540bp is the widest since 2023, which is the market sorting survivors from casualties rather than repricing the asset class. That is what the late innings look like - dispersion first, index second. The 2027 wall of $284B refinances at 8.48% against coupons struck near 5.5%, taking coverage from 2.8x to roughly 2.1x, which is survivable for BB and terminal for the bottom decile. The PIK share of BDC income at 9.4% is the same tell in private clothing: income booked, cash not received. The equity risk premium at -0.8% means equities carry no cushion for any of this.',
    steelman: 'All-in yield is what actually clears credit, and 8.48% brings in pension and insurance money that does not care about spread at all. Supply-driven widening with a full order book is not deterioration. The maturity wall has been refinanced early in every one of the last four cycles because issuers act eighteen months ahead, and the 2027 number has already shrunk 20% this year. Dispersion without index widening can equally mean the market is working properly.',
    flipsOn: 'HY OAS above 400bp with IG above 130bp in the same fortnight. Index-level confirmation is what turns dispersion into a cycle.',
  },
];

export { type PathRow, type Scenario, type TradeExpression };

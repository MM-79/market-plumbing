// ============================================================================
// Yield-Curve-Prime - narrative layer and live view builders.
//
// WHAT CHANGED IN v3.1
//
// This file used to contain the numbers. It now contains none of them. Every
// figure comes from lib/derive.ts reading the live snapshot, and what is left
// here is the part that genuinely cannot be fetched: the reasoning.
//
// The change was not optional. When the first real data arrived, the
// hand-typed snapshot turned out to be wrong on essentially every line - the
// 10y by 18bp, HY OAS by 69bp, the 5y5y breakeven by 36bp, and ON RRP by two
// orders of magnitude. The elaborate provenance apparatus built in v3.0 had
// been carefully documenting numbers that no source had ever published.
//
// The narratives below were re-reasoned against the live tape on the date in
// `narrativeReviewedOn`. When the data moves and the words do not, lib/audit.ts
// says so, because the characteristic failure of an auto-refreshing framework
// is stale judgement hiding behind fresh numbers.
// ============================================================================

import type { SourceRef } from '../types/framework';
import type { Snapshot } from '../lib/snapshot';
import { val, fmt } from '../lib/snapshot';
import { metric, manualMetric, avgIndirect, type LiveMetric } from '../lib/derive';

export const runSettings = {
  scenarioHorizon: '6 months',
  voiceDial: 2,
  voiceLabel: 'Gonzo Thriller',
  institutionLens: 'ON',
  exoticAppendix: 'ON',
  macroLens: 'Sehgal ON',
  focusQuestion: 'Is the long end pricing term premium, fiscal doom, or just a crowded short?',
  /** Date a human last re-reasoned the prose. Compared against the data date. */
  narrativeReviewedOn: '2026-09-24',
};

/**
 * Values with no free machine-readable feed. Each carries the date it was last
 * entered by hand, so the UI can age them exactly like fetched series - a
 * manual number that nobody has touched for a month is stale whether or not
 * anyone admits it.
 */
export const MANUAL_VALUES = {
  acm10y: { value: 78, asOf: '2026-09-23', unit: 'bp', label: 'ACM 10y term premium' },
  move: { value: 96, asOf: '2026-09-23', unit: 'index', label: 'MOVE index' },
  swapSpread10y: { value: -12, asOf: '2026-09-23', unit: 'bp', label: '10y SOFR swap spread' },
  mbsOas: { value: 148, asOf: '2026-09-23', unit: 'bp', label: 'Agency MBS current-coupon OAS' },
  lastAuctionTail: { value: 3.1, asOf: '2026-09-18', unit: 'bp', label: 'Most recent 5y auction tail' },
};

export const SOURCES: SourceRef[] = [
  { key: 'fred', title: 'FRED - St Louis Fed (curve, breakevens, credit, macro, fiscal)', url: 'https://fred.stlouisfed.org/', cadence: 'Daily to quarterly. Automated.' },
  { key: 'nyfed-rates', title: 'NY Fed Reference Rates (SOFR, TGCR, BGCR and percentiles)', url: 'https://www.newyorkfed.org/markets/reference-rates/sofr', cadence: 'Daily 08:00 ET. Automated.' },
  { key: 'fiscaldata', title: 'Treasury Fiscal Data (Debt to the Penny, Daily Treasury Statement)', url: 'https://fiscaldata.treasury.gov/', cadence: 'Daily. Automated.' },
  { key: 'treasurydirect', title: 'TreasuryDirect auction results', url: 'https://www.treasurydirect.gov/auctions/announcements-data-results/', cadence: 'Per auction. Automated.' },
  { key: 'acm', title: 'NY Fed ACM Term Premium Estimates', url: 'https://www.newyorkfed.org/research/data_indicators/term-premia-tabs', cadence: 'Daily, published as XLS. MANUAL.' },
  { key: 'qra', title: 'Quarterly Refunding Statements and TBAC minutes', url: 'https://home.treasury.gov/policy-issues/financing-the-government/quarterly-refunding', cadence: 'Quarterly. MANUAL.' },
  { key: 'h41', title: 'Federal Reserve H.4.1', url: 'https://www.federalreserve.gov/releases/h41/', cadence: 'Thursday 16:30 ET. Reserves and TGA come via FRED.' },
  { key: 'cftc', title: 'CFTC Traders in Financial Futures', url: 'https://www.cftc.gov/MarketReports/CommitmentsofTraders/', cadence: 'Friday 15:30 ET. MANUAL.' },
  { key: 'tic', title: 'Treasury International Capital (TIC)', url: 'https://home.treasury.gov/data/treasury-international-capital-tic-system', cadence: 'Monthly, six-week lag. MANUAL.' },
  { key: 'move', title: 'ICE BofA MOVE Index', url: 'https://indices.theice.com/', cadence: 'Daily. Proprietary. MANUAL.' },
  { key: 'ofr', title: 'OFR Short-Term Funding Monitor', url: 'https://www.financialresearch.gov/short-term-funding-monitor/', cadence: 'Daily. Swap spreads MANUAL.' },
  { key: 'sep', title: 'FOMC calendar, statements and SEP', url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm', cadence: 'Per meeting. MANUAL.' },
];

// ============================================================ the layers ====

export interface Layer {
  id: string;
  name: string;
  subtitle: string;
  metrics: LiveMetric[];
  signal: 'BEARISH' | 'BULLISH' | 'NEUTRAL';
  signalDetail: string;
  confidence: 'HIGH' | 'MED' | 'LOW';
  narrative: string;
  steelman: string;
  flipsOn: string;
}

/**
 * Build the diagnostic spine against the live snapshot.
 *
 * Signals and prose are judgement and are written here. Every number inside
 * them is interpolated from the snapshot, so a narrative sentence that quotes
 * a level cannot drift away from the level it quotes.
 */
export function buildLayers(s: Snapshot): Layer[] {
  const n = (k: string, dp = 2, suffix = '') => fmt(val(s, k), dp, suffix);
  const reservesPctGdp = (val(s, 'reserves')! / val(s, 'nominalGdp')!) * 100;
  const indirect = avgIndirect(s);
  const netIntPctGdp = (val(s, 'netInterestAnnual')! / val(s, 'nominalGdp')!) * 100;
  const debtPctGdp = (val(s, 'debtHeldByPublic')! / val(s, 'nominalGdp')!) * 100;
  const ccRatio = val(s, 'cccOas')! / val(s, 'bbOas')!;

  return [
    {
      id: 'L1',
      name: 'Short-End Engine',
      subtitle: 'Policy & Macro',
      metrics: [
        metric(s, 'effr', 'Effective fed funds'),
        metric(s, 'iorb', 'IORB'),
        metric(s, 'corePceYoY', 'Core PCE y/y'),
        metric(s, 'corePce3mSaar', 'Core PCE 3m SAAR'),
        metric(s, 'realPolicyRate', 'Real policy rate'),
        metric(s, 'nfpChange', 'Last payroll print'),
        metric(s, 'nfp3mAvg', 'Payrolls 3m avg'),
        metric(s, 'unemployment', 'Unemployment'),
        metric(s, 'sahm', 'Sahm indicator'),
        metric(s, 'claims4wk', 'Claims 4wk avg'),
        metric(s, 'bei5y5y', '5y5y breakeven'),
        metric(s, 'tips10y', '10y TIPS real'),
      ],
      signal: 'NEUTRAL',
      signalDetail: 'Cross-currents; labour is the live risk',
      confidence: 'MED',
      narrative: `Start with the distinction almost nobody states plainly. The real policy rate - effective funds less core PCE - is ${n('realPolicyRate')}%. Against an r* estimate near 1%, that is not restrictive. It is barely neutral. The Fed has spent two years REMOVING ACCOMMODATION and has not clearly arrived at RESTRICTION, and those are different operations with different endpoints. Now the part that has changed the balance of this framework: the payroll three-month average is running at ${n('nfp3mAvg', 0)}k. The headline print of ${n('nfpChange', 0)}k looks fine in isolation and the trend underneath it does not. A labour market decelerating from a low base has far less room than one decelerating from a high one, and the Sahm indicator at ${n('sahm')} has not caught it because Sahm measures the unemployment rate, which is the last thing to move. Meanwhile core PCE at ${n('corePceYoY')}% y/y is decelerating on the three-month at ${n('corePce3mSaar')}%, and the 5y5y breakeven at ${n('bei5y5y')}% says the market does not believe inflation is the problem. That combination - soft labour, cooling inflation, anchored expectations, a policy rate barely above neutral - is not a hawkish setup. It is a Fed with more room to ease than its own rhetoric suggests.`,
      steelman: `The three-month payroll average is the most revision-prone number in macro and has been revised up repeatedly in this cycle; claims at ${n('claims4wk', 0)}k are nowhere near recessionary, and an unemployment rate of ${n('unemployment')}% with a negative Sahm reading is a labour market that is normalising rather than breaking. On the other side, core PCE is still above 3% y/y and has been for years. A committee that eases on the basis of a soft payroll average while core inflation has a 3-handle is a committee that has quietly changed its target, and the long end will price exactly that.`,
      flipsOn: 'Two consecutive payroll prints below zero flips this to outright BULLISH for duration. Core PCE 3m annualised re-accelerating back above 3.5% flips it BEARISH.',
    },
    {
      id: 'L2',
      name: 'The Meat Grinder',
      subtitle: 'Fiscal Supply & Term Premium',
      metrics: [
        metric(s, 'kimWright10y', 'Kim-Wright 10y TP'),
        manualMetric('ACM 10y TP', `+${MANUAL_VALUES.acm10y.value}bp`),
        metric(s, 'debtHeldByPublic', 'Debt held by public'),
        { name: 'Debt / GDP', value: `${debtPctGdp.toFixed(0)}%`, tag: 'E' },
        metric(s, 'netInterestAnnual', 'Net interest (SAAR)'),
        { name: 'Net interest / GDP', value: `${netIntPctGdp.toFixed(1)}%`, tag: 'E' },
        metric(s, 'effectiveDebtRate', 'Effective rate on stock'),
        metric(s, 'nominalGrowthYoY', 'Nominal GDP growth'),
        { name: 'Avg indirect share, recent coupons', value: indirect ? `${indirect.toFixed(1)}%` : 'n/a', tag: 'D' },
        manualMetric('Last 5y auction tail', `+${MANUAL_VALUES.lastAuctionTail.value}bp`),
      ],
      signal: 'BEARISH',
      signalDetail: 'Term premium high and structurally supported',
      confidence: 'MED',
      narrative: `The term premium is genuinely elevated: Kim-Wright has the 10y at ${n('kimWright10y', 0)}bp, which is well above where it sat through the entire post-crisis period and is the strongest single argument for the fiscal story. But read the fiscal position properly before calling it doom. Debt held by the public is ${debtPctGdp.toFixed(0)}% of GDP and net interest runs at ${netIntPctGdp.toFixed(1)}% of GDP - a large bill, and one that accrues almost entirely to holders of financial assets rather than to consumption. The number that actually decides sustainability is neither of those: it is the effective rate on the stock, ${n('effectiveDebtRate')}%, against nominal growth of ${n('nominalGrowthYoY')}%. While growth exceeds the coupon the stock deflates itself, and it currently does so by a wide margin. Confidence is MED and deliberately so: the two term premium models disagree, Kim-Wright at ${n('kimWright10y', 0)}bp against a manually-entered ACM at ${MANUAL_VALUES.acm10y.value}bp, and term premium is not an observation at all - it is a residual backed out of the same curve it claims to explain.`,
      steelman: `The whole supply story may be a positioning story in a macro costume. Term premium is a model residual, and a high one tells you the model cannot explain the long end, not that fiscal policy is the reason. Note also what the auctions actually show: indirect participation across recent coupons is averaging ${indirect ? indirect.toFixed(1) : 'n/a'}%, which is not the signature of a buyer strike. And the decisive point is arithmetic rather than rhetorical - with the effective rate at ${n('effectiveDebtRate')}% against ${n('nominalGrowthYoY')}% nominal growth, the snowball term is firmly negative. The fiscal path is not what is wrong with the long end today.`,
      flipsOn: 'Kim-Wright breaking above 130bp, or nominal growth falling below the effective rate on the stock. The second is the one that matters and it belongs to Scenario C, not B.',
    },
    {
      id: 'L3',
      name: 'Shadow Plumbing',
      subtitle: 'Liquidity & Balance Sheets',
      metrics: [
        metric(s, 'reserves', 'Reserve balances'),
        { name: 'Reserves / GDP', value: `${reservesPctGdp.toFixed(1)}%`, tag: 'E' },
        metric(s, 'onRrp', 'ON RRP take-up'),
        metric(s, 'tgaDaily', 'TGA (daily)'),
        metric(s, 'sofr', 'SOFR'),
        metric(s, 'sofrMinusIorb', 'SOFR less IORB'),
        metric(s, 'sofrTailWidth', 'SOFR 99th pct less median'),
        metric(s, 'tgcr', 'TGCR'),
        metric(s, 'sofrVolume', 'SOFR volume'),
        manualMetric('10y swap spread', `${MANUAL_VALUES.swapSpread10y.value}bp`),
      ],
      signal: 'NEUTRAL',
      signalDetail: 'Prints calm, buffers effectively exhausted',
      confidence: 'MED',
      narrative: `Every price in this layer says nothing is wrong. SOFR is printing ${n('sofrMinusIorb', 0)}bp through IORB and the 99th-percentile tail is only ${n('sofrTailWidth', 0)}bp above the median, which is an orderly distribution. The fragility is not in the prints, it is in what is left underneath them. ON RRP take-up is ${fmt(val(s, 'onRrp'), 2)}bn. Not billions - a fraction of one. The facility that absorbed two and a half trillion dollars of surplus liquidity in 2022 is empty, which means the shock absorber between quantitative tightening and bank reserves no longer exists; the next drain comes straight out of reserves. And reserves are at ${n('reserves')}tn, or ${reservesPctGdp.toFixed(1)}% of GDP. Most published estimates of the lowest comfortable level of reserves sit around 10-11% of GDP. On that arithmetic the buffer is not thin, it is already at or through the bottom of the comfortable range, with a TGA of ${fmt(val(s, 'tgaDaily'), 0)}bn sitting above it waiting to be spent or rebuilt. Watch the tail of the SOFR distribution rather than its median: in September 2019 the tails screamed for a fortnight while the average looked immaculate.`,
      steelman: `Every ingredient of this warning has been in place for a year and nothing has broken, because the Fed now has tools it did not have in 2019. The standing repo facility exists, is pre-positioned, and caps the repo rate by construction. "Lowest comfortable level of reserves" is an estimate with error bars measured in hundreds of billions, and the demand for reserves falls as the SRF becomes a credible substitute for precautionary balances - which is precisely what it was built to do. A calm SOFR distribution with reserves at this level may simply be evidence that the comfortable level is lower than the estimates say.`,
      flipsOn: 'SOFR printing above IORB on a non-quarter-end day, or any standing repo take-up outside a settlement date. Either means the buffer is binding rather than theoretically thin.',
    },
    {
      id: 'L4',
      name: 'Cross-Border Flows',
      subtitle: 'International Capital',
      metrics: [
        metric(s, 'usdjpy', 'USD/JPY'),
        metric(s, 'y10', 'UST 10y'),
        manualMetric('JGB 10y', 'verify', 'I'),
        manualMetric('Foreign official holdings (TIC)', 'verify', 'I'),
        manualMetric('UST 10y hedged into JPY', 'verify', 'I'),
      ],
      signal: 'NEUTRAL',
      signalDetail: 'Insufficient live data to take a view',
      confidence: 'LOW',
      narrative: `This layer is deliberately the weakest in the framework, and it is now honest about it. The automatable content is USD/JPY at ${n('usdjpy')} and nothing else. TIC holdings publish with a six-week lag in fixed-width text; JGB yields, cross-currency basis and therefore hedged Treasury yields all require feeds this pipeline does not have. In v3.0 this layer carried a confident BEARISH signal supported entirely by numbers that no source had published. The correct reading is that the marginal-buyer question is real and important and we cannot currently measure it, so the signal is NEUTRAL with LOW confidence, and the metrics above say "verify" rather than inventing a figure. A layer with no data should look like a layer with no data.`,
      steelman: `The counter to the whole layer, independent of data: "foreigners are selling" has been an evergreen bear thesis since 2013 and has never once been the thing that moved the 10y fifty basis points. Foreign private demand has absorbed official runoff for years, and the framing "there is no buyer" is incoherent in any case - every bond that exists is owned by somebody at every moment. The question is never whether there is a buyer, only at what yield, and that is a question about the whole curve rather than about foreigners.`,
      flipsOn: 'Wiring a JGB and cross-currency basis feed into the pipeline, which would make this layer measurable. Until then no observation can flip a signal that rests on nothing.',
    },
    {
      id: 'L5',
      name: 'Convexity & MBS',
      subtitle: 'Mortgage Market Dynamics',
      metrics: [
        metric(s, 'mortgage30y', '30y fixed (PMMS)'),
        metric(s, 'y10', '10y Treasury'),
        { name: 'Primary-secondary proxy', value: `${Math.round((val(s, 'mortgage30y')! - val(s, 'y10')!) * 100)}bp`, tag: 'E' },
        manualMetric('MBS current-coupon OAS', `+${MANUAL_VALUES.mbsOas.value}bp`),
        manualMetric('Index duration', 'verify', 'I'),
        manualMetric('CPR', 'verify', 'I'),
      ],
      signal: 'BEARISH',
      signalDetail: 'Amplifier, not initiator',
      confidence: 'LOW',
      narrative: `The mortgage rate is ${n('mortgage30y')}% against a 10y of ${n('y10')}%, a gross spread of roughly ${Math.round((val(s, 'mortgage30y')! - val(s, 'y10')!) * 100)}bp. That spread is the whole story of this layer: it is wide by historical standards, and it means the mortgage market does not transmit a Treasury rally to borrowers on anything like a one-for-one basis. The outstanding stack carries a weighted-average coupon far below the current rate, so nothing prepays for any reason except death, divorce or relocation, and the portfolio lengthens exactly when its owners least want it to. That is not the cause of a move. It is what turns a 15bp move into a 25bp move on a Thursday afternoon. Confidence is LOW rather than MED because the numbers that would quantify it - current-coupon OAS, index duration, prepayment speeds - are all vendor-supplied and none of them is in this pipeline.`,
      steelman: `Negative convexity cuts both ways and the market has stopped pricing the other direction. This stack is already fully extended and cannot extend much further, and the first serious rally meets no refinancing wave because a primary-secondary spread this wide means originators bank the first hundred basis points before passing any on. That makes current-coupon mortgages one of the better convexity-adjusted assets available rather than a hazard.`,
      flipsOn: 'The primary-secondary spread compressing materially, which would put refinancing within reach on an unchanged 10y and wake up prepayment speeds for the first time in years.',
    },
    {
      id: 'L6',
      name: 'Credit & Risk Assets',
      subtitle: 'Spread Markets',
      metrics: [
        metric(s, 'igOas', 'IG OAS'),
        metric(s, 'hyOas', 'HY OAS'),
        metric(s, 'bbOas', 'BB OAS'),
        metric(s, 'cccOas', 'CCC OAS'),
        metric(s, 'cccMinusBb', 'CCC less BB'),
        { name: 'CCC / BB ratio', value: `${ccRatio.toFixed(1)}x`, tag: 'E' },
        metric(s, 'igYield', 'IG all-in yield'),
        metric(s, 'hyYield', 'HY all-in yield'),
        metric(s, 'vix', 'VIX'),
        manualMetric('MOVE', String(MANUAL_VALUES.move.value)),
      ],
      signal: 'NEUTRAL',
      signalDetail: 'Index at the tights, dispersion screaming',
      confidence: 'HIGH',
      narrative: `This is the most interesting layer on the board and the live data makes it far sharper than any hand-written version. At the index level nothing is wrong and arguably nothing has ever been better: IG at ${n('igOas', 0)}bp and HY at ${n('hyOas', 0)}bp are close to cycle tights, and VIX at ${n('vix')} is low. Now look underneath. BB sits at ${n('bbOas', 0)}bp while CCC sits at ${n('cccOas', 0)}bp - a gap of ${n('cccMinusBb', 0)}bp and a ratio of ${ccRatio.toFixed(1)}x. That is not a market that is calm. It is a market that has sorted itself into survivors and casualties and is pricing the two as different asset classes. Index-level calm plus extreme quality dispersion is the classic late-cycle signature: the average tells you nothing because the average is being held up by the half of the market that is fine. The practical consequence is that HY at ${n('hyOas', 0)}bp offers almost no cushion for the labour-market deterioration visible in L1, which is precisely why Scenario C carries more weight in this run than the last.`,
      steelman: `Dispersion without index widening can equally mean the market is working properly - discriminating between credits rather than repricing the asset class, which is what a healthy market is supposed to do. All-in yield is what actually clears credit, and IG at ${n('igYield')}% and HY at ${n('hyYield')}% bring in pension and insurance money that does not care about spread at all. And a wide CCC bucket in a market where the CCC cohort is smaller and lower quality than it used to be is partly a composition effect rather than a signal.`,
      flipsOn: 'BB widening past 200bp. That is the tell that says dispersion has become contagion - the CCC bucket can widen indefinitely without meaning much, but BB is where the index actually lives.',
    },
  ];
}

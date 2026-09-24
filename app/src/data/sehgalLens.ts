// ============================================================================
// The Sehgal Macro Lens applied to the current anchor.
//
// This is the layer v1 had none of, and its absence was the framework's largest
// single weakness. v1 ran six diagnostic layers, every one of which was a
// measurement, and then drew a conclusion that none of the measurements
// supported on their own: that the deficit is the story. The lens is what
// forces the question "the deficit reaches WHOM, and with what propensity to
// spend?" - and the answer materially weakens the framework's own headline view.
//
// That is the point. A lens that only ever confirms the house view is a mirror.
// ============================================================================

import { debtDynamics, effectiveStimulus, type FlowChannel } from '../lib/fiscal';

// ------------------------------------------- 1. dual-narrative ledger ------

export interface DualNarrative {
  issue: string;
  marketTelling: string;
  fedTelling: string;
  divergence: string;
  /** The observable that resolves it, with a date where one exists. */
  resolvedBy: string;
  /** Which telling the price currently reflects. */
  pricedAs: 'market' | 'fed' | 'split';
}

export const dualNarratives: DualNarrative[] = [
  {
    issue: 'What the September hold meant',
    marketTelling: 'A hold with three dissents is a hike delayed, not a hike avoided. The committee is hawkish and the December meeting is live at 72%.',
    fedTelling: 'A hold is a hold. The dissents reflect genuine dispersion on a committee that has not yet agreed whether policy is restrictive. Dispersion is information, not intent.',
    divergence: 'The market reads dissents as a leading indicator of the median. History says dissents are a lagging indicator of the fringe - dissenting members are, by construction, not the median. A 9-3 vote tells you where the tails are, and the market is pricing the tail as the centre.',
    resolvedBy: 'The 28-29 October FOMC statement language, and whether any dissenter is replaced in the rotation.',
    pricedAs: 'market',
  },
  {
    issue: 'Whether policy is restrictive',
    marketTelling: 'Obviously restrictive. Mortgages at 7.22%, small-cap coverage at 1.8x, transaction volumes down a third. You can see the damage.',
    fedTelling: 'The real funds rate is +0.28% against an r* estimate near 0.95%. We are roughly 67bp BELOW neutral. We have been removing accommodation for two years and have not yet arrived at restriction.',
    divergence: 'This is the most important disagreement in the framework and almost nobody states it plainly. The market measures restriction by observing pain in rate-sensitive sectors; the Fed measures it against an unobservable neutral rate. Both are defensible and they imply terminal rates 100bp apart. Note the distinction Sehgal insists on: REMOVING ACCOMMODATION and MOVING TO RESTRICTIVE are different operations with different endpoints, and conflating them is how the market has under-priced the terminal rate in each of the last three cycles.',
    resolvedBy: 'Whether core services ex-housing decelerates without payrolls turning negative. If it does, policy was restrictive enough. If payrolls break first, it was too tight. If neither happens by Q1, the Fed was right and the market is 100bp wrong.',
    pricedAs: 'market',
  },
  {
    issue: 'What the long end is pricing',
    marketTelling: 'Fiscal doom. Term premium at +78bp is the bond market demanding compensation for an unsustainable debt path, and it is going higher.',
    fedTelling: 'Term premium is normalising from a decade of quantitative-easing suppression toward its pre-2008 average. A +78bp term premium is not a crisis signal - it is the absence of a distortion. The 1990-2007 average was above 150bp.',
    divergence: 'Both cannot be tested directly, because term premium is not observed - it is a residual from a model estimated on the same curve it purports to explain. ACM says 78, Kim-Wright says 65. That 13bp disagreement is a fifth of the entire repricing being argued about, and it is never mentioned in the commentary that quotes these numbers to the basis point.',
    resolvedBy: 'The 7 November QRA. If a bill-share shift to 22% compresses ACM by 20bp within a fortnight, it was supply. If ACM is unmoved, it was something structural and the fiscal read gains real support.',
    pricedAs: 'split',
  },
  {
    issue: 'Whether the deficit is stimulative',
    marketTelling: 'A 6.1%-of-GDP deficit is enormous fiscal stimulus, it is why growth has not broken, and it is why inflation is sticky.',
    fedTelling: 'Fiscal policy is not our mandate. We take the fiscal path as given and set policy for the resulting demand.',
    divergence: 'Neither telling decomposes the number, which is where the whole answer lives. Roughly 49% of the headline deficit is net interest, which accrues to holders of financial assets with a low propensity to consume. The demand impulse is close to half the headline. See the flow panel below - this single decomposition moves the inflation outlook more than any datapoint in the diagnostic spine.',
    resolvedBy: 'Monthly Treasury Statement interest outlays vs primary outlays. It is published, it is unambiguous, and almost nobody splits it.',
    pricedAs: 'market',
  },
  {
    issue: 'Who the marginal buyer of duration is',
    marketTelling: 'Foreigners are leaving, pensions are shrinking, and there is nobody left to buy the long end at any sane yield.',
    fedTelling: 'Not our problem to solve. Treasury chooses the issuance mix; demand clears at a price.',
    divergence: 'The market conflates "foreign official demand is falling" with "demand is falling". Foreign private demand has absorbed official runoff for three years. And the framing "there is no buyer" is incoherent - every bond that exists is owned by somebody at all times. The correct question is not WHETHER there is a buyer but at WHAT YIELD, and the yield at which domestic real money engages in size is roughly 5.25% on the 10y [E] - about 11bp from here.',
    resolvedBy: 'Indirect bidder share on the 10 October 10y auction. Above 65% says the buyer was price-sensitive, not absent.',
    pricedAs: 'market',
  },
];

// ------------------------------------------ 2. flow-of-funds decomposition --

export const FISCAL_INPUTS = {
  debtHeldByPublic: 32.1,   // $tn [E] extrapolated from MTS
  nominalGdp: 31.5,         // $tn [E] BEA Q2 annualised
  primaryDeficit: 0.98,     // $tn [E] MTS FY26 YTD less net interest
  netInterest: 0.94,        // $tn [D] MTS FY26 YTD net interest outlays
  nominalGrowthPct: 5.1,    // % [E] 1.8% real + 3.3% deflator
  marginalRatePct: 4.55,    // % [E] duration-weighted average issuance yield
  wamYears: 6.0,            // [D] Treasury weighted average maturity
};

export const flowChannels: FlowChannel[] = [
  {
    channel: 'Transfers (Social Security, Medicare, Medicaid, veterans)',
    amountTn: 0.42,
    accruesTo: 'labour',
    mpc: 0.90,
    rationale: 'Recipients are overwhelmingly liquidity-constrained. Near-complete pass-through to consumption within one quarter.',
  },
  {
    channel: 'Federal procurement, wages, defence, grants to states',
    amountTn: 0.41,
    accruesTo: 'labour',
    mpc: 0.85,
    rationale: 'Flows to payrolls and to firms that hire. High multiplier, one to two quarter lag.',
  },
  {
    channel: 'Tax expenditures and credits skewed to capital',
    amountTn: 0.15,
    accruesTo: 'capital',
    mpc: 0.25,
    rationale: 'Accelerated depreciation and credits raise after-tax returns on capex. Real but slow, and a large share is inframarginal - it rewards investment that was happening anyway.',
  },
  {
    channel: 'Net interest paid to domestic holders',
    amountTn: 0.56,
    accruesTo: 'capital',
    mpc: 0.15,
    rationale: 'Roughly 85% of directly and indirectly held Treasuries sit with the top wealth decile, insurers, and pension funds. Interest income there is reinvested, not spent. This is the single largest low-multiplier channel in the budget and it is the one that grows fastest when the Fed hikes.',
  },
  {
    channel: 'Net interest paid to foreign holders',
    amountTn: 0.29,
    accruesTo: 'capital',
    mpc: 0.05,
    rationale: 'Leaves the domestic income circuit almost entirely. A real balance-of-payments cost, a negligible demand impulse.',
  },
  {
    channel: 'Net interest paid to the Federal Reserve',
    amountTn: 0.09,
    accruesTo: 'mixed',
    mpc: 0.00,
    rationale: 'Circular. Remitted back to Treasury as seigniorage once the Fed works off its deferred asset. Appears in the deficit, funds nothing, stimulates nobody. Pure accounting.',
  },
];

export const debtResult = debtDynamics(FISCAL_INPUTS);
export const stimulusResult = effectiveStimulus(flowChannels, FISCAL_INPUTS.nominalGdp);

export const fiscalCommentary = {
  headline:
    'The headline deficit is 6.1% of GDP. The demand impulse is roughly 3.2%. The gap is not an accounting subtlety - it is the difference between an economy being force-fed and an economy being gently supported while its bondholders get richer.',
  theReflexiveLoop:
    'Here is the loop that makes this cycle genuinely strange, and it runs the opposite way to intuition. The Fed hikes to cool demand. Hiking raises the coupon on $32.1tn of rolling debt. That raises net interest, which raises the headline deficit, which the bond market reads as more supply and demands more term premium for - so long rates rise too. But the incremental interest goes to holders of financial assets with an MPC near 0.15. So the tightening delivers a LARGER fiscal headline and a SMALLER demand impulse simultaneously. The market trades the headline. The economy responds to the impulse. Anyone trading the headline is trading the wrong variable, and they have been doing it consistently enough that it is now a repeatable source of mispricing in the long end.',
  theEndogeneityQuestion:
    'The standard sustainability calculation treats nominal GDP growth as exogenous to fiscal policy. It plainly is not. A 3.1% primary deficit is itself a component of the 5.1% nominal growth that makes the arithmetic work - which means the debt ratio is partly self-stabilising, and austerity that cut the primary deficit would also cut the g that is currently doing the deflating. This is not an argument that deficits are free. It is an argument that the counterfactual is not "same growth, less debt", and that every projection assuming it is has a bias baked in at the first line.',
  theHonestCounter:
    'The comfortable arithmetic rests entirely on an effective rate of 2.93%, and that number is a fossil. It reflects debt issued when the 10y was 1.5%. Every month, low-coupon paper rolls into 4.5% paper. Over a 6.0-year weighted average maturity the effective rate converges on the marginal rate, and at r = 4.55% against g = 5.1% the snowball term nearly vanishes: the ratio then climbs at roughly 2.5pp a year instead of 0.9pp. And if nominal growth slows to 4% - which is exactly what Scenario C describes - r exceeds g, the snowball turns positive, and the debt path becomes genuinely self-reinforcing. So the correct statement is not "debt is fine". It is: debt is fine while nominal growth stays above 4.5%, and the fiscal risk and the recession risk are THE SAME RISK. That is a far more useful thing to know than a deficit-to-GDP ratio, and it means Scenario C is the fiscal tail, not Scenario B.',
};

// ------------------------------------ 3. term premium: signal vs crowd ------

/**
 * Decomposing the term premium itself. This is what justifies Scenario D
 * existing at all: if roughly 22 of 78bp is non-fundamental, then a squeeze of
 * 40-45bp needs no change in the macro whatsoever.
 */
export const termPremiumAttribution = {
  totalBp: 78,
  source: 'ACM 10y, 23 Sep 2026 [D]',
  components: [
    { name: 'Duration supply - Treasury net coupon', bp: 30, tag: 'E', durable: true, note: 'Structural while the bill share stays below TBAC guidance. Reversible by announcement, not by data.' },
    { name: 'Inflation uncertainty premium', bp: 14, tag: 'E', durable: true, note: 'Energy at $92 plus tariff pass-through. Genuinely fundamental; the compensation for variance, not for level.' },
    { name: 'Foreign demand withdrawal', bp: 12, tag: 'E', durable: true, note: 'Slow, political, and unlikely to reverse. The most durable component in the stack.' },
    { name: 'Dealer balance-sheet scarcity', bp: 10, tag: 'I', durable: false, note: 'Evidenced by the -12bp swap spread and $284B dealer inventory. Mechanically unwinds when inventory clears. Not a view about America.' },
    { name: 'Positioning / bandwagon residual', bp: 12, tag: 'I', durable: false, note: 'The part with no fundamental owner. When consensus is unanimous, consensus itself is a risk factor in the price. This is the squeeze fuel.' },
  ],
  durableBp: 56,
  fragileBp: 22,
  implication:
    'About 22bp of the 78bp term premium has no fundamental owner. Add roughly 20bp of policy-path repricing on a soft August PCE and you have a 40-45bp rally that requires nothing to change about the deficit, the Fed, or the foreign bid. That is Scenario D, priced from the inside rather than asserted, and it is why its probability is 10% rather than the zero it carried in v1.',
};

// ------------------------------------------ 4. cross-asset flow chain -------

export const crossAssetChains = [
  {
    title: 'The rates-to-equity-leverage loop (the one nobody draws)',
    steps: [
      'Fed holds the funds rate at 3.875% and the curve prices ~4.1% terminal',
      'Net interest outlays reach $0.94tn/yr, of which $0.56tn accrues to domestic holders of financial assets',
      'Those holders - insurers, pensions, wealthy households via funds - have an MPC near 0.15 and must redeploy the rest',
      'The redeployment lands where the yield is: $1.12tn of IG issuance absorbed YTD, of which $184bn is AI and hyperscaler paper',
      'That paper funds data-centre capex which shows up as REVENUE for semiconductor and power companies and as DEBT on the buyers balance sheets',
      'The equity complex therefore becomes more levered because rates are high, not despite it',
      'Which means the standard "higher rates compress equity multiples" chain has a second term running the other way, and for the AI complex specifically that second term has been dominant for eighteen months',
    ],
    implication: 'The transmission from rates to equities is not one-signed. Higher rates are choking the rate-sensitive consumer complex and simultaneously FINANCING the capex complex. That is why XLK and XLRE can be down together while semis are up, and why an equity-level view on rates has been useless this cycle. Trade the channel, not the index.',
    falsification: 'If IG issuance from hyperscalers falls below $10bn/month for a quarter while their capex guidance holds, the funding has moved to internal cash and this chain is broken.',
    tag: 'I',
  },
  {
    title: 'Energy to policy to the foreign bid (the chain that closes on itself)',
    steps: [
      'Gulf escalation puts WTI at $92, up $14 from August',
      '5y5y breakevens reprice to 2.72% as the inflation risk premium builds',
      'The SEP core PCE projection moves to 3.4%, the median dot holds at 4.10%, and the strip prices 72% for December',
      'The 2y reprices to 4.75%, taking the short leg of every FX hedge with it',
      'Hedging cost for a Japanese buyer rises with the short-rate differential, so the UST yield hedged into JPY reaches 5.82%',
      'But the 30y JGB is at 2.64% and rising, so domestic Japanese duration becomes a genuine substitute for the first time in twenty years',
      'Foreign official demand fades at the exact moment US duration supply peaks',
      'Which raises the US term premium, which raises the long end, which is the inflation the Fed was responding to in step three - except it is not inflation at all, it is the premium demanded for the uncertainty about it',
    ],
    implication: 'The energy shock reaches the long end twice: once through breakevens, and once through the policy response that prices foreign buyers out of the hedged trade. The second channel is larger and slower, and it is the one that does not reverse when oil falls back.',
    falsification: 'If WTI returns below $78 and the hedged JPY yield stays above 5.75% anyway, the chain is broken and the foreign-demand story is structural rather than energy-driven - which would be worse, not better.',
    tag: 'I',
  },
];

// -------------------------------------------- 5. asymmetry on the book ------

export const asymmetryCommentary = {
  principle:
    'Sehgal\'s test, applied to every expression: if I am right, how much do I make, and is the payoff linear or multiplicative? Being long the long bond at 5.14% and being right gets you to maybe 4.50% - a bounded, linear 64bp. There is no version of that trade that pays five times. The asymmetry has to be manufactured deliberately, through the structure, or it will not be there.',
  bookLevelObservation:
    'The v1 book was five expressions, four of them linear-bounded spread trades and one long straddle carried at -55bp of theta a month. That is not a convex book, it is a directional book with an expensive apology attached. The rebuilt book below keeps the spread trades - they are the right way to express a curve view - but pays for optionality out of carry rather than out of P&L, which is the only sustainable way to own convexity for six months.',
};

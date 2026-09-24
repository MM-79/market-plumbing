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

import { debtDynamics, effectiveStimulus } from '../lib/fiscal';
import type { Snapshot } from '../lib/snapshot';
import { val, fmt } from '../lib/snapshot';
import { buildFiscalInputs, buildFlowChannels } from '../lib/derive';

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

/**
 * The ledger, built against the live snapshot.
 *
 * v3.0 wrote these as constants and they went out of date the instant real
 * data arrived: the prose argued about a 78bp term premium while the live
 * Kim-Wright model printed near 100bp, and about mortgages at 7.22% while the
 * survey said 6.95%. A narrative that quotes a level has to read that level
 * from the same place the tiles do, or the page contradicts itself in public.
 */
export const buildDualNarratives = (s: Snapshot): DualNarrative[] => {
  const n = (k: string, dp = 2, suf = '') => fmt(val(s, k), dp, suf);
  const d = debtResult(s);
  const st = stimulusResult(s);

  return [
    {
      issue: 'Whether policy is restrictive',
      marketTelling: `Obviously restrictive. Mortgages at ${n('mortgage30y')}%, payroll growth down to a ${n('nfp3mAvg', 0)}k three-month average, and a housing market that has not cleared in two years. You can see the damage.`,
      fedTelling: `The real policy rate - effective funds less core PCE - is ${n('realPolicyRate')}%. Against an r* estimate near 1%, we are close to neutral and possibly still below it. We have spent two years removing accommodation. We have not yet arrived at restriction.`,
      divergence: 'This is the most important disagreement in the framework and almost nobody states it plainly. The market measures restriction by observing pain in rate-sensitive sectors; the Fed measures it against an unobservable neutral rate. Both are defensible and they imply terminal rates a hundred basis points apart. REMOVING ACCOMMODATION and MOVING TO RESTRICTIVE are different operations with different endpoints, and conflating them is how the market has misjudged the terminal rate in each of the last three cycles.',
      resolvedBy: 'Whether core inflation keeps decelerating without payrolls turning negative. If it does, policy was restrictive enough. If payrolls break first, it was tighter than the real-rate arithmetic implied and the r* estimate was wrong.',
      pricedAs: 'market',
    },
    {
      issue: 'What the long end is pricing',
      marketTelling: `Fiscal doom. A term premium near ${n('kimWright10y', 0)}bp on Kim-Wright is the bond market demanding compensation for an unsustainable debt path, and it is going higher.`,
      fedTelling: 'Term premium is normalising from a decade of quantitative-easing suppression toward its pre-2008 average, which was materially higher than this. A positive term premium is not a crisis signal. It is the absence of a distortion.',
      divergence: `Neither telling can be tested directly, because term premium is not observed - it is a residual backed out of the same curve it claims to explain. Kim-Wright currently prints ${n('kimWright10y', 0)}bp; the manually-maintained ACM figure on this page says something different, and the gap between two models of the same quantity is the honest error bar on every argument built from either. Commentary that quotes term premium to the basis point never mentions it.`,
      resolvedBy: 'The next refunding. If a shift toward bills compresses the term premium within a fortnight, it was supply. If the models are unmoved, it is structural and the fiscal read gains real support.',
      pricedAs: 'split',
    },
    {
      issue: 'Whether the deficit is stimulative',
      marketTelling: `A deficit of roughly ${d.headlineDeficitPctGdp.toFixed(1)}% of GDP is enormous fiscal stimulus, it is why growth has not broken, and it is why inflation has been sticky.`,
      fedTelling: 'Fiscal policy is not our mandate. We take the fiscal path as given and set policy for the resulting demand.',
      divergence: `Neither telling decomposes the number, which is where the whole answer lives. Net interest alone runs at ${d.netInterestPctGdp.toFixed(1)}% of GDP and accrues to holders of financial assets with a low propensity to consume. Run the channels through their marginal propensities and the demand impulse is about ${st.effectivePctGdp.toFixed(1)}% of GDP, not ${d.headlineDeficitPctGdp.toFixed(1)}%. That single decomposition moves the inflation outlook more than any datapoint in the diagnostic spine.`,
      resolvedBy: 'The Monthly Treasury Statement, which publishes interest outlays separately from primary outlays. It is unambiguous, it is free, and almost nobody splits it.',
      pricedAs: 'market',
    },
    {
      issue: 'Whether credit is telling the truth',
      marketTelling: `Credit is fine. IG at ${n('igOas', 0)}bp and HY at ${n('hyOas', 0)}bp are near cycle tights, VIX is at ${n('vix')}, and spread markets have been a better recession forecaster than the yield curve for thirty years.`,
      fedTelling: 'Financial conditions are easy, which is itself an argument for staying tighter for longer. Tight credit spreads are not evidence that policy is working.',
      divergence: `Both are reading the index and the index is the wrong number. CCC sits at ${n('cccOas', 0)}bp against BB at ${n('bbOas', 0)}bp - a gap of ${n('cccMinusBb', 0)}bp. Index-level calm with extreme quality dispersion is the classic late-cycle signature, because the average is being held up by the half of the market that is genuinely fine. The market and the Fed are having an argument about a statistic that has stopped being informative.`,
      resolvedBy: 'BB OAS. The CCC bucket can widen indefinitely without meaning much; BB is where the index actually lives, and it is the level that says whether dispersion has become contagion.',
      pricedAs: 'market',
    },
    {
      issue: 'Who the marginal buyer of duration is',
      marketTelling: 'Foreigners are leaving, pensions are shrinking, and there is nobody left to buy the long end at any sane yield.',
      fedTelling: 'Not a problem for us to solve. Treasury chooses the issuance mix; demand clears at a price.',
      divergence: 'The market conflates "foreign official demand is falling" with "demand is falling". The framing is incoherent in any case - every bond that exists is owned by somebody at every moment. The question is never WHETHER there is a buyer, only at WHAT YIELD. Note honestly that this framework currently cannot measure the cross-border channel at all: TIC publishes with a six-week lag in fixed-width text and there is no free feed for hedged yields, so L4 carries LOW confidence and says "verify" rather than inventing a number.',
      resolvedBy: 'Indirect participation on the next long-end auction, which the pipeline now fetches automatically. A high indirect share says the buyer was price-sensitive, not absent.',
      pricedAs: 'market',
    },
  ];
};

// ------------------------------------------ 2. flow-of-funds decomposition --

/**
 * Fiscal inputs, now live.
 *
 * v3.0 hard-coded these and every one was wrong - debt held by the public was
 * typed as $32.1tn against an actual $32.38tn, nominal GDP as $31.5tn against
 * $32.49tn, and net interest as $0.94tn against a $1.25tn annualised rate. The
 * conclusions happened to survive, which is the most dangerous outcome
 * available: a right answer from wrong numbers teaches you nothing and
 * calibrates nobody.
 *
 * `primaryDeficit` remains an estimate. The MTS publishes monthly and
 * fiscal-year-to-date figures, and stitching those into a reliable annual
 * primary balance is more parsing than this pipeline should carry. It is
 * exposed on a slider in the UI so a reader can see how much of the conclusion
 * depends on it - and the answer is much less than they will expect, because
 * the snowball term dominates.
 */
export const PRIMARY_DEFICIT_ESTIMATE_TN = 1.05;

export const fiscalInputs = (s: Snapshot) => buildFiscalInputs(s, PRIMARY_DEFICIT_ESTIMATE_TN);
export const flowChannels = (s: Snapshot) => buildFlowChannels(s, PRIMARY_DEFICIT_ESTIMATE_TN);
export const debtResult = (s: Snapshot) => debtDynamics(fiscalInputs(s));
export const stimulusResult = (s: Snapshot) =>
  effectiveStimulus(flowChannels(s), val(s, 'nominalGdp') ?? NaN);

export const fiscalCommentary = (s: Snapshot) => {
  const d = debtResult(s);
  const st = stimulusResult(s);
  const inp = fiscalInputs(s);

  return {
    headline:
      `The headline deficit is ${d.headlineDeficitPctGdp.toFixed(1)}% of GDP. The demand impulse is roughly `
      + `${st.effectivePctGdp.toFixed(1)}%. The gap is not an accounting subtlety - it is the difference between an `
      + `economy being force-fed and an economy being gently supported while its bondholders get richer.`,

    theReflexiveLoop:
      `Here is the loop that makes this cycle genuinely strange, and it runs the opposite way to intuition. The Fed `
      + `hikes to cool demand. Hiking raises the coupon on $${inp.debtHeldByPublic.toFixed(2)}tn of rolling debt. That `
      + `raises net interest, which raises the headline deficit, which the bond market reads as more supply and demands `
      + `term premium for - so long rates rise too. But that incremental interest goes to holders of financial assets `
      + `with a propensity to consume near 0.15. So the tightening delivers a LARGER fiscal headline and a SMALLER `
      + `demand impulse at the same time. The market trades the headline. The economy responds to the impulse. Anyone `
      + `trading the headline is trading the wrong variable, and they have been doing it consistently enough that it is `
      + `now a repeatable source of mispricing in the long end.`,

    theEndogeneityQuestion:
      `The standard sustainability calculation treats nominal GDP growth as exogenous to fiscal policy. It plainly is `
      + `not. A ${d.primaryDeficitPctGdp.toFixed(1)}% primary deficit is itself a component of the `
      + `${d.nominalGrowthPct.toFixed(1)}% nominal growth that makes the arithmetic work - which means the ratio is `
      + `partly self-stabilising, and austerity that cut the primary deficit would also cut the growth currently doing `
      + `the deflating. This is not an argument that deficits are free. It is an argument that the counterfactual is `
      + `not "same growth, less debt", and that every projection assuming it is carries a bias in its first line.`,

    theHonestCounter:
      `The comfortable arithmetic rests entirely on an effective rate of ${d.effectiveRatePct.toFixed(2)}%, and that `
      + `number is a fossil. It reflects debt issued when the 10y was near zero. Every month low-coupon paper rolls `
      + `into paper issued at roughly ${inp.marginalRatePct.toFixed(2)}%. Over a ${inp.wamYears}-year weighted average `
      + `maturity the effective rate converges on that marginal rate, at which point the snowball term shrinks toward `
      + `nothing and the ratio climbs several times faster than it does today. And if nominal growth slows below the `
      + `effective rate - which is exactly what Scenario C describes - the snowball turns positive and the path becomes `
      + `genuinely self-reinforcing. So the correct statement is not "debt is fine". It is: debt is fine while nominal `
      + `growth stays above the coupon, which means THE FISCAL RISK AND THE RECESSION RISK ARE THE SAME RISK. That is `
      + `far more useful than a deficit-to-GDP ratio, and it means Scenario C is the fiscal tail, not Scenario B.`,
  };
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

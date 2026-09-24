// ============================================================================
// Part 6 - Institution Lens: bank treasury at a mortgage-servicing bank.
// Appendix - Exotic signals.
//
// v1 change: the institution lens now carries QUANTIFIED triggers with owners
// and lead times, not adjectives. "Stress" is not an action. "Extend the repo
// book to 30+ days when SOFR-IORB closes above +3bp for three sessions, owned
// by the funding desk, 5 business days to execute" is an action, and it can be
// audited after the fact by anyone who wants to know whether we did it.
// ============================================================================

export interface BalanceSheetImpact {
  area: string;
  current: string;
  measure: string;
  A: string;
  B: string;
  C: string;
  D: string;
  /** The number that tells you which scenario you are actually in. */
  ownIndicator: string;
}

export const institutionImpacts: BalanceSheetImpact[] = [
  {
    area: 'Escrow and custodial (P&I) deposits',
    current: '$4.2B average daily balance',
    measure: 'Balance, and the non-interest-bearing share',
    A: 'Stable to +3%. Escrow balances grow with tax and insurance inflation even as origination stays frozen, which is the quiet good news in a 7% mortgage world.',
    B: '-5 to -8%. Origination drops further, but the bigger risk is on the servicing side: rate-spike margin calls on the hedges of NONBANK servicers we provide warehouse lines to. Their liquidity problem arrives as our drawdown.',
    C: '-12 to -15%. Unemployment drives escrow shortfalls and advance obligations. In a mortgage-servicing bank the servicer advance obligation is the single most under-modelled contingent liquidity claim on the balance sheet - it is legally mandatory, unfunded, and correlates perfectly with the scenario in which funding is hardest.',
    D: '+2 to +5%. A move to 6.8% mortgages restarts some refi, which raises payoff activity and escrow churn. Cash-flow positive, MSR-negative.',
    ownIndicator: 'Weekly custodial balance versus the 13-week average, plus nonbank counterparty margin call volume. Two consecutive weeks below -4% is the early warning, and it leads the public data by about a month.',
  },
  {
    area: 'HQLA composition and AOCI',
    current: '62% Treasuries, 28% agency MBS, 10% reserves. AFS unrealised -$1.8B, CET1 impact -42bp',
    measure: 'AOCI drag on CET1, and HQLA duration',
    A: 'Losses stable to slightly wider. CET1 impact -42 to -48bp. Manageable, no action forced.',
    B: 'Losses expand toward -$2.8B, CET1 impact -65bp. This is where internal capital conservation triggers start firing. Note the specific trap: agency MBS extends exactly when you need it short, so the 28% MBS sleeve behaves worse than its stated duration implies. Model the extension, not the duration.',
    C: 'Relief on the rates leg - a rally compresses AFS losses toward -$1.2B and hands back 20bp of CET1. That relief is then spent on credit provisioning. Net capital effect is roughly flat, and the timing is unhelpful because the relief is mark-to-market while the provision is cash.',
    D: 'The best outcome on this line by a distance. A 40bp rally across the curve compresses AFS losses toward -$1.0B and returns roughly 25bp of CET1 with no offsetting credit cost.',
    ownIndicator: 'AFS unrealised loss per 25bp parallel shift, recomputed weekly with MBS extension included rather than assumed away.',
  },
  {
    area: 'Repo and secured funding',
    current: 'Net borrower, $2.8B daily, 7-day average term',
    measure: 'Weighted average term, and haircut on UST collateral',
    A: 'Stable. Expect 5-8bp of quarter-end premium. Pre-negotiate term repo covering the October and December turns now, while it is cheap and nobody wants it.',
    B: 'Haircuts on UST collateral widen 1-2 points, counterparties shorten tenor exactly when you want it longer, and the SRF becomes the backstop. Term out to 30+ days BEFORE the spread moves - by the time SOFR-IORB is at +5bp, 30-day term costs three times what it does today.',
    C: 'Severe. FHLB advance capacity is the first real line, discount window pre-positioning is the second. Assume every counterparty is running the same playbook on the same morning.',
    D: 'Benign, and a chance to term out cheaply. The risk in D is complacency: a calm funding market is when you should be buying the insurance, not cancelling it.',
    ownIndicator: 'SOFR-IORB three-session moving average, and our own weighted average repo term. If term is falling while the spread is rising, that is the funding desk being squeezed rather than choosing.',
  },
  {
    area: 'MSR valuation and hedge performance',
    current: 'MSR carrying value $890M. Hedge: pay-fixed swaps on 60% of notional',
    measure: 'Hedge effectiveness, and basis between MSR duration and the hedge',
    A: 'MSR stable, prepayment speeds unchanged, hedge P&L roughly flat. Quiet.',
    B: 'MSR marks up as the discount rate rises and speeds fall further; the pay-fixed hedge loses. Net +$40-60M, but the mark is model-driven and the hedge loss is cash. That asymmetry between a modelled gain and a realised loss is the thing to flag to the ALCO before it happens, not after.',
    C: 'The dangerous one. Rates fall, speeds accelerate, MSR marks down sharply; the pay-fixed hedge gains. The hedge ratio is 60%, so roughly 40% of the MSR duration is naked in exactly the scenario where MSR value falls fastest. Worse, MSR duration is negatively convex, so the hedge under-covers precisely as the move gets larger.',
    D: 'The unhedged tail nobody budgets for. A 40bp rally with no recession takes mortgages toward 6.8%, which is close enough to the refi threshold to move speeds while the pay-fixed hedge loses on the rally. Moderately negative and, because it comes without a credit offset, unusually visible in a single quarter.',
    ownIndicator: 'MSR duration recomputed weekly at the CURRENT rate, not at origination. Hedge ratio versus the 30-day realised MSR delta. If the realised delta exceeds the modelled delta two months running, the model is wrong and the hedge is smaller than it says.',
  },
  {
    area: 'Contingent liquidity and the servicer advance obligation',
    current: 'Advance obligation modelled at $310M peak under a 6% delinquency assumption',
    measure: 'Peak advance requirement, and its funding source',
    A: 'No change. Delinquency stable.',
    B: 'Modest increase. The binding constraint in B is not advances, it is the warehouse lines to nonbank servicers drawing simultaneously.',
    C: 'The obligation roughly doubles toward $620M at 10-11% delinquency, and it is legally mandatory and cash-settled. It arrives in the same quarter as wider haircuts and drawn warehouse lines. This is the scenario where three separate liquidity claims arrive together, and they are all correlated to the same variable.',
    D: 'No change.',
    ownIndicator: '30-day delinquency by vintage, weekly. The 2024-25 vintages originated at 6.5-7% are the ones to watch - they were underwritten with the least payment cushion.',
  },
];

export interface TreasuryAction {
  action: string;
  protects: string;
  priority: 'HIGH' | 'MED' | 'LOW';
  trigger: string;
  owner: string;
  leadTime: string;
  cost: string;
}

export const treasuryActions: TreasuryAction[] = [
  {
    action: 'Term out the repo book to 30+ days covering the October and December turns',
    protects: 'B, and cheaply in A',
    priority: 'HIGH',
    trigger: 'Do it now, unconditionally. The trigger for ACTING is not a market signal - it is the calendar.',
    owner: 'Funding desk',
    leadTime: '5 business days',
    cost: 'Roughly 6-9bp over overnight. At $2.8B that is $500-700k a quarter, which is the cheapest line item in this entire document relative to what it insures.',
  },
  {
    action: 'Rotate 15% of the HQLA book from 7-10y Treasuries into bills and 2y',
    protects: 'B',
    priority: 'HIGH',
    trigger: 'ACM above +90bp, or two consecutive coupon auctions tailing more than 2.5bp',
    owner: 'ALM / investment portfolio',
    leadTime: '10 business days',
    cost: 'Roughly 30bp of running yield on the rotated sleeve. Buys a 22bp reduction in CET1 sensitivity per 100bp shift.',
  },
  {
    action: 'Raise the MSR hedge ratio from 60% to 75%',
    protects: 'C and D',
    priority: 'HIGH',
    trigger: 'Sahm above 0.47, or two consecutive sub-90k payroll prints',
    owner: 'MSR risk',
    leadTime: '3 business days',
    cost: 'Roughly $8-12M a year in carry on the incremental pay-fixed. Covers the 40% naked duration that is currently naked in precisely the scenario where MSR value falls fastest.',
  },
  {
    action: 'Complete SRF counterparty documentation and run a live $50M test draw',
    protects: 'B and C',
    priority: 'HIGH',
    trigger: 'Immediate. A facility you have never used is not a facility, it is a plan.',
    owner: 'Treasury operations',
    leadTime: '4-6 weeks for documentation',
    cost: 'Operational only. The entire value is in discovering the operational failure on a quiet Tuesday rather than on the morning it matters.',
  },
  {
    action: 'Re-underwrite warehouse lines to nonbank servicers with an explicit rate-spike margin scenario',
    protects: 'B',
    priority: 'MED',
    trigger: 'MOVE above 130',
    owner: 'Credit risk / counterparty',
    leadTime: '3-4 weeks',
    cost: 'Relationship friction. This is the exposure most likely to surprise, because it converts somebody else\'s rate risk into our liquidity risk with no intervening step.',
  },
  {
    action: 'Set contingency funding plan triggers at custodial balance -8% and SOFR-IORB +3bp',
    protects: 'B and C',
    priority: 'HIGH',
    trigger: 'Immediate - this is a governance action, not a market call',
    owner: 'ALCO',
    leadTime: 'Next ALCO',
    cost: 'None. The only cost of a pre-agreed trigger is having to explain, in writing, why you are not acting when it fires. That explanation is the control.',
  },
];

// ============================================================================
// Appendix - Exotic signals
// ============================================================================

export const exoticChains = [
  {
    name: 'Red Sea container rates to goods CPI to the 10y',
    chain: [
      'Gulf escalation disrupts Red Sea transits; carriers reroute via the Cape, adding 10-14 days',
      'Freightos Baltic Index rises 40-60% off baseline as effective capacity falls',
      'Landed cost rises with a 3-4 month lag from booking to shelf, hitting core goods CPI',
      'Core goods contributes an incremental +0.15 to +0.25% m/m for two to three prints',
      'The Fed dot path reprices +25bp; the 2y adds 8-12bp',
      'The 10y follows at roughly 1.5x the 2y beta, adding 12-18bp',
    ],
    source: 'Freightos Baltic Index (FBX); BLS CPI core goods; Fed H.15',
    lag: '3-4 months from disruption to the CPI print',
    sign: 'Positive - disruption raises yields',
    magnitude: '+12 to +18bp on the 10y per sustained disruption',
    falsification: 'If FBX normalises below 1500 while the conflict continues, the transmission is broken and inventory buffers are absorbing the shock. Equally, if FBX stays elevated for two quarters and core goods CPI does not move, the pass-through has structurally weakened and this chain should be retired rather than explained away.',
    tag: 'S',
  },
  {
    name: 'AI data-centre power demand to utility rate cases to duration supply',
    chain: [
      'Hyperscaler capex commits roughly 45GW of incremental data-centre load by 2028',
      'Utilities file rate cases seeking 15-25% revenue increases to fund grid upgrades',
      'Approved cases unlock municipal and utility-sector issuance to finance the build',
      'That issuance competes for the same duration buyer as Treasury coupons, limiting utility IG spread compression',
      'Commercial electricity costs rise, feeding services inflation with a two-to-three quarter lag',
      '5y5y breakevens add 5-8bp; the 10y nominal adds 4-6bp',
    ],
    source: 'EIA electricity demand; FERC and state PUC rate case dockets; SIFMA issuance data',
    lag: '12-18 months from capex announcement to rate case approval; another 6 months to issuance',
    sign: 'Positive - demand creates supply creates yield',
    magnitude: '+4 to +6bp on the 10y through the inflation channel; +20 to +30bp of utility IG OAS through the supply channel',
    falsification: 'If state commissions deny more than half of filed cases, or if hyperscalers shift to behind-the-meter generation at scale, the issuance never materialises and the chain breaks at step three. Watch the PJM and ERCOT interconnection queues - they lead the rate cases by roughly a year and are public.',
    tag: 'S',
  },
];

export const inventedIndicator = {
  name: 'The Orphan Premium (OP-30)',
  formula:
    'OP-30 = z_504( y30 - [ 1.00 * fedFundsMid + 1.25 * ACM_TP_10y + 0.60 * (BEI_5y5y - 2.00) ] ), computed daily on a rolling two-year window.',
  plainEnglish:
    'Take the 30y yield and subtract everything that is supposed to explain it: the policy rate, the term premium the models measure, and the inflation compensation the market prices. What is left over is the part of the long end that no published series can account for. Call it the orphan. When the orphan gets large, the long end is being driven by something outside the standard decomposition - which in practice means positioning, balance-sheet scarcity, or a foreign seller nobody has reported yet.',
  whyItIsDifferent:
    'Every widely used long-end indicator measures the long end against the Fed. This one measures it against the Fed AND against the two models that claim to explain the residual. It is deliberately a measure of our own ignorance, which is the quantity most likely to be mispriced, because nobody is paid to trade it.',
  dataSources: 'Treasury par 30y; effective fed funds (H.15); NY Fed ACM 10y term premium; FRED T5YIFR.',
  backtestDesign:
    'Rolling 504-trading-day z-score. Signal at +2.0 sigma: the long end is orphaned to the upside, which historically precedes mean reversion rather than continuation, because a residual with no fundamental owner has nothing holding it up. Signal at -1.5 sigma: the long end is expensive to its own drivers, typically a flight-to-quality overshoot. Evaluate on 30-day forward 10s30s changes, walk-forward with a one-year burn-in, no in-sample parameter fitting, and report the hit rate against a naive momentum benchmark rather than against zero.',
  dataMiningCaveat:
    'Read this before you trade it. The coefficients (1.00, 1.25, 0.60) are chosen on reasoning, not fitted - a 30y should carry roughly 1.25x the 10y term premium on duration alone, and 0.60 on breakevens reflects that 5y5y overstates the long-end inflation premium. If they HAD been fitted, the backtest would be worthless, and any published hit rate on a fitted version of this should be treated as fiction. More fundamentally: the whole construct assumes ACM is a decent measure of term premium, and ACM disagrees with Kim-Wright by 13bp today. The orphan therefore contains model error as well as market information, and there is no way to separate them. Use it as a question, never as a signal. It is at its most useful when it disagrees with the narrative, and at its most dangerous when it agrees.',
  currentReading:
    'OP-30 at approximately +1.6 sigma [E]. Elevated but short of the +2.0 threshold. Consistent with the term-premium attribution showing roughly 22bp of the 78bp without a fundamental owner, and it is the quantitative reason Scenario D carries 10% rather than being dismissed.',
  trade:
    'At +2.0 sigma: buy the 30y against the 10y - a 10s30s flattener, DV01-neutral, $192mm 10y per $100mm 30y (10y DV01 $774/mm vs 30y $1,487/mm). Hold 30 sessions. Stop when OP-30 crosses back below +1.0, which is a signal stop rather than a price stop, because the thesis is about the residual and not about the level.',
};

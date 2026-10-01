// ============================================================================
// Part 6 - Institution Lens: a consumer and commercial super-regional bank.
// Appendix - Exotic signals.
//
// WHAT CHANGED IN v3.2
//
// This section used to describe an invented mortgage-servicing bank with
// invented balances - $4.2bn of escrow, an $890m MSR, a 60% hedge ratio. It
// was the last large block of fabricated numbers left standing after the v3.1
// rebuild, and it survived for exactly the reason every other fabricated
// number survived: nobody had tried to fetch it.
//
// It is now built on The Huntington National Bank (FDIC cert 6560), a Columbus,
// Ohio consumer-and-commercial super-regional, with every balance-sheet figure
// pulled from its quarterly Call Report via the FDIC's free API. Three reasons
// it is the right worked example:
//
//   1. The mix is genuinely consumer PLUS commercial - roughly 29% C&I, 18%
//      CRE, 12% direct consumer including a large auto book - rather than a
//      monoline whose risks all point the same way.
//   2. It has just absorbed a large acquisition, so integration strain appears
//      in the reported numbers rather than in a footnote.
//   3. It crossed $250bn of assets IN A SINGLE QUARTER, which drags it from
//      Category IV into Category III supervision. That is the one balance-sheet
//      event where the rate scenario and the regulatory regime interact, and it
//      is what this section now exists to analyse.
//
// Narrative is judgement and dated. Numbers are fetched. The same rule as
// everywhere else in this framework.
// ============================================================================

import type { Snapshot } from '../lib/snapshot';

/** Last date a human re-reasoned the Part 6 narrative against the filings. */
export const institutionReviewedOn = '2026-10-01';

// ---------------------------------------------- the regulatory transition ---

/**
 * The centrepiece, and the thing a generic bank-treasury template will never
 * tell you: crossing $250bn is not a size milestone, it is a change in what
 * your capital ratio is MADE OF.
 */
export const regulatoryTransition = {
  headline: 'From Category IV to Category III, in one quarter',
  whatChanges: [
    {
      item: 'The AOCI opt-out disappears',
      detail: 'This is the one that matters and it is the one that gets buried on page 90 of the deal deck. Category IV banks elect out of including accumulated other comprehensive income in regulatory capital, which is why a regional can carry billions of unrealised securities losses without its CET1 ratio moving. Category III banks cannot elect out. The instant the election goes, every basis point of the long end starts transmitting directly into the capital ratio.',
      rateSensitive: true,
      severity: 'HIGH' as const,
    },
    {
      item: 'The Supplementary Leverage Ratio applies',
      detail: 'A 3% minimum on total leverage exposure, including off-balance-sheet commitments. For a commercial bank carrying large undrawn revolvers and standby lines, the SLR can bind before the risk-based ratios do - and it binds on exactly the quantity that grows when corporate borrowers get nervous and draw.',
      rateSensitive: false,
      severity: 'MED' as const,
    },
    {
      item: 'LCR and NSFR go from reduced to full',
      detail: 'The reduced requirement becomes the complete one. In practice this means holding more HQLA against the same deposit base, which is a permanent drag on net interest margin paid in exchange for a regulatory ratio. It also makes the composition of the securities book a compliance question rather than an investment one.',
      rateSensitive: false,
      severity: 'MED' as const,
    },
    {
      item: 'Supervisory stress testing goes biennial to annual',
      detail: 'Not merely more frequent - continuously consuming. The stress-test apparatus becomes a permanent function rather than an alternate-year project, and it arrives in the same quarters as the integration.',
      rateSensitive: false,
      severity: 'MED' as const,
    },
    {
      item: 'Resolution planning and countercyclical buffer obligations step up',
      detail: 'Administrative rather than economic in the near term, but it is more of the same scarce resource: senior management attention during an integration.',
      rateSensitive: false,
      severity: 'LOW' as const,
    },
  ],
  theCollision:
    'Here is the part that no scenario deck models, because it requires reading the rate outlook and the regulatory calendar on the same page. The AOCI filter is being removed from a bank that holds a large available-for-sale securities portfolio, and it is being removed while the long end is moving. Under Scenario B the 30y adds roughly 48bp in a month - that mark lands on a capital ratio which, twelve months ago, would not have noticed it. The bank did not choose the timing of either event. It chose the acquisition, and the acquisition chose the threshold, and the threshold chose the exposure.',
  theDefence:
    'Against that, the same transition is a tailwind if the rates move the other way. In Scenario D the long end rallies 34bp in a month with no credit event, which under the new regime now ACCRETES to CET1 rather than being filtered out of it. A bank that crosses $250bn is not simply worse off - it has swapped a smoothed capital ratio for a volatile one. The right response is not to lament the volatility but to hedge it, because for the first time the AOCI hedge has a regulatory payoff and not merely an accounting one.',
  theActionableVersion:
    'Pre-positioning for Category III is almost entirely a securities-book problem. Shorten AFS duration, move the long tail of the portfolio to held-to-maturity where the mark does not flow (accepting that HTM is a one-way door and kills your flexibility), or hedge the AFS book with receive-fixed swaps designated as fair-value hedges. All three cost money. Doing none of them costs an unknown amount at an unknown time, which is how banks discover that an unhedged capital ratio is a position.',
};

// ------------------------------------------------- super-regional context ---

/**
 * The market commentary layer: what the super-regional conversation is actually
 * about right now, and why it lands on this balance sheet specifically.
 */
export const superRegionalThemes = [
  {
    theme: '$250bn is the new $100bn',
    whatTheStreetSays: 'The consolidation wave across super-regionals is justified on scale: technology spend, payments infrastructure and regulatory overhead are fixed costs that need a bigger denominator. The deals are sold as efficiency stories.',
    whatItActuallyMeans: 'The efficiency case is real but it is front-loaded with costs and back-loaded with benefits, and the regulatory step-up at $250bn is an under-priced component of the deal maths. Buying your way across the threshold means buying the AOCI inclusion, the SLR, full LCR and annual stress testing along with the deposits. Deal models discount the synergies at a hurdle rate; almost none of them discount the regulatory regime change at all.',
    thisBank: 'Visible directly in the filings: the efficiency ratio moved from the mid-50s before the deal to the low 60s immediately after, and has only partly retraced. That is integration cost showing up where it should.',
  },
  {
    theme: 'The deposit franchise is the only durable asset',
    whatTheStreetSays: 'Post-2023, deposit quality is the differentiator. Granular, operational, insured consumer deposits trade at a premium to hot commercial money. Everyone says this; the market prices it inconsistently.',
    whatItActuallyMeans: 'The useful segmentation is not retail versus commercial, it is WHY THE CUSTOMER IS THERE. A deposit attached to a payroll file, a treasury-management mandate or a merchant-acquiring relationship does not leave for 40bp. A deposit attached to a rate does. Banks report the first split and manage to the second, which is why reported deposit betas consistently under-predict the behaviour of the marginal dollar.',
    thisBank: 'A loan-to-deposit ratio in the low 80s means this is a deposit-funded bank, not a wholesale-funded one. That single ratio is the best structural defence it has in Scenarios B and C, and it is the number that most distinguishes it from the institutions that failed in 2023 carrying ratios above 95%.',
  },
  {
    theme: 'The back-book repricing tailwind',
    whatTheStreetSays: 'Net interest income troughed and is inflecting. Loans and securities written at 2-3% keep maturing into a 5-6% market, so margin expands on autopilot without the bank doing anything clever.',
    whatItActuallyMeans: 'True, and the most reliably under-appreciated earnings driver in the sector - but it is a function of the REINVESTMENT rate, not the policy rate. The tailwind survives a Fed that cuts. It does not survive a long end that rallies. That makes the pain-trade scenario, which everyone treats as benign, quietly the worst one for forward margin.',
    thisBank: 'Margin has expanded steadily over the last two years while the policy rate did very little. That is the back book repricing, and it is the engine that Scenario D would throttle.',
  },
  {
    theme: 'Non-depository financial institution lending',
    whatTheStreetSays: 'Bank lending to private credit funds, business development companies and specialty finance - subscription lines, NAV facilities, warehouse facilities - became the regulatory preoccupation of 2025 after a run of idiosyncratic credit accidents at regional lenders. Supervisors want the exposure disclosed and sized.',
    whatItActuallyMeans: 'The exposure is not primarily a credit problem, it is a LIQUIDITY problem wearing a credit costume. Undrawn commitments to leveraged funds are a contingent claim that gets drawn precisely when the funds cannot raise elsewhere, which is precisely when the bank least wants to fund it. The credit may well be money-good. The draw is not optional.',
    thisBank: 'Sits inside the C&I line and is not separately reported in the Call Report, which is exactly the problem - it is the largest exposure in this analysis that cannot be sized from public filings. Flagged as unmeasurable rather than assumed away.',
  },
  {
    theme: 'Credit normalisation, or credit deterioration',
    whatTheStreetSays: 'Charge-offs are normalising from unsustainably low pandemic-era levels toward long-run averages. Nothing to see. The bull case on regional credit has been "normalisation" for about eight consecutive quarters.',
    whatItActuallyMeans: 'Normalisation and deterioration look identical for roughly three quarters and then diverge violently. The tell is not the charge-off rate, it is the relationship between FORMATION and REALISATION: non-performing loans entering the book versus losses leaving it. A stable charge-off rate with rising non-accruals is not normalisation. It is a queue.',
    thisBank: 'The sharpest signal in the whole dataset. See the credit panel - non-performing loans have risen materially while the charge-off rate has been flat to lower. Some of that is purchase accounting on acquired loans. Not all of it is.',
  },
  {
    theme: 'AOCI accretion as a capital tailwind',
    whatTheStreetSays: 'Unrealised securities losses pull to par as bonds approach maturity, so capital rebuilds mechanically over time regardless of what rates do. Several banks guide to it explicitly.',
    whatItActuallyMeans: 'Correct, and genuinely free - it is the one capital source that requires no retention, no issuance and no dilution. The catch is that the accretion schedule is slow and the rate shock is fast. Accretion is a tailwind measured in quarters; a 50bp selloff is a headwind measured in days. Relying on accretion is relying on not being interrupted.',
    thisBank: 'Material: the available-for-sale book is a large share of total securities, so most of the portfolio marks through capital rather than sitting in held-to-maturity. That cuts both ways and, under Category III, cuts harder.',
  },
];

// --------------------------------------------------- deposit beta asymmetry -

/**
 * The single most useful piece of arithmetic for a consumer-and-commercial bank
 * facing a cutting cycle, and the one most often got backwards.
 *
 * "Asset-sensitive" describes what happens when rates RISE. Everyone knows
 * that. Far fewer people carry the implication through: the same asset
 * sensitivity that made the last two years comfortable is what makes the first
 * year of an easing cycle painful, because floating-rate commercial assets
 * reprice at essentially 100% and immediately, while deposits reprice at a
 * fraction of that and slowly.
 */
export const depositBetaAsymmetry = {
  premise:
    'Deposit costs went up quickly and come down slowly, and the reason is mix rather than pricing discipline. Through the hiking cycle the book shifted out of non-interest-bearing checking into money-market accounts, exception-priced commercial balances and term CDs. Every one of those is stickier on the way down: a CD reprices only at maturity, an exception-priced commercial relationship reprices only when the relationship manager has an uncomfortable conversation, and a customer who moved to a 4% money market does not move back to a 0.1% checking account because the Fed cut.',
  legs: [
    { leg: 'Floating-rate C&I and commercial lines', repricesAt: '~100%', speed: 'Immediate - next reset date', note: 'The largest loan category on this balance sheet. In a cutting cycle this is the leg that moves first and fastest, and it moves against you.' },
    { leg: 'Securities reinvestment', repricesAt: '100% of the new rate', speed: 'As cash flows arrive', note: 'The back-book tailwind runs through here. It is driven by the LONG end, not the policy rate - which is why Scenario D hurts it and Scenario C does not, despite C having far lower policy rates.' },
    { leg: 'Consumer loans - auto, RV and marine, personal', repricesAt: '0% on the existing book', speed: 'Only on new origination', note: 'Fixed-rate and long-dated. A stabiliser in a cutting cycle: the yield on the existing book is locked. This is the quiet virtue of a consumer franchise and it is why a consumer-and-commercial mix behaves better in C than a pure commercial bank does.' },
    { leg: 'Interest-bearing deposits', repricesAt: '35-50% in year one [E]', speed: 'Lagged, mix-dependent', note: 'The whole ballgame. Every 10 percentage points of down-beta is worth real margin on a deposit base this size. The number is not knowable in advance; it is discovered.' },
    { leg: 'Non-interest-bearing deposits', repricesAt: 'n/a', speed: 'n/a', note: 'Costs nothing and therefore cannot get cheaper. The NIB share is pure margin insulation, and its erosion through the hiking cycle is the single most damaging thing that happened to regional bank margins since 2022 - more damaging than the rate level itself.' },
  ],
  theTrap:
    'Put those legs together and the first year of an easing cycle looks like this: assets reprice down at close to 100%, deposits reprice down at perhaps 40%, and the gap is margin compression arriving at the precise moment credit costs are rising. The bank is not badly run. It is asset-sensitive, which is what it told everyone it was, and asset sensitivity is a position that has a bad side.',
  theHedge:
    'The defence is receive-fixed swaps and interest rate collars put on BEFORE the cutting cycle, converting floating-rate commercial assets to fixed. Every super-regional added some version of this after 2023. The cost is giving up upside if rates rise instead - which is to say, the cost is being wrong about Scenario B. There is no free version. There is only a priced version and an unpriced one.',
};

// -------------------------------------------------- balance sheet by area ---

export interface BalanceSheetImpact {
  area: string;
  /** Which live Call Report metrics anchor this row. Rendered from the snapshot. */
  anchors: string[];
  measure: string;
  A: string;
  B: string;
  C: string;
  D: string;
  ownIndicator: string;
}

export const institutionImpacts: BalanceSheetImpact[] = [
  {
    area: 'Deposit franchise and funding mix',
    anchors: ['deposits', 'loansToDeposits'],
    measure: 'Loan-to-deposit ratio, non-interest-bearing share, and realised down-beta',
    A: 'Benign and boring, which is the point. Deposit costs plateau, the mix stops deteriorating, and the loan-to-deposit ratio in the low 80s means no wholesale funding is required to grow. The risk in A is complacency: this is when you should be buying the down-beta hedge, because it is cheap and nobody wants it.',
    B: 'Counter-intuitively the easiest scenario for funding cost. The selloff is at the long end; deposit pricing is a front-end phenomenon, and the front end barely moves. Funding is fine. The damage in B is entirely in the securities book and the capital ratio, not in the deposit line.',
    C: 'The hard one. The Fed cuts aggressively and the realised down-beta becomes the single most consequential number in the institution. If deposits reprice at 40% against floating-rate assets repricing at 100%, margin compresses by tens of basis points in the first year - while credit costs are rising. Two problems, perfectly correlated, arriving together.',
    D: 'The sneaky one, and the scenario most people score as benign. The long end rallies but the front end does not, so there is no deposit cost relief at all. Meanwhile the reinvestment yield on maturing securities falls, which throttles the back-book repricing engine that has driven margin expansion for two years. Best scenario for capital, worst for forward margin.',
    ownIndicator: 'Realised down-beta in the first full quarter after the first cut, measured as the change in interest-bearing deposit cost divided by the change in the effective fed funds rate. Anything below 40% means the hedging programme has to carry the whole load, and you will know within one quarter.',
  },
  {
    area: 'Securities book, AOCI and regulatory capital',
    anchors: ['securities', 'securitiesAfs', 'afsShareOfSecurities', 'cet1Pct', 'equity'],
    measure: 'AFS share of securities, CET1 ratio, and AOCI sensitivity per 100bp',
    A: 'Stable. Unrealised losses accrete back toward par on the maturity schedule, quietly rebuilding capital with no issuance and no dilution. The most underrated capital source in banking, and it works as long as nothing interrupts it.',
    B: 'The collision scenario. A long-end selloff marks down a large available-for-sale portfolio at exactly the moment the Category III transition removes the ability to filter that mark out of regulatory capital. What was an accounting line becomes a capital line. This is the specific interaction that makes this bank, at this moment, analytically interesting rather than generic.',
    C: 'Genuine relief on this line - rates fall, marks recover, capital accretes. But read it properly: the capital that comes back is offset by credit provisions going out. The CET1 ratio may barely move, which conceals the fact that the QUALITY of the capital changed. You exchanged a mark-to-market loss that would have accreted back on its own for a realised credit loss that never comes back. Same ratio, different balance sheet.',
    D: 'Unambiguously the best outcome here, and the only line in the whole analysis where D is clearly the winner. A long-end rally with no credit event accretes directly to capital, and under the new regime it accretes to REGULATORY capital rather than just book value.',
    ownIndicator: 'AFS unrealised loss per 100bp parallel shift, recomputed monthly, expressed in basis points of CET1 under BOTH the current filter and the Category III treatment. Running those two numbers side by side is the single most useful page the treasury team can produce this year.',
  },
  {
    area: 'Commercial credit - C&I, CRE and the unmeasurable',
    anchors: ['ci', 'ciPctLoans', 'cre', 'crePctTier1'],
    measure: 'CRE as a percentage of tier 1 capital, C&I concentration, NDFI exposure',
    A: 'Normalisation holds. Charge-offs drift in a range, reserves are adequate, workouts proceed at the pace of the legal system rather than the market.',
    B: 'Higher long rates raise the hurdle on every CRE refinancing. Values are a function of cap rates and cap rates are a function of the long end, so B is a direct valuation shock to the CRE book. The partial defence here is real and worth stating: CRE as a share of tier 1 capital sits far below the 300% supervisory guidance level, which is the single biggest structural difference between this bank and the regionals that broke in 2023-24.',
    C: 'C&I is the real economy, so a growth shock hits it directly and broadly. Reserve build accelerates ahead of charge-offs. The genuinely unmeasurable risk is lending to non-depository financial institutions, which sits inside the C&I line with no separate Call Report disclosure: undrawn commitments to leveraged funds get drawn exactly when nobody wants to fund them.',
    D: 'Benign to positive. Lower long rates improve refinancing maths on CRE immediately and reduce the pressure on the workout pipeline. The best credit scenario on the board.',
    ownIndicator: 'The formation-to-realisation gap: new non-accrual formation versus net charge-offs, quarter by quarter. A stable charge-off rate with rising non-accruals is not normalisation, it is a queue - and the queue is currently lengthening.',
  },
  {
    area: 'Consumer credit - auto, RV and marine, personal',
    anchors: ['auto', 'consumerOther', 'consumerPctLoans'],
    measure: '30-day delinquency by vintage, used-collateral values, loss severity',
    A: 'Stable. Employment holds, delinquencies drift at seasonal norms, severity is contained because collateral values are supported.',
    B: 'Largely insulated. The existing consumer book is fixed-rate, so a long-end selloff does nothing to the contractual payment of a borrower who already has the loan. New origination volumes fall. This is where a consumer franchise earns its keep relative to a pure commercial bank.',
    C: 'Where it hurts, and where it shows up FIRST. Consumer credit leads commercial credit by two to three quarters, and within consumer, recreational lending leads everything: long-dated discretionary credit secured by a depreciating asset nobody needs. Severity compounds the frequency problem because loss given default rises exactly when used-collateral values fall. Auto follows, then card, then C&I.',
    D: 'Mildly positive. Lower rates improve new-origination affordability without disturbing the existing book.',
    ownIndicator: '30-day delinquency in the recreational and marine vintages originated at the cycle lows, tracked separately from the rest of consumer. It is the smallest book in the bank and the best leading indicator in it, and it moves a full quarter before anything in the macro data does.',
  },
  {
    area: 'Liquidity, contingency funding and the new ratios',
    anchors: ['cash', 'loansToDeposits', 'securitiesToAssets'],
    measure: 'HQLA coverage, FHLB capacity, discount window pre-positioning',
    A: 'Comfortable. Use the quiet to complete the Category III liquidity build rather than deferring it until the examiners ask.',
    B: 'The stress is in collateral, not in deposits. Securities pledged to FHLB are marked for advance capacity, and a long-end selloff reduces the borrowing value of the same bonds you would be pledging. Capacity shrinks exactly when you want it - the collateral channel, and it is routinely left out of liquidity stress tests that model deposit outflow but hold collateral values constant.',
    C: 'Severe in the classic way: deposit outflow pressure meets a drawn revolver book meets rising provisions. The FHLB is the first real line, the discount window is the second, and the second only works if it has been pre-positioned and TESTED.',
    D: 'Benign, and a window to term out cheaply. The risk in D is cancelling insurance because the weather is good.',
    ownIndicator: 'FHLB borrowing capacity recomputed at current marks weekly, not at par. If capacity falls while deposits are flat, that is the collateral channel tightening silently and it will not appear in any deposit-based early warning system.',
  },
  {
    area: 'Integration and management bandwidth',
    anchors: ['efficiencyPct', 'roaPct'],
    measure: 'Efficiency ratio versus pre-deal baseline, and the shape of its retracement',
    A: 'Integration proceeds on plan. Cost synergies arrive, the efficiency ratio retraces toward the pre-deal baseline, nobody writes an article.',
    B: 'Integration continues while the capital ratio moves daily under the new AOCI treatment. The constraint is not financial, it is attention: the same small group of senior people runs the integration, the Category III build and the capital response.',
    C: 'Credit deterioration during integration is the genuinely dangerous combination, because a newly acquired book is the one you understand least well at the moment you most need to understand it. Acquired loan marks were set under one set of assumptions; a growth shock tests all of them at once.',
    D: 'The gift. A calm market during an integration is the best possible outcome and should be spent finishing the work rather than celebrating it.',
    ownIndicator: 'Efficiency ratio versus the pre-deal baseline, read as a trajectory rather than a level. A retracement that stalls is telling you the synergies were optimistic, and it tells you a full year before the goodwill test does.',
  },
];

// ------------------------------------------------------------- actions -----

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
    action: 'Run the dual-basis AOCI report: CET1 impact per 100bp under both the current filter and the Category III treatment',
    protects: 'B, and the transition itself',
    priority: 'HIGH',
    trigger: 'Now, unconditionally. The trigger is the regulatory calendar, not the market.',
    owner: 'Treasury / regulatory capital',
    leadTime: '2-3 weeks',
    cost: 'Analyst time only. It is the cheapest item on this list and the most likely to change a decision, because nobody argues about a number that has not been computed.',
  },
  {
    action: 'Shorten AFS duration, or hedge it with designated fair-value receive-fixed swaps',
    protects: 'B',
    priority: 'HIGH',
    trigger: 'Before the Category III effective date, not after. Also on any 25bp back-up in the 10y.',
    owner: 'ALM / investment portfolio',
    leadTime: '4-8 weeks to execute at size without moving the market against yourself',
    cost: 'Real: giving up yield, or paying for the hedge. The alternative is an unhedged capital ratio, which is a position whether or not anybody voted for it.',
  },
  {
    action: 'Buy down-rate protection on the floating-rate commercial book - receive-fixed swaps or collars',
    protects: 'C',
    priority: 'HIGH',
    trigger: 'While the market still prices a low probability of cuts. This is insurance and insurance is priced on consensus.',
    owner: 'ALM',
    leadTime: '3-4 weeks',
    cost: 'Gives up margin upside if Scenario B happens instead. That is the actual trade: you are selling the B outcome to buy the C outcome, and it should be stated that plainly to the committee rather than described as risk reduction.',
  },
  {
    action: 'Size the NDFI and fund-finance book - drawn, undrawn, and by counterparty type',
    protects: 'C',
    priority: 'HIGH',
    trigger: 'Now. The exposure cannot be seen in public filings, which means it cannot be seen by anyone outside the bank, which means the only people who can size it are inside it.',
    owner: 'Credit risk / commercial banking',
    leadTime: '4-6 weeks',
    cost: 'Relationship friction with sponsors. This is the largest exposure in this analysis that cannot be measured from the outside, and undrawn commitments to leveraged funds get drawn precisely when funding them is hardest.',
  },
  {
    action: 'Recompute FHLB borrowing capacity at current collateral marks, weekly',
    protects: 'B and C',
    priority: 'MED',
    trigger: 'Now, as a standing report',
    owner: 'Treasury operations',
    leadTime: '2 weeks',
    cost: 'Operational only. Catches the collateral channel, which no deposit-based early warning system will ever see.',
  },
  {
    action: 'Complete discount window pre-positioning and run a live test draw',
    protects: 'B and C',
    priority: 'HIGH',
    trigger: 'Immediate. A facility nobody has drawn is a plan, not a facility.',
    owner: 'Treasury operations',
    leadTime: '6-8 weeks including documentation',
    cost: 'Operational, plus the stigma conversation. The entire value is discovering the operational failure on a quiet Tuesday rather than on the morning it matters.',
  },
  {
    action: 'Report consumer delinquency by vintage, with recreational and marine broken out separately',
    protects: 'C',
    priority: 'MED',
    trigger: 'Now, as a standing monthly report to ALCO',
    owner: 'Consumer credit risk',
    leadTime: '3 weeks',
    cost: 'Reporting build only. It is the smallest book in the bank and the best leading indicator in it.',
  },
  {
    action: 'Set the formation-to-realisation gap as a formal ALCO trigger',
    protects: 'C',
    priority: 'HIGH',
    trigger: 'Immediate - this is governance, not a market call',
    owner: 'ALCO',
    leadTime: 'Next committee',
    cost: 'None. The only cost of a pre-agreed trigger is having to explain in writing why you are not acting when it fires, and that explanation is the control.',
  },
];

/**
 * Pulls the live Call Report figures a narrative row refers to, so prose and
 * table cannot drift apart.
 */
export function anchorValues(snap: Snapshot, keys: string[]): { key: string; value: string }[] {
  const b = snap.bank;
  if (!b) return [];
  const fmtMap: Record<string, (v: number) => string> = {
    assets: (v) => `$${v.toFixed(1)}bn`,
    deposits: (v) => `$${v.toFixed(1)}bn`,
    loans: (v) => `$${v.toFixed(1)}bn`,
    cash: (v) => `$${v.toFixed(1)}bn`,
    equity: (v) => `$${v.toFixed(1)}bn`,
    securities: (v) => `$${v.toFixed(1)}bn`,
    securitiesAfs: (v) => `$${v.toFixed(1)}bn`,
    ci: (v) => `$${v.toFixed(1)}bn`,
    cre: (v) => `$${v.toFixed(1)}bn`,
    auto: (v) => `$${v.toFixed(1)}bn`,
    consumerOther: (v) => `$${v.toFixed(1)}bn`,
    loansToDeposits: (v) => `${v.toFixed(1)}%`,
    securitiesToAssets: (v) => `${v.toFixed(1)}%`,
    afsShareOfSecurities: (v) => `${v.toFixed(1)}%`,
    crePctTier1: (v) => `${v.toFixed(0)}% of T1`,
    consumerPctLoans: (v) => `${v.toFixed(1)}% of loans`,
    ciPctLoans: (v) => `${v.toFixed(1)}% of loans`,
    cet1Pct: (v) => `${v.toFixed(2)}%`,
    efficiencyPct: (v) => `${v.toFixed(1)}%`,
    roaPct: (v) => `${v.toFixed(2)}%`,
  };
  const labels: Record<string, string> = {
    assets: 'Assets', deposits: 'Deposits', loans: 'Net loans', cash: 'Cash & balances',
    equity: 'Equity', securities: 'Securities', securitiesAfs: 'AFS securities',
    ci: 'C&I', cre: 'CRE', auto: 'Auto', consumerOther: 'Other consumer',
    loansToDeposits: 'Loans/deposits', securitiesToAssets: 'Securities/assets',
    afsShareOfSecurities: 'AFS share', crePctTier1: 'CRE concentration',
    consumerPctLoans: 'Consumer', ciPctLoans: 'C&I share', cet1Pct: 'CET1',
    efficiencyPct: 'Efficiency', roaPct: 'ROA',
  };
  const out: { key: string; value: string }[] = [];
  for (const k of keys) {
    const v = (b.latest as unknown as Record<string, number | null>)[k];
    if (v === null || v === undefined || !Number.isFinite(v)) continue;
    out.push({ key: labels[k] ?? k, value: (fmtMap[k] ?? ((x: number) => x.toFixed(2)))(v) });
  }
  return out;
}

// ============================================================================
// Appendix - Exotic signals (unchanged from v3.0)
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
    'Read this before you trade it. The coefficients (1.00, 1.25, 0.60) are chosen on reasoning, not fitted - a 30y should carry roughly 1.25x the 10y term premium on duration alone, and 0.60 on breakevens reflects that 5y5y overstates the long-end inflation premium. If they HAD been fitted, the backtest would be worthless, and any published hit rate on a fitted version of this should be treated as fiction. More fundamentally: the whole construct assumes ACM is a decent measure of term premium, and ACM disagrees with Kim-Wright materially today. The orphan therefore contains model error as well as market information, and there is no way to separate them. Use it as a question, never as a signal. It is at its most useful when it disagrees with the narrative, and at its most dangerous when it agrees.',
  currentReading:
    'Elevated but short of the signal threshold [E]. Consistent with the term-premium attribution showing a meaningful slice of the premium without a fundamental owner, and it is the quantitative reason Scenario D carries a non-trivial weight rather than being dismissed.',
  trade:
    'At +2.0 sigma: buy the 30y against the 10y - a 10s30s flattener, DV01-neutral at roughly the ratio shown on the dashboard. Hold 30 sessions. Stop when OP-30 crosses back below +1.0, which is a signal stop rather than a price stop, because the thesis is about the residual and not about the level.',
};

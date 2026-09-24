// "So-What?" Section Data — Sector & Market-Cap Impact Analysis
// SPY Sector Definitions (GICS)

export type SectorImpact = {
  sector: string;
  ticker: string;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'MIXED';
  magnitude: 'HIGH' | 'MED' | 'LOW';
  rationale: string;
};

export type CapNarrative = {
  cap: 'Small Cap' | 'Mid Cap' | 'Large Cap';
  index: string;
  verdict: string;
  thesis: string;
  keyRisk: string;
  keyCatalyst: string;
};

export type SoWhatData = {
  sectors: SectorImpact[];
  caps: CapNarrative[];
  summary: string;
};

// ==================== PART 0: DASHBOARD (Current State) ====================
export const soWhat_Part0: SoWhatData = {
  sectors: [
    { sector: 'Energy', ticker: 'XLE', direction: 'BULLISH', magnitude: 'HIGH', rationale: 'Oil at $92 on Iran/GCC disruption. Upstream producers printing cash at >$75 WTI. Refining margins elevated. The sector is the one place where earnings revisions are still positive.' },
    { sector: 'Financials', ticker: 'XLF', direction: 'MIXED', magnitude: 'MED', rationale: 'Higher NII from steep curve is offset by credit deterioration signals and AOCI pressure on bank capital. Net interest margins peak but loan growth stalls at 7% mortgage rates. Insurance companies benefit from higher discount rates.' },
    { sector: 'Technology', ticker: 'XLK', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Duration-sensitive growth stocks face multiple compression as 10y real yield at 2.42% discounts future cash flows more aggressively. AI capex is a cash drag, not yet earnings accretive. The mega-cap concentration in S&P means index-level pain is amplified.' },
    { sector: 'Real Estate', ticker: 'XLRE', direction: 'BEARISH', magnitude: 'HIGH', rationale: '30y mortgage at 7.22% freezes transaction volume. Cap rates must rise to compete with risk-free rate — but existing asset values mark down. REITs face refinancing wall at much higher spreads. The sector is a bond proxy getting punished.' },
    { sector: 'Utilities', ticker: 'XLU', direction: 'BEARISH', magnitude: 'MED', rationale: 'Classic bond proxy suffering from rate competition. However, AI data-center power demand provides a secular growth offset. Net: the rate headwind dominates for now. Regulatory lag on rate cases compresses margins.' },
    { sector: 'Consumer Staples', ticker: 'XLP', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Defensive characteristics provide ballast but inflation in input costs (energy, commodities) pressures margins. Pricing power exists but volume destruction begins at these consumer spending levels. A relative outperformer in absolute terms, still negative.' },
    { sector: 'Health Care', ticker: 'XLV', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Defensive sector with rate-insensitive earnings. Pharma pipeline catalysts are idiosyncratic. Managed care faces medical cost ratio pressure from aging demographics. Not rate-driven — trades on fundamentals.' },
    { sector: 'Industrials', ticker: 'XLI', direction: 'MIXED', magnitude: 'MED', rationale: 'Strong PMIs support order books but input cost inflation (energy, metals) compresses margins. Defense spending is a tailwind. Transportation sub-sector hurt by fuel costs. The sector is split between beneficiaries of reshoring and victims of cost inflation.' },
    { sector: 'Materials', ticker: 'XLB', direction: 'MIXED', magnitude: 'MED', rationale: 'Commodity prices elevated (energy pass-through) but demand-side concerns from slowing growth. Chemicals facing feedstock cost pressure. Metals benefit from infrastructure spending but face China demand uncertainty. Net: volume is the question.' },
    { sector: 'Communication Services', ticker: 'XLC', direction: 'BEARISH', magnitude: 'MED', rationale: 'Duration-sensitive (growth-oriented DCF valuations for Meta, Alphabet, Netflix). Ad spending slows with consumer caution. However, cash generation is strong and buybacks provide floor. The sell-off is valuation compression, not fundamental deterioration.' },
    { sector: 'Consumer Discretionary', ticker: 'XLY', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Consumer spending decelerating under 7% mortgage rates (helicopter effect: homeowners feel poorer). Auto sales pressured by financing costs. Luxury resilient but mass-market discretionary is the canary. Amazon is the anchor — if it slows, the sector follows.' },
  ],
  caps: [
    {
      cap: 'Small Cap',
      index: 'Russell 2000',
      verdict: 'BEARISH — Most Exposed',
      thesis: 'Small caps carry ~40% floating-rate debt vs. ~15% for large caps. At SOFR +350-450bp borrowing costs, interest coverage for the median Russell 2000 company is 1.8x — below the 2.0x distress threshold. Domestic revenue concentration means no FX hedge against dollar strength. The sector is a levered bet on rate cuts that aren\'t coming.',
      keyRisk: 'Refinancing wall: $280B of small-cap debt maturing in 2026-2027 at 300-400bp higher spreads. Default rate rises from 1.8% to 3.5-4.0%.',
      keyCatalyst: 'Fed pivot signal. Even rhetoric about cuts sends small caps +8-12% on rate sensitivity alone.',
    },
    {
      cap: 'Mid Cap',
      index: 'S&P MidCap 400',
      verdict: 'MIXED — Selective Pain',
      thesis: 'Mid caps occupy the uncomfortable middle: less pricing power than large caps, less financial flexibility than... also large caps. The sector splits between quality compounders (20-25% of the index) that can self-fund and zombie companies (15-20%) that need capital markets access they can\'t afford. The median mid-cap trades at 14x forward — cheap if earnings hold, expensive if they don\'t.',
      keyRisk: 'Earnings revision cycle turns negative as input costs rise and demand softens. The "missing middle" of the market gets no bid from passive flows (which concentrate at mega and small).',
      keyCatalyst: 'M&A activity. Strategic buyers with strong balance sheets acquire stressed mid-caps at 8-10x EBITDA. This provides a floor for quality names.',
    },
    {
      cap: 'Large Cap',
      index: 'S&P 500 (Top 100)',
      verdict: 'RESILIENT — But Not Immune',
      thesis: 'Mega-caps have the balance sheets to weather this: $2.4T in aggregate cash, 78% investment-grade credit, access to fixed-rate funding locked in at lower levels. International revenue (40%+ for S&P 500) provides diversification. The risk is multiple compression: at 21x forward earnings with 10y at 5.14%, the equity risk premium is -0.8% — markets are pricing perfection. Any earnings miss triggers de-rating.',
      keyRisk: 'Concentration risk: top 10 names are 35% of S&P 500. If AI monetization disappoints or regulation hits big tech, the index has no diversification buffer. Earnings yield vs. 10y is the vulnerability.',
      keyCatalyst: 'Earnings beats on AI monetization or margin expansion. If mega-caps deliver 15%+ EPS growth, the multiple holds despite rates. This is the base case for Scenario A.',
    },
  ],
  summary: 'The current regime is a barbell: Energy and defensive sectors hold up while rate-sensitive growth (Tech, Real Estate, Discretionary) sells off. Small caps are the most vulnerable asset class in the market — a levered bet on rate cuts that the Fed isn\'t delivering. Large-cap quality is the safe harbor but carries concentration risk. The market is pricing resilience; the risk is that resilience breaks.',
};

// ==================== PART 1: CURRENT DIRECTIVE ====================
export const soWhat_Part1: SoWhatData = {
  sectors: [
    { sector: 'Energy', ticker: 'XLE', direction: 'BULLISH', magnitude: 'HIGH', rationale: 'The transmission chain is direct: Iran/GCC conflict → oil supply disruption → $92 WTI → energy earnings beat. This is the one sector where higher rates are actually a tailwind (inflation beneficiary). Upstream FCF yield at 8-10% makes it a cash machine.' },
    { sector: 'Financials', ticker: 'XLF', direction: 'MIXED', magnitude: 'MED', rationale: 'The Warsh put is not a put — it\'s a hold. Banks benefit from NII expansion on the steep curve (+39bp 2s10s) but face: (a) loan growth deceleration, (b) credit loss provisioning uptick, (c) AOCI drag on tangible book. The net effect is roughly neutral for diversified banks, positive for trading-heavy names.' },
    { sector: 'Technology', ticker: 'XLK', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'The 10y move from 4.12% to 5.14% is a ~15% present-value haircut on a 10-year-duration growth stock. The market is decomposing: AI infrastructure spend (capex) vs. AI revenue (still minimal). The capex side (semis, cloud) holds; the revenue side (SaaS, software) gets crushed on discount rate.' },
    { sector: 'Real Estate', ticker: 'XLRE', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'The primary-secondary spread at 268bp means mortgage rates are structurally above 7% as long as 10y stays above 5%. Transaction volumes are down 35% YoY. REIT FFO yields at 5.5% offer no spread to Treasuries on a risk-adjusted basis. The sector needs 10y below 4.5% to re-rate.' },
    { sector: 'Utilities', ticker: 'XLU', direction: 'BEARISH', magnitude: 'MED', rationale: 'The AI power demand narrative is real but priced in (XLU +12% YTD on the theme). The rate sensitivity dominates: every 10bp move in 10y is ~1.5% downside in utility valuations. Regulatory lag on rate cases means input cost inflation flows through before revenue catches up.' },
    { sector: 'Consumer Staples', ticker: 'XLP', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Volume resilience in essentials but mix shifts downward (private label gain). Input cost inflation (energy, packaging) partially offset by pricing actions. The sector trades at 22x — not cheap for low growth. Relative outperformer in a sell-off but absolute returns likely flat to negative.' },
    { sector: 'Health Care', ticker: 'XLV', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Rate-insensitive earnings drive relative stability. GLP-1 drug spending is a headwind for payers but tailwind for Eli Lilly/Novo. Medical device companies benefit from aging demographics. The sector is a diversifier, not a driver.' },
    { sector: 'Industrials', ticker: 'XLI', direction: 'MIXED', magnitude: 'MED', rationale: 'The PMIs say strong but the PPI says expensive. Input costs rising faster than output prices in manufacturing — margin compression is the Q4 story. Defense and infrastructure are structural tailwinds but cyclical sub-sectors (transport, machinery) face demand softening. The sector is a leading indicator for growth — watch it.' },
    { sector: 'Materials', ticker: 'XLB', direction: 'MIXED', magnitude: 'MED', rationale: 'Energy costs drive input inflation for chemicals and building materials. Metals benefit from infrastructure spending but face headwinds from China property slowdown. The sector is a pure play on global growth — which is the question mark in all three scenarios.' },
    { sector: 'Communication Services', ticker: 'XLC', direction: 'BEARISH', magnitude: 'MED', rationale: 'The duration sensitivity is the same as Tech but with less balance sheet cushion. Ad markets are cyclical and slowing. However, the mega-caps (Meta, Google) are cash machines with buyback support. The sell-off is a de-rating, not a fundamental impairment — which means it\'s reversible if rates stabilize.' },
    { sector: 'Consumer Discretionary', ticker: 'XLY', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'The 7.22% mortgage rate is a wealth effect destroyer. Home equity extraction is frozen. Auto financing costs at 9%+ crush big-ticket purchases. The consumer is spending down savings (excess savings exhausted per SF Fed estimates) and rotating from goods to services. Discretionary goods are the casualty.' },
  ],
  caps: [
    {
      cap: 'Small Cap',
      index: 'Russell 2000',
      verdict: 'BEARISH — The Floating-Rate Trap',
      thesis: 'The current directive is a small-cap nightmare: the Fed is hiking (or holding at restrictive) while the long end sells off on fiscal concerns. Small caps can\'t win — they pay floating rate on new debt (SOFR +400bp = 7.75-8%) and can\'t refinance fixed-rate maturities at anything close to current coupons. The Russell 2000 earnings yield is ~6% — below the risk-free rate. This is not a sustainable equilibrium.',
      keyRisk: 'Earnings recession in small caps: consensus still prices 8% EPS growth for 2027 — too high by 15-20% in a higher-for-longer world. The revision cycle hasn\'t started yet.',
      keyCatalyst: 'Any Fed dovish pivot. Small caps have 2.0x beta to rate cuts. A 50bp cut = +12-15% rally in RUT.',
    },
    {
      cap: 'Mid Cap',
      index: 'S&P MidCap 400',
      verdict: 'UNDER PRESSURE — The Squeeze',
      thesis: 'Mid caps are caught between large-cap quality (which has balance sheets) and small-cap cheapness (which has rate-cut optionality). The mid-cap premium over small caps is at 5x forward P/E — above the 10-year average of 3x — suggesting the market is already pricing in mid-cap outperformance on quality. But if earnings disappoint, that premium compresses. The "bearish middle" thesis is alive.',
      keyRisk: 'Passive flow dynamics: mid-cap ETFs have seen $12B of outflows YTD as investors barbell into mega-cap quality and small-cap value. The flow headwind is structural until the narrative shifts.',
      keyCatalyst: 'Earnings differentiation. Mid-cap companies that can demonstrate pricing power and margin resilience will attract active manager attention. The stock-picker\'s market is the mid-cap opportunity.',
    },
    {
      cap: 'Large Cap',
      index: 'S&P 500 (Top 100)',
      verdict: 'RELATIVE HAVEN — But Expensive',
      thesis: 'Large caps are the market\'s safe harbor: fixed-rate debt locked in at 2-3%, massive cash balances earning 5%, international revenue diversification. The problem is price: 21x forward earnings with the 10y at 5.14% means the Fed model shows equities overvalued by 80bp vs. bonds. The "there is no alternative" trade works until there IS an alternative (5%+ risk-free). The large-cap bid is narrow — top 10 names account for 80% of YTD S&P returns.',
      keyRisk: 'Concentration unwind. If any mega-cap misses on AI monetization or faces regulatory action, the index has no cushion. The "Magnificent 7" trade is crowded at $14T in combined market cap.',
      keyCatalyst: 'Broadening. If the rally extends beyond mega-cap tech into financials, industrials, and energy, the index becomes more resilient. Watch equal-weight S&P 500 (RSP) vs. cap-weight (SPY) as the signal.',
    },
  ],
  summary: 'The Warsh regime creates a bifurcated market: inflation beneficiaries (Energy, Financials) vs. duration victims (Tech, Real Estate, Discretionary). Small caps are structurally disadvantaged by floating-rate exposure. Large-cap quality is the consensus trade but carries concentration risk. The key question: does the market broaden (bullish) or does mega-cap concentration become a liability (bearish)?',
};

// ==================== PART 2: SCENARIO A (Muddle-Through) ====================
export const soWhat_Part2: SoWhatData = {
  sectors: [
    { sector: 'Energy', ticker: 'XLE', direction: 'BULLISH', magnitude: 'MED', rationale: 'Oil stabilizes $80-90 in muddle-through. Energy earnings hold but the upside surprise fades. The sector transitions from momentum to value — still positive but the easy money is made. Dividend yield at 3.5% provides carry.' },
    { sector: 'Financials', ticker: 'XLF', direction: 'BULLISH', magnitude: 'MED', rationale: 'This is the scenario where banks win: NII peaks as the curve stays steep, credit losses remain manageable, and capital ratios hold. Regional banks benefit most from the steep curve. Insurance companies earn higher investment income. The sector re-rates +10-15% as earnings hold.' },
    { sector: 'Technology', ticker: 'XLK', direction: 'NEUTRAL', magnitude: 'MED', rationale: 'Rates stabilize (not rising further) removes the multiple compression headwind. AI monetization begins to show in earnings. The sector trades sideways-to-up as the denominator (discount rate) stops moving against it. Stock-picking returns — quality growth outperforms speculative growth.' },
    { sector: 'Real Estate', ticker: 'XLRE', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Rates stabilize means the bleeding stops but healing doesn\'t begin. 30y mortgage stays above 7% — transaction volumes remain depressed. REITs with strong balance sheets survive; levered names continue to underperform. The sector is dead money, not dying.' },
    { sector: 'Utilities', ticker: 'XLU', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Stable rates = stable valuations. The AI power demand theme provides a secular growth narrative that offsets rate sensitivity. The sector trades at 18x — fair value in a 5% rate world. Not exciting but not painful.' },
    { sector: 'Consumer Staples', ticker: 'XLP', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Inflation plateaus means input costs stabilize. Volume growth is flat but margins hold. The sector delivers 6-8% total returns (dividend + modest appreciation). Boring is beautiful in muddle-through.' },
    { sector: 'Health Care', ticker: 'XLV', direction: 'BULLISH', magnitude: 'LOW', rationale: 'Rate-insensitive sector benefits from rotation into quality/defensive. GLP-1 spending shift creates winners (manufacturers) and losers (payers). Net positive as the sector re-rates on earnings stability.' },
    { sector: 'Industrials', ticker: 'XLI', direction: 'BULLISH', magnitude: 'MED', rationale: 'Growth slows but doesn\'t break — industrials hold up. Infrastructure spending (IRA, CHIPS) provides a multi-year order book. Defense budgets stay elevated. The sector benefits from reshoring capex cycle. +8-12% total return potential.' },
    { sector: 'Materials', ticker: 'XLB', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Stable growth means stable demand. Input costs plateau. The sector trades on China exposure — if China stabilizes, materials outperform; if not, dead money. Net: range-bound.' },
    { sector: 'Communication Services', ticker: 'XLC', direction: 'BULLISH', magnitude: 'MED', rationale: 'Stable rates remove the de-rating headwind. Ad markets stabilize. Buybacks support. The mega-caps (Meta, Google) re-rate as the market realizes they\'re cash machines, not rate-sensitive growth. +10-15% upside as multiple holds.' },
    { sector: 'Consumer Discretionary', ticker: 'XLY', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Consumer spending slows but doesn\'t collapse. The sector bifurcates: luxury (LVMH, Hermes) holds up; mass-market discretionary (Gap, Kohl\'s) struggles. Amazon is the swing factor — if it grows 10%+, the sector is fine.' },
  ],
  caps: [
    {
      cap: 'Small Cap',
      index: 'Russell 2000',
      verdict: 'STABILIZES — But No Rally',
      thesis: 'In muddle-through, small caps stop bleeding but don\'t rally. The floating-rate debt burden persists but doesn\'t worsen. Default rates stabilize at 3% (elevated but not crisis). The sector trades at 12x forward — cheap on absolute terms but cheap for a reason. The relative underperformance vs. large caps continues but the gap narrows from -15% to -8%.',
      keyRisk: 'Earnings revisions finally catch down to reality. If small-cap EPS estimates fall 10-15%, the "cheap" multiple becomes expensive.',
      keyCatalyst: 'Rate cut signal from Fed. Even a hint that the hiking cycle is done sends small caps +10% on relief rally.',
    },
    {
      cap: 'Mid Cap',
      index: 'S&P MidCap 400',
      verdict: 'SELECTIVE OPPORTUNITY',
      thesis: 'Muddle-through is the mid-cap opportunity scenario. The sector has been punished indiscriminately but quality mid-caps with pricing power, low leverage, and secular growth themes are mispriced at 14x. M&A activity picks up as strategic buyers use strong balance sheets to acquire. The mid-cap index returns 8-12% but with wide dispersion — top quartile +25%, bottom quartile -10%.',
      keyRisk: 'If the "muddle" turns to "stall" (growth below 1%), mid-caps have less defensive characteristics than large caps and sell off harder.',
      keyCatalyst: 'Active manager rotation. Mid-caps are under-owned by institutions — any improvement in sentiment triggers flow-driven buying. Watch for active share increasing.',
    },
    {
      cap: 'Large Cap',
      index: 'S&P 500 (Top 100)',
      verdict: 'GRINDS HIGHER — Low Volatility',
      thesis: 'This is the base case for large caps: earnings grow 8-12%, multiples hold (not expand), total return 10-14%. The AI monetization cycle provides upside surprise potential. The risk is complacency — at 21x with 5% risk-free, any shock (geopolitical, credit, earnings miss) triggers a sharp correction. But in muddle-through, the shocks don\'t materialize. The S&P 500 reaches 8,000-8,200 by mid-2027.',
      keyRisk: 'Complacency positioning: hedge fund gross leverage is elevated, put/call ratio low. The market is positioned for "nothing goes wrong" — which is exactly when something does.',
      keyCatalyst: 'Earnings breadth. If the S&P 500 equal-weight index catches up to cap-weight, the rally becomes more sustainable. Watch RSP/SPY ratio as the health indicator.',
    },
  ],
  summary: 'Muddle-through is the "stock-picker\'s market." Index returns are modest (8-12%) but dispersion is high. Financials and quality large-caps lead. Small caps stabilize but don\'t rally. The risk is not a crash but complacency — the market is pricing "nothing breaks" which is a fragile equilibrium.',
};

// ==================== PART 3: SCENARIO B (Fiscal Meltdown) ====================
export const soWhat_Part3: SoWhatData = {
  sectors: [
    { sector: 'Energy', ticker: 'XLE', direction: 'BULLISH', magnitude: 'MED', rationale: 'Energy is the one sector that benefits from fiscal chaos: real assets reprice higher as the dollar weakens and inflation expectations spike. Oil stays elevated on supply concerns. The sector is a hedge against the scenario itself.' },
    { sector: 'Financials', ticker: 'XLF', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'This is the nightmare scenario for banks: AOCI losses explode as 10y goes to 5.5%+ (AFS unrealized losses expand $400B+), credit spreads widen on HY blowout, and the basis trade unwind creates counterparty risk. Regional banks face deposit outflows (SVB 2.0 dynamics). The Fed may need emergency liquidity facilities. Financials drawdown -15 to -25%.' },
    { sector: 'Technology', ticker: 'XLK', direction: 'BEARISH', magnitude: 'HIGH', rationale: '10y at 5.5%+ is a 20%+ present-value haircut on long-duration growth. The AI capex cycle faces scrutiny as cost of capital spikes. Mega-caps with cash are relatively protected but the multiple compression is indiscriminate. Sector drawdown -15 to -20%.' },
    { sector: 'Real Estate', ticker: 'XLRE', direction: 'BEARISH', magnitude: 'HIGH', rationale: '30y mortgage at 8%+ freezes the market completely. REITs face a dual crisis: property values mark down AND refinancing becomes impossible at current spreads. CMBS market dislocates. Sector drawdown -20 to -30%. This is 2022 all over again but worse.' },
    { sector: 'Utilities', ticker: 'XLU', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Bond proxy gets hammered as 10y goes to 5.5%+. The AI power demand narrative doesn\'t offset a 15% valuation compression. Regulated returns face political pressure as rates spike. Sector drawdown -12 to -18%.' },
    { sector: 'Consumer Staples', ticker: 'XLP', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Defensive characteristics limit downside but don\'t prevent it. Inflation in input costs pressures margins. The sector drawdowns -5 to -8% — the least bad in a universal sell-off. Relative outperformance is the only victory.' },
    { sector: 'Health Care', ticker: 'XLV', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Rate-insensitive earnings provide ballast. The sector drawdowns -5 to -10%. In a fiscal crisis, health care spending is non-discretionary. Defensive rotation provides support.' },
    { sector: 'Industrials', ticker: 'XLI', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'If the fiscal meltdown triggers a growth scare (Scenario B bleeds into C), industrial orders cancel, margins compress, and the sector de-rates. Defense spending is the only bright spot. Sector drawdown -12 to -18%.' },
    { sector: 'Materials', ticker: 'XLB', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Global growth fears crush commodity demand. China exposure is a liability. The sector is a pure cyclical play that loses in a risk-off environment. Drawdown -15 to -20%.' },
    { sector: 'Communication Services', ticker: 'XLC', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Duration sensitivity + ad market contraction in a risk-off environment. The mega-caps (Meta, Google) face 20%+ multiple compression. However, cash generation prevents a true crisis. Drawdown -15 to -20%.' },
    { sector: 'Consumer Discretionary', ticker: 'XLY', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Consumer spending collapses if financial conditions tighten this aggressively. Auto sales crater. Travel/leisure reverses the post-pandemic recovery. The sector is a levered bet on consumer confidence that breaks. Drawdown -18 to -25%.' },
  ],
  caps: [
    {
      cap: 'Small Cap',
      index: 'Russell 2000',
      verdict: 'CRUSHED — Default Cycle Begins',
      thesis: 'Small caps are the most damaged asset class in a fiscal meltdown. The combination of: (a) 30y mortgage at 8%+ destroys housing wealth effect, (b) HY spreads at 480bp+ makes refinancing impossible, (c) bank lending standards tighten as AOCI losses constrain capital. Small-cap default rate spikes to 5-6%. The Russell 2000 drawdowns -25 to -35%. This is the 2008 small-cap experience.',
      keyRisk: 'Contagion: small-cap bank failures (similar to regional banks in 2023) create credit crunch that spreads to mid-caps. The "real economy" impact is severe.',
      keyCatalyst: 'Fed rescue. If the Fed deploys emergency facilities (SRF expansion, bank lending facilities), small caps rally 20%+ on relief. The policy response is the only exit.',
    },
    {
      cap: 'Mid Cap',
      index: 'S&P MidCap 400',
      verdict: 'SEVERE DRAWDOWN — Credit Access Closes',
      thesis: 'Mid-caps face the credit access crisis: HY market frozen (spreads >480bp), bank lending constrained, and the "fallen angel" dynamic as BBB credits downgrade to HY. The mid-cap index drawdowns -18 to -25%. Quality mid-caps with investment-grade ratings and cash balances survive; levered mid-caps face existential refinancing risk. The dispersion is extreme: +10% for quality, -40% for distressed.',
      keyRisk: 'The "missing middle" becomes the "destroyed middle" — passive flows exit, active managers redemptions force selling, and the sector enters a negative feedback loop.',
      keyCatalyst: 'M&A from large-cap acquirers. Strategic buyers with cash and IG ratings acquire quality mid-caps at 6-8x EBITDA. This is the contrarian opportunity of the cycle.',
    },
    {
      cap: 'Large Cap',
      index: 'S&P 500 (Top 100)',
      verdict: 'CORRECTION — But Survives',
      thesis: 'Large caps drawdown -12 to -18% but survive. The balance sheet fortress ($2.4T cash, IG credit access) means this is a valuation crisis, not a solvency crisis. Mega-cap tech corrects 20%+ on multiple compression but the cash generation means buybacks accelerate at lower prices. The S&P 500 drops to 6,800-7,000 before stabilizing. This is a buying opportunity for 12-month forward returns.',
      keyRisk: 'If the fiscal crisis triggers a dollar crisis (foreign buyers strike becomes permanent), even large-cap earnings are at risk from import inflation and margin compression.',
      keyCatalyst: 'Policy response. Treasury buyback program, Fed SLR relief, or issuance shift to bills — any of these calms the market and large caps lead the recovery. The "buy the dip" trade works if policy responds.',
    },
  ],
  summary: 'Fiscal meltdown is a risk-off event where everything sells off except Energy and defensives. Small caps face a default cycle. Mid-caps face a credit access crisis. Large caps correct but survive on balance sheet strength. The policy response (Fed/Treasury) is the key variable — if they act decisively, this is a buying opportunity; if they don\'t, it becomes Scenario C.',
};

// ==================== PART 4: SCENARIO C (Stagflationary Breakage) ====================
export const soWhat_Part4: SoWhatData = {
  sectors: [
    { sector: 'Energy', ticker: 'XLE', direction: 'BULLISH', magnitude: 'HIGH', rationale: 'Energy is THE trade in stagflation. Oil at $110+ on Iran/GCC escalation drives upstream earnings to record levels. The sector is the only place where earnings revisions are strongly positive. XLE outperforms by 20-30% vs. S&P 500. This is 1979 all over again.' },
    { sector: 'Financials', ticker: 'XLF', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Stagflation is the worst macro environment for banks: credit losses spike (growth breaks) while NII compresses (Fed cuts rates). The yield curve bull-steepens but the front-end collapse hurts NII more than the long-end rally helps. Bank earnings fall 20-30%. Regional banks face existential stress.' },
    { sector: 'Technology', ticker: 'XLK', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Growth stocks face the dual headwind of: (a) earnings slowdown (demand destruction) and (b) initially higher rates before Fed cuts. The sector drawdowns -20 to -30% before the Fed pivot provides relief. AI capex gets cut as companies preserve cash. This is the 2000-2002 experience for tech.' },
    { sector: 'Real Estate', ticker: 'XLRE', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Stagflation is existential for real estate: property values fall (demand destruction) while cap rates rise (rate competition). REITs face FFO declines AND multiple compression. The sector drawdowns -25 to -35%. This is 2008 without the recovery.' },
    { sector: 'Utilities', ticker: 'XLU', direction: 'MIXED', magnitude: 'MED', rationale: 'The sector splits: initially sells off with rates but then rallies as a defensive haven once the Fed cuts. The AI power demand theme provides a floor. Net: volatile but ends positive as the flight-to-quality trade dominates. Drawdown then recovery: -8% then +12%.' },
    { sector: 'Consumer Staples', ticker: 'XLP', direction: 'BULLISH', magnitude: 'MED', rationale: 'Stagflation is the classic environment for staples outperformance. Pricing power in essential goods. The sector rallies +10-15% as investors rotate to safety. This is the 1970s playbook — P&G, Coca-Cola, Walmart win.' },
    { sector: 'Health Care', ticker: 'XLV', direction: 'BULLISH', magnitude: 'MED', rationale: 'Defensive sector benefits from rotation. Health care spending is non-discretionary. Pharma earnings are rate-insensitive. The sector rallies +8-12% as a safety trade. GLP-1 spending shift is a tailwind for manufacturers.' },
    { sector: 'Industrials', ticker: 'XLI', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Stagflation destroys industrial earnings: input costs spike (energy) while demand falls (growth breaks). Orders cancel, margins compress, guidance gets withdrawn. The sector drawdowns -18 to -25%. Defense is the only sub-sector that holds.' },
    { sector: 'Materials', ticker: 'XLB', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Demand destruction crushes commodity prices (ex-energy). Chemicals, metals, and building materials face volume declines and margin compression. The sector drawdowns -20 to -28%. China exposure is a liability as global trade contracts.' },
    { sector: 'Communication Services', ticker: 'XLC', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Ad spending collapses in a recession. Duration sensitivity adds to the pain. The sector drawdowns -20 to -28%. However, mega-cap cash generation means this is a buying opportunity at 12-14x forward — the cheapest these names have been since 2016.' },
    { sector: 'Consumer Discretionary', ticker: 'XLY', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'The consumer breaks. Spending shifts entirely to necessities. Auto sales collapse (9%+ financing + recession). Travel/leisure reverses. Luxury holds up (wealth effect for top 10%) but mass-market discretionary is devastated. Sector drawdown -25 to -35%.' },
  ],
  caps: [
    {
      cap: 'Small Cap',
      index: 'Russell 2000',
      verdict: 'DEVASTATED — 2008 Redux',
      thesis: 'Small caps face the perfect storm: floating-rate debt becomes unserviceable as SOFR initially spikes before Fed cuts, earnings collapse in a recession, and credit markets freeze. The Russell 2000 drawdowns -35 to -45%. Default rates hit 7-8%. This is the 2008 small-cap experience where RUT fell 50%+ from peak. The recovery takes 3+ years.',
      keyRisk: 'Systemic contagion: small-cap bank failures create a credit crunch that spreads to the real economy. The "financial accelerator" kicks in — credit destruction amplifies the downturn.',
      keyCatalyst: 'Aggressive Fed easing (100bp+ of cuts) + fiscal stimulus. The recovery in small caps is violent when it comes — +60-80% in 12 months off the bottom. But getting to the bottom is painful.',
    },
    {
      cap: 'Mid Cap',
      index: 'S&P MidCap 400',
      verdict: 'SEVERE — Credit Crisis',
      thesis: 'Mid-caps face a credit crisis: HY market frozen, fallen angels cascade from IG to HY, and bank lending contracts. The mid-cap index drawdowns -25 to -35%. Quality mid-caps with IG ratings and cash survive; levered names face restructuring. The dispersion is extreme: +5% for fortress balance sheets, -50% for overlevered companies.',
      keyRisk: 'The "death spiral": falling equity → covenant breaches → forced equity raises → more dilution → lower equity. Mid-caps with maintenance covenants are most vulnerable.',
      keyCatalyst: 'Distressed M&A and Fed facilities. Large-cap acquirers buy quality mid-caps at 5-7x EBITDA. Fed corporate credit facilities (13(3)) provide backstop. The recovery is led by quality.',
    },
    {
      cap: 'Large Cap',
      index: 'S&P 500 (Top 100)',
      verdict: 'BEAR MARKET — But Survives',
      thesis: 'Large caps enter a bear market (-20%+) but survive on balance sheet strength. The S&P 500 drawdowns -18 to -25% before the Fed pivot provides a floor. Mega-cap tech leads the decline (multiple compression + earnings cuts) but mega-cap cash generation means buybacks accelerate at lower prices. The S&P 500 troughs at 5,800-6,200 before recovering. This is 2001-2002: painful but not 2008.',
      keyRisk: 'If stagflation persists (Fed can\'t cut because inflation stays high), the bear market extends. The 1970s experience shows multiple bear markets within a secular stagnation. The risk is not one crash but a grinding decline.',
      keyCatalyst: 'Fed credibility restoration. If the new Fed Chair (or Warsh) commits to a clear framework (inflation target + employment mandate balance), markets stabilize. Policy clarity is the exit from stagflation.',
    },
  ],
  summary: 'Stagflation is the worst macro environment for equities. Energy and staples outperform massively. Everything else sells off. Small caps face a 2008-style default cycle. Mid-caps face a credit crisis. Large caps enter a bear market but survive on balance sheet strength. The ONLY trade is long Energy, long Staples, short everything else. The policy response determines whether this is a 12-month bear market or a 3-year 1970s-style grinding decline.',
};

// ==================== PART 5: SYNTHESIS ====================
export const soWhat_Part5: SoWhatData = {
  sectors: [
    { sector: 'Energy', ticker: 'XLE', direction: 'BULLISH', magnitude: 'MED', rationale: 'Trade expression: Long XLE as a hedge against Scenarios B and C. In Scenario A, energy is flat-to-positive. The sector has positive skew across all scenarios — the only sector where this is true. Carry via 3.5% dividend yield.' },
    { sector: 'Financials', ticker: 'XLF', direction: 'MIXED', magnitude: 'MED', rationale: 'Trade expression: Long financials in Scenario A (NII peak), short in Scenario B/C (credit crisis). The sector is a scenario-dependent trade. Express via XLF calls in A, puts in B/C. The swap spread trade (long 10y swap spread) is a purer expression of the fiscal risk.' },
    { sector: 'Technology', ticker: 'XLK', direction: 'BEARISH', magnitude: 'MED', rationale: 'Trade expression: Short XLK via put spreads as a hedge. The sector is negatively exposed to all scenarios except A (where it\'s flat). The duration sensitivity means any rate spike is a short. However, mega-cap cash generation limits downside — express via put spreads, not outright shorts.' },
    { sector: 'Real Estate', ticker: 'XLRE', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Trade expression: Short XLRE outright. The sector is negatively exposed to ALL scenarios — even in A (muddle-through), rates stay too high for re-rating. The 30y mortgage at 7%+ is a structural headwind. This is the clearest short in the market.' },
    { sector: 'Utilities', ticker: 'XLU', direction: 'BEARISH', magnitude: 'LOW', rationale: 'Trade expression: Short XLU as a rates hedge. The sector is a bond proxy — if you\'re bearish on duration, short utilities. However, the AI power demand theme provides a floor. Express via put spreads to limit upside risk.' },
    { sector: 'Consumer Staples', ticker: 'XLP', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Trade expression: Long XLP as a portfolio hedge. The sector outperforms in B and C (defensive rotation) and is roughly flat in A. Low beta, high dividend — a ballast position. Not a return driver but a risk reducer.' },
    { sector: 'Health Care', ticker: 'XLV', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Trade expression: Long XLV as a diversifier. Rate-insensitive earnings, defensive characteristics, GLP-1 tailwind. The sector is a portfolio stabilizer — low correlation to rates and growth. Add on drawdowns.' },
    { sector: 'Industrials', ticker: 'XLI', direction: 'MIXED', magnitude: 'MED', rationale: 'Trade expression: Long XLI in Scenario A (growth holds), short in B/C (demand destruction). The sector is a pure growth bet. Express via S&P 500 equal-weight (RSP) as a proxy for broadening — if RSP outperforms SPY, industrials are leading.' },
    { sector: 'Materials', ticker: 'XLB', direction: 'BEARISH', magnitude: 'MED', rationale: 'Trade expression: Short XLB as a global growth hedge. The sector is negatively exposed to growth slowdown in all scenarios except A (where it\'s flat). China exposure is a liability. Express via put spreads.' },
    { sector: 'Communication Services', ticker: 'XLC', direction: 'BEARISH', magnitude: 'MED', rationale: 'Trade expression: Short XLC via put spreads. Duration sensitivity + ad market cyclicality. However, mega-cap cash generation limits downside — this is a hedge, not a conviction short. The risk/reward is better in XLK for the same trade.' },
    { sector: 'Consumer Discretionary', ticker: 'XLY', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Trade expression: Short XLY as a consumer hedge. The sector is negatively exposed to all scenarios except A (where it\'s flat). The 7%+ mortgage rate is a structural headwind. Express via put spreads or inverse ETFs for portfolio protection.' },
  ],
  caps: [
    {
      cap: 'Small Cap',
      index: 'Russell 2000',
      verdict: 'STRUCTURAL SHORT — Wait for Fed Pivot',
      thesis: 'Trade expression: Short RUT as a structural position until the Fed pivots. The floating-rate debt burden is a headwind in all scenarios except C (where the Fed cuts aggressively). The relative underperformance vs. large caps is 15% YTD and likely extends to 20-25% before reversal. The trade: short RUT vs. long SPY (relative value). Exit when Fed cuts 50bp+.',
      keyRisk: 'Fed pivot happens faster than expected. Small caps have 2.0x beta to rate cuts — a 50bp cut = +15% rally. The short gets squeezed. Use stop-losses at RUT 2,200.',
      keyCatalyst: 'Fed pivot. The moment the Fed signals a cutting cycle, flip the trade to long RUT. Small caps are a coiled spring — the more they\'ve been punished, the bigger the rally.',
    },
    {
      cap: 'Mid Cap',
      index: 'S&P MidCap 400',
      verdict: 'STOCK-PICKER\'S MARKET — Long Quality, Short Zombies',
      thesis: 'Trade expression: Long a basket of quality mid-caps (IG-rated, <2x leverage, >15% ROIC) vs. short a basket of zombie mid-caps (HY-rated, >5x leverage, <5% ROIC). The dispersion in Scenario A is +25% for quality vs. -10% for zombies. In B/C, quality is flat while zombies are -40%. The long/short captures the dispersion regardless of scenario.',
      keyRisk: 'Correlation spike in B/C — everything sells off together and the long/short compresses. Use DV01-neutral sizing and stop-losses at 2x historical vol.',
      keyCatalyst: 'M&A activity. Quality mid-caps get acquired at premium; zombies get avoided. The M&A cycle is the catalyst for quality mid-cap outperformance.',
    },
    {
      cap: 'Large Cap',
      index: 'S&P 500 (Top 100)',
      verdict: 'CORE HOLDING — But Hedge Concentration',
      thesis: 'Trade expression: Long SPY as core allocation but buy S&P 500 put spreads as concentration hedge. The top 10 names are 35% of the index — if any mega-cap misses, the index drops 5%+ regardless of breadth. The hedge: buy 5% OTM puts on SPY (3-month expiry, roll quarterly). Cost: ~1.5% annualized drag. Protection: -10% drawdown insurance.',
      keyRisk: 'Hedge cost drags returns in Scenario A (where the market grinds higher). The 1.5% annual drag is the cost of insurance. Accept it as portfolio insurance.',
      keyCatalyst: 'Broadening. If equal-weight S&P (RSP) catches up to cap-weight (SPY), remove the hedge — it means the concentration risk is dissipating. Watch RSP/SPY ratio.',
    },
  ],
  summary: 'The synthesis trade book: Long Energy (positive skew), Short Real Estate (universal headwind), Short Small Caps (until Fed pivot), Long Quality Mid-Caps vs. Short Zombie Mid-Caps (dispersion trade), Long SPY with put spread hedge (concentration insurance). The portfolio is designed to be scenario-robust: positive in A, hedged in B, and positioned for the policy response in C.',
};

// ==================== PART 6: INSTITUTION LENS ====================
export const soWhat_Part6: SoWhatData = {
  sectors: [
    { sector: 'Energy', ticker: 'XLE', direction: 'BULLISH', magnitude: 'MED', rationale: 'Bank treasury impact: Energy sector clients benefit from higher oil — loan demand from E&P companies increases, covenant headrooms improve. The bank\'s energy portfolio credit quality improves. Positive for credit loss provisioning. However, concentration risk: if the bank has >5% energy exposure, a price crash (Scenario A normalization) creates concentration losses.' },
    { sector: 'Financials', ticker: 'XLF', direction: 'MIXED', magnitude: 'HIGH', rationale: 'This is the bank\'s own sector. The impact is direct: AOCI losses on the securities portfolio, NII sensitivity to curve shape, credit loss provisioning on commercial loans. In Scenario B, the bank\'s own stock sells off -20%+ creating a negative feedback loop (capital market access, depositor confidence). The treasury must manage the bank\'s own equity as a risk factor.' },
    { sector: 'Technology', ticker: 'XLK', direction: 'BEARISH', magnitude: 'MED', rationale: 'Bank treasury impact: Tech sector clients face valuation compression — venture capital portfolio marks decline, IPO pipeline freezes, and tech company deposit balances may decline (cash burn at higher rates). The bank\'s venture debt portfolio and tech-focused lending faces credit deterioration. However, mega-cap tech clients remain strong borrowers.' },
    { sector: 'Real Estate', ticker: 'XLRE', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'This is the critical sector for a mortgage-servicing bank. CRE exposure (construction loans, commercial mortgages) faces mark-downs as cap rates rise. Residential mortgage servicing faces prepayment slowdown (positive for MSR value) but escrow shortfalls increase. The bank\'s own CRE portfolio may need loss provisioning. This is the sector that keeps the CFO up at night.' },
    { sector: 'Utilities', ticker: 'XLU', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Bank treasury impact: Utility clients are stable borrowers — regulated returns provide earnings visibility. The bank\'s utility lending portfolio is low-risk. However, utility clients may delay capex projects if financing costs spike, reducing loan demand. Net: neutral to slightly negative for loan growth.' },
    { sector: 'Consumer Staples', ticker: 'XLP', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Bank treasury impact: Consumer staples clients are stable borrowers with pricing power. The bank\'s lending to this sector is low-risk. No significant impact on credit quality or loan demand. A ballast sector for the bank\'s portfolio.' },
    { sector: 'Health Care', ticker: 'XLV', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Bank treasury impact: Health care clients are stable borrowers — non-discretionary spending provides earnings visibility. The bank\'s health care lending (hospitals, pharma, devices) is low-risk. No significant impact on credit quality. A defensive sector for the loan portfolio.' },
    { sector: 'Industrials', ticker: 'XLI', direction: 'MIXED', magnitude: 'MED', rationale: 'Bank treasury impact: Industrial clients face input cost inflation and demand uncertainty. The bank\'s lending to cyclicals (manufacturing, transport) faces credit deterioration in B/C scenarios. However, infrastructure and defense clients benefit from government spending. The sector requires active credit monitoring.' },
    { sector: 'Materials', ticker: 'XLB', direction: 'BEARISH', magnitude: 'MED', rationale: 'Bank treasury impact: Materials clients face demand destruction and margin compression. The bank\'s lending to chemicals, metals, and building materials faces credit deterioration. Covenant breaches increase. The sector requires proactive workout capacity and loss provisioning.' },
    { sector: 'Communication Services', ticker: 'XLC', direction: 'BEARISH', magnitude: 'LOW', rationale: 'Bank treasury impact: Communication services clients (media, telecom) face ad market weakness and duration sensitivity. However, mega-cap clients (Meta, Google) have strong balance sheets. The bank\'s lending to this sector is concentrated in investment-grade names — low credit risk but reduced loan demand as clients use internal cash.' },
    { sector: 'Consumer Discretionary', ticker: 'XLY', direction: 'BEARISH', magnitude: 'HIGH', rationale: 'Bank treasury impact: Consumer discretionary clients face spending destruction. The bank\'s lending to retail, auto, and leisure faces credit deterioration. Auto lending portfolios face higher losses as financing costs crush consumers. The sector requires increased loss provisioning and workout capacity. This is a leading indicator for the bank\'s own credit quality.' },
  ],
  caps: [
    {
      cap: 'Small Cap',
      index: 'Russell 2000',
      verdict: 'CREDIT RISK — Increase Loss Provisions',
      thesis: 'Bank treasury action: Increase loss provisions on small-cap lending portfolio by 50-100bp. The floating-rate debt burden creates a default cycle — the bank\'s small-cap commercial loans and venture debt portfolio face 5-6% default rates (vs. current 1.8%). Tighten underwriting standards: require 2.5x+ interest coverage, limit floating-rate exposure. Reduce new originations to small-cap borrowers.',
      keyRisk: 'Over-provisioning: if the Fed pivots quickly, the bank has over-reserved and earnings take a hit. However, under-provisioning is the greater risk — regulatory scrutiny on credit quality is intense in a downturn.',
      keyCatalyst: 'Fed pivot signal. The moment the Fed signals cuts, reduce provisions and resume lending to quality small-caps. The first mover in lending recovers gets the best borrowers.',
    },
    {
      cap: 'Mid Cap',
      index: 'S&P MidCap 400',
      verdict: 'SELECTIVE — Quality Only',
      thesis: 'Bank treasury action: Lend only to quality mid-caps (IG-rated, <3x leverage, >15% ROIC). Avoid zombie mid-caps entirely. The bank\'s mid-cap lending portfolio should shift toward investment-grade names with strong balance sheets. Price loans to reflect credit risk: +200-300bp over SOFR for quality, +500bp+ for speculative. The margin is there but the risk selection is critical.',
      keyRisk: 'Missing M&A opportunities: quality mid-caps get acquired, and the bank loses relationship revenue. However, the credit risk of lending to overlevered mid-caps is worse than the opportunity cost of missing M&A.',
      keyCatalyst: 'M&A activity from large-cap acquirers. The bank should position as the advisor/financier for strategic acquisitions of quality mid-caps. This is relationship revenue, not credit risk.',
    },
    {
      cap: 'Large Cap',
      index: 'S&P 500 (Top 100)',
      verdict: 'CORE RELATIONSHIP — Deepen Engagement',
      thesis: 'Bank treasury action: Deepen relationships with large-cap clients. These are the bank\'s safest, most profitable borrowers — IG-rated, massive cash balances, global operations. Offer treasury management, FX hedging, and M&A advisory. The bank\'s large-cap lending portfolio is the fortress — protect it with relationship depth. In a downturn, these clients are the last to default and the first to recover.',
      keyRisk: 'Competition: every bank wants the same large-cap clients. Margins compress as banks compete for safe borrowers. The bank must differentiate on service, not price.',
      keyCatalyst: 'Large-cap M&A activity. If mega-cap tech acquires mid-caps, the bank earns advisory fees and financing revenue. Position as the go-to advisor for large-cap strategic acquisitions.',
    },
  ],
  summary: 'For a mortgage-servicing bank treasury, the "So-What" is: (1) Increase loss provisions on small-cap and consumer discretionary lending, (2) Shift HQLA to shorter duration to manage AOCI, (3) Deepen large-cap relationships as the fortress portfolio, (4) Avoid zombie mid-caps entirely, (5) Position for M&A advisory revenue from large-cap acquirers. The bank\'s own credit quality is a leading indicator — if small-cap and consumer discretionary loans start defaulting, the downturn is real.',
};

// ==================== APPENDIX: EXOTIC ====================
export const soWhat_Appendix: SoWhatData = {
  sectors: [
    { sector: 'Energy', ticker: 'XLE', direction: 'BULLISH', magnitude: 'MED', rationale: 'Second-order effect from Middle East shipping disruption: higher shipping costs → higher energy costs for producers → but also higher realized prices for oil. The net effect is positive for upstream producers (pricing power) but negative for refiners (input costs). The sector benefits from the disruption but the dispersion within the sector increases.' },
    { sector: 'Financials', ticker: 'XLF', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Second-order effects are minimal for financials. The exotic signals don\'t directly impact bank earnings. However, if AI data-center power demand drives utility rate cases, the bank\'s utility lending portfolio benefits from increased capex financing demand. A minor positive for loan growth.' },
    { sector: 'Technology', ticker: 'XLK', direction: 'BULLISH', magnitude: 'MED', rationale: 'AI data-center power demand is a tailwind for tech infrastructure: semis (power management chips), cloud (hyperscaler capex), and utilities (power generation). The exotic signal suggests AI capex is more durable than consensus expects. This is bullish for the AI infrastructure supply chain — NVDA, AVGO, EQIX.' },
    { sector: 'Real Estate', ticker: 'XLRE', direction: 'MIXED', magnitude: 'MED', rationale: 'AI data-center demand creates a sub-sector winner: data center REITs (EQIX, DLR) benefit from hyperscaler leasing. However, traditional office and retail REITs face headwinds from rates. The exotic signal creates dispersion within the sector — data centers outperform, everything else underperforms.' },
    { sector: 'Utilities', ticker: 'XLU', direction: 'BULLISH', magnitude: 'MED', rationale: 'The exotic signal is directly bullish for utilities: AI data-center power demand → utility rate cases → higher allowed returns → earnings growth. The sector benefits from the secular AI theme. This offsets the rate headwind. The net effect is positive for utilities with data-center exposure (VST, NRG, CEG).' },
    { sector: 'Consumer Staples', ticker: 'XLP', direction: 'BEARISH', magnitude: 'LOW', rationale: 'Second-order effect: higher shipping costs → higher goods prices → consumer staples face input cost inflation. If the cost pass-through lags (competitive pressure), margins compress. The exotic signal suggests goods inflation is a 3-4 month lag — a headwind for staples margins in Q4 2026 / Q1 2027.' },
    { sector: 'Health Care', ticker: 'XLV', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Minimal second-order effects from the exotic signals. Health care is insulated from shipping costs and AI power demand. The sector trades on fundamentals (GLP-1, aging demographics) not macro transmission chains.' },
    { sector: 'Industrials', ticker: 'XLI', direction: 'MIXED', magnitude: 'MED', rationale: 'AI data-center buildout is a tailwind for electrical infrastructure industrials (ETN, EMR, POWL) — power distribution, transformers, switchgear. These companies have multi-year order books from hyperscaler capex. However, shipping cost inflation is a headwind for transportation sub-sector. The exotic signal creates dispersion: electrical infrastructure outperforms, transport underperforms.' },
    { sector: 'Materials', ticker: 'XLB', direction: 'MIXED', magnitude: 'MED', rationale: 'AI data-center buildout requires copper, steel, and concrete — a tailwind for materials demand. However, shipping cost inflation increases input costs for producers. The net effect depends on pricing power: companies that can pass through costs benefit (copper miners), companies that can\'t suffer (chemicals). The exotic signal suggests metals outperform chemicals.' },
    { sector: 'Communication Services', ticker: 'XLC', direction: 'NEUTRAL', magnitude: 'LOW', rationale: 'Minimal second-order effects. Communication services companies are the beneficiaries of AI (ad targeting, cloud services) but the exotic signals about power demand and shipping don\'t directly impact their earnings. The sector trades on its own fundamentals.' },
    { sector: 'Consumer Discretionary', ticker: 'XLY', direction: 'BEARISH', magnitude: 'MED', rationale: 'Second-order effect: higher shipping costs → higher goods prices → consumer spending shifts from goods to services. Retail discretionary (goods-heavy) underperforms vs. services discretionary (travel, entertainment). The exotic signal suggests goods inflation is a headwind for retail margins and consumer spending. Amazon is the swing factor — if it absorbs costs, the sector holds; if it passes through, the sector sells off.' },
  ],
  caps: [
    {
      cap: 'Small Cap',
      index: 'Russell 2000',
      verdict: 'NEGLECTED — No Exotic Tailwind',
      thesis: 'The exotic signals don\'t help small caps. AI data-center demand benefits large-cap tech infrastructure (semis, cloud), not small-cap companies. Shipping cost inflation hurts small-cap manufacturers who lack pricing power. The exotic signals reinforce the structural headwinds for small caps — they\'re not part of the AI theme and they\'re exposed to goods inflation. The relative underperformance extends.',
      keyRisk: 'A small-cap company that\'s a hidden beneficiary of AI infrastructure (e.g., a niche electrical components supplier) could surprise to the upside. But these are stock-specific, not sector-level.',
      keyCatalyst: 'Fed pivot. The exotic signals don\'t change the small-cap thesis — only Fed policy does. Wait for the pivot before adding small-cap exposure.',
    },
    {
      cap: 'Mid Cap',
      index: 'S&P MidCap 400',
      verdict: 'SELECTIVE — AI Infrastructure Winners',
      thesis: 'The exotic signals identify mid-cap winners: electrical infrastructure companies (power distribution, transformers) that are suppliers to AI data-center buildout. These mid-caps have multi-year order books and pricing power. The trade: long a basket of mid-cap electrical infrastructure names (ETN is large-cap but EMR, POWL, AZZ are mid-cap). The exotic signal suggests this trade has 12-18 month duration as data-center buildout continues.',
      keyRisk: 'Valuation: these names have already rallied 30-50% on the AI theme. The risk is a correction if hyperscaler capex slows or if permitting delays push out projects. Use pullbacks to add.',
      keyCatalyst: 'Hyperscaler capex announcements. If MSFT, GOOG, META announce increased 2027 capex guidance, the mid-cap electrical infrastructure names rally. Watch earnings calls for capex commentary.',
    },
    {
      cap: 'Large Cap',
      index: 'S&P 500 (Top 100)',
      verdict: 'AI INFRASTRUCTURE — The Exotic Tailwind',
      thesis: 'The exotic signals are directly bullish for large-cap AI infrastructure: NVDA (GPUs), AVGO (networking), EQIX (data centers), VST/CEG (power generation). These large-caps are the primary beneficiaries of AI data-center buildout and the associated power demand. The exotic signal suggests the AI capex cycle is more durable than consensus — these names re-rate higher as the market realizes the duration of the theme. Add on pullbacks.',
      keyRisk: 'Regulatory risk: if AI faces regulatory backlash (antitrust, safety concerns), the capex cycle slows and these names correct. The risk is low probability but high impact. Hedge with put spreads.',
      keyCatalyst: 'Hyperscaler earnings. If MSFT, GOOG, META report Q4 earnings with strong AI revenue growth and increased 2027 capex guidance, the large-cap AI infrastructure names rally. This is the catalyst that validates the exotic signal.',
    },
  ],
  summary: 'The exotic signals create sector dispersion: AI infrastructure (tech, utilities, electrical industrials) benefits from data-center power demand; shipping cost inflation hurts goods-heavy sectors (retail, chemicals). The signals don\'t change the macro thesis but they identify stock-level opportunities within sectors. For market cap: large-cap AI infrastructure is the beneficiary; mid-cap electrical suppliers are the hidden winners; small caps are left out. The trade: long large-cap AI infrastructure, long mid-cap electrical suppliers, short small-cap goods producers.',
};

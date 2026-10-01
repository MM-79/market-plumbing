// ============================================================================
// Source registry.
//
// One entry per series the framework quotes. Everything here is a FREE, PUBLIC
// endpoint that needs no API key, because a pipeline that needs a secret to run
// is a pipeline that stops running the first time a token expires.
//
// FRED is read through the public CSV endpoint by default. If FRED_API_KEY is
// present in the environment the fetcher uses the documented JSON API instead,
// which is politer and better rate-limited. Both paths produce identical
// output, so the key is an optimisation, never a requirement.
//
// `staleAfterDays` is the series' own publication cadence plus its lag, not a
// guess. Daily market data gets 4 (covers a long weekend), weekly gets 10.
//
// Monthly and quarterly series need more care, and getting this wrong is why a
// naive pipeline reports half its own data as permanently stale. FRED dates a
// periodic observation to the START of the period it describes: July core PCE,
// published in late August, carries asOf 2026-07-01 and is already ~55 days
// "old" on the day it lands. So the threshold must cover period length PLUS
// publication lag PLUS a buffer - 70-75 days monthly, 220 quarterly. Those
// series carry `periodDated: true` so the UI can explain the gap rather than
// implying somebody forgot to press refresh.
// ============================================================================

/** @typedef {'pct'|'bp'|'usd_bn'|'usd_tn'|'index'|'count'|'ratio'} Unit */

// --------------------------------------------------------------- FRED ------

/**
 * FRED series. `scale` converts the published unit into the framework's unit:
 * ICE BofA OAS publishes in percent and we quote basis points, WRESBAL
 * publishes in millions and we quote trillions, and so on. Getting these wrong
 * is the most likely failure mode of the whole pipeline, so each one states the
 * published unit it is converting FROM.
 */
export const FRED_SERIES = [
  // --- curve -------------------------------------------------------------
  { key: 'y2',  id: 'DGS2',  unit: 'pct', staleAfterDays: 4, history: 'long', label: '2y par yield' },
  { key: 'y5',  id: 'DGS5',  unit: 'pct', staleAfterDays: 4, history: 'long', label: '5y par yield' },
  { key: 'y10', id: 'DGS10', unit: 'pct', staleAfterDays: 4, history: 'long', label: '10y par yield' },
  { key: 'y30', id: 'DGS30', unit: 'pct', staleAfterDays: 4, history: 'long', label: '30y par yield' },
  { key: 'y3m', id: 'DGS3MO', unit: 'pct', staleAfterDays: 4, label: '3m bill yield' },

  // --- real yields and inflation compensation ----------------------------
  { key: 'tips10y', id: 'DFII10', unit: 'pct', staleAfterDays: 4, history: 'long', label: '10y TIPS real yield' },
  { key: 'tips5y',  id: 'DFII5',  unit: 'pct', staleAfterDays: 4, label: '5y TIPS real yield' },
  { key: 'bei10y',  id: 'T10YIE', unit: 'pct', staleAfterDays: 4, history: 'long', label: '10y breakeven' },
  { key: 'bei5y5y', id: 'T5YIFR', unit: 'pct', staleAfterDays: 4, history: 'long', label: '5y5y forward breakeven' },

  // --- policy -------------------------------------------------------------
  { key: 'effr', id: 'DFF',  unit: 'pct', staleAfterDays: 4, label: 'Effective fed funds' },
  { key: 'iorb', id: 'IORB', unit: 'pct', staleAfterDays: 4, label: 'Interest on reserve balances' },

  // --- term premium -------------------------------------------------------
  // Kim-Wright is the only term premium model with a free machine-readable
  // feed. ACM is published as an XLS and stays manual - which is fortunate,
  // because the disagreement between the two is load-bearing for L2 and having
  // one automated and one manual keeps the comparison honest rather than
  // letting a single model quietly become "the" term premium.
  { key: 'kimWright10y', id: 'THREEFYTP10', unit: 'pct', scale: 100, fromUnit: 'percent', toUnit: 'bp', staleAfterDays: 7, history: 'long', label: 'Kim-Wright 10y term premium' },

  // --- plumbing -----------------------------------------------------------
  { key: 'reserves', id: 'WRESBAL',   unit: 'usd_tn', scale: 1e-6, fromUnit: 'USD millions', toUnit: 'USD trillions', staleAfterDays: 10, label: 'Reserve balances' },
  { key: 'tga',      id: 'WTREGEN',   unit: 'usd_bn', scale: 1e-3, fromUnit: 'USD millions', toUnit: 'USD billions', staleAfterDays: 10, label: 'Treasury General Account' },
  { key: 'onRrp',    id: 'RRPONTSYD', unit: 'usd_bn', staleAfterDays: 4, label: 'ON RRP take-up' },

  // --- credit -------------------------------------------------------------
  { key: 'igOas',  id: 'BAMLC0A0CM',   unit: 'bp', scale: 100, fromUnit: 'percent', toUnit: 'bp', staleAfterDays: 4, label: 'ICE BofA IG OAS' },
  { key: 'hyOas',  id: 'BAMLH0A0HYM2', unit: 'bp', scale: 100, fromUnit: 'percent', toUnit: 'bp', staleAfterDays: 4, label: 'ICE BofA HY OAS' },
  { key: 'bbOas',  id: 'BAMLH0A1HYBB', unit: 'bp', scale: 100, fromUnit: 'percent', toUnit: 'bp', staleAfterDays: 4, label: 'ICE BofA BB OAS' },
  { key: 'cccOas', id: 'BAMLH0A3HYC',  unit: 'bp', scale: 100, fromUnit: 'percent', toUnit: 'bp', staleAfterDays: 4, label: 'ICE BofA CCC & lower OAS' },
  { key: 'igYield', id: 'BAMLC0A0CMEY',   unit: 'pct', staleAfterDays: 4, label: 'IG effective yield' },
  { key: 'hyYield', id: 'BAMLH0A0HYM2EY', unit: 'pct', staleAfterDays: 4, label: 'HY effective yield' },

  // --- mortgage -----------------------------------------------------------
  { key: 'mortgage30y', id: 'MORTGAGE30US', unit: 'pct', staleAfterDays: 10, label: 'Freddie Mac 30y fixed (PMMS)' },

  // --- vol and risk -------------------------------------------------------
  { key: 'vix', id: 'VIXCLS', unit: 'index', staleAfterDays: 4, label: 'CBOE VIX' },

  // --- macro --------------------------------------------------------------
  { key: 'corePceIndex', id: 'PCEPILFE', unit: 'index', staleAfterDays: 75, periodDated: true, label: 'Core PCE price index' },
  { key: 'coreCpiIndex', id: 'CPILFESL', unit: 'index', staleAfterDays: 70, periodDated: true, label: 'Core CPI index' },
  { key: 'payrolls',     id: 'PAYEMS',   unit: 'count', staleAfterDays: 70, periodDated: true, label: 'Nonfarm payrolls (level, thousands)' },
  { key: 'unemployment', id: 'UNRATE',   unit: 'pct',   staleAfterDays: 70, periodDated: true, label: 'Unemployment rate' },
  { key: 'sahm',         id: 'SAHMREALTIME', unit: 'ratio', staleAfterDays: 70, periodDated: true, label: 'Sahm rule recession indicator' },
  { key: 'claims4wk',    id: 'IC4WSA',   unit: 'count', staleAfterDays: 12, label: 'Initial claims, 4-week average' },

  // --- energy -------------------------------------------------------------
  { key: 'wti', id: 'DCOILWTICO', unit: 'index', staleAfterDays: 7, label: 'WTI spot, USD/bbl' },

  // --- fiscal and growth --------------------------------------------------
  { key: 'nominalGdp', id: 'GDP', unit: 'usd_tn', scale: 1e-3, history: 'long', fromUnit: 'USD billions SAAR', toUnit: 'USD trillions', staleAfterDays: 220, periodDated: true, label: 'Nominal GDP (SAAR)' },
  { key: 'netInterestAnnual', id: 'A091RC1Q027SBEA', unit: 'usd_tn', scale: 1e-3, fromUnit: 'USD billions SAAR', toUnit: 'USD trillions', staleAfterDays: 220, periodDated: true, label: 'Federal net interest payments (SAAR)' },

  // --- cross-border -------------------------------------------------------
  { key: 'usdjpy', id: 'DEXJPUS', unit: 'index', staleAfterDays: 7, label: 'USD/JPY' },
];

/**
 * Derived series. Computed from fetched values rather than fetched, so their
 * provenance is the inputs they are built from. Each returns null when an
 * input is missing, which keeps a partial fetch from silently producing a
 * plausible-looking wrong number.
 */
export const DERIVED = {
  /** Annualised 3-month rate of change of a monthly price index. */
  corePce3mSaar: {
    unit: 'pct', staleAfterDays: 75, periodDated: true, label: 'Core PCE 3m annualised',
    inputs: ['corePceIndex'],
    compute: (s) => {
      const h = s.corePceIndex?.history;
      if (!h || h.length < 4) return null;
      const last = h[h.length - 1].value;
      const prior = h[h.length - 4].value;
      return { value: (Math.pow(last / prior, 4) - 1) * 100, asOf: h[h.length - 1].date };
    },
  },
  corePceYoY: {
    unit: 'pct', staleAfterDays: 75, periodDated: true, label: 'Core PCE y/y',
    inputs: ['corePceIndex'],
    compute: (s) => {
      const h = s.corePceIndex?.history;
      if (!h || h.length < 13) return null;
      const last = h[h.length - 1];
      return { value: (last.value / h[h.length - 13].value - 1) * 100, asOf: last.date };
    },
  },
  /** Monthly payroll change, in thousands. PAYEMS is a level. */
  nfpChange: {
    unit: 'count', staleAfterDays: 70, periodDated: true, label: 'Monthly payroll change',
    inputs: ['payrolls'],
    compute: (s) => {
      const h = s.payrolls?.history;
      if (!h || h.length < 2) return null;
      const last = h[h.length - 1];
      return { value: last.value - h[h.length - 2].value, asOf: last.date };
    },
  },
  nfp3mAvg: {
    unit: 'count', staleAfterDays: 70, periodDated: true, label: 'Payroll change, 3m average',
    inputs: ['payrolls'],
    compute: (s) => {
      const h = s.payrolls?.history;
      if (!h || h.length < 4) return null;
      const last = h[h.length - 1];
      return { value: (last.value - h[h.length - 4].value) / 3, asOf: last.date };
    },
  },
  /** Nominal GDP growth - the `g` in the debt-dynamics identity. Nominal, not
   *  real: using real growth here flips the sign of the snowball term and is
   *  the most common error in published sustainability commentary. */
  nominalGrowthYoY: {
    unit: 'pct', staleAfterDays: 220, periodDated: true, label: 'Nominal GDP growth y/y',
    inputs: ['nominalGdp'],
    compute: (s) => {
      const h = s.nominalGdp?.history;
      if (!h || h.length < 5) return null;
      const last = h[h.length - 1];
      return { value: (last.value / h[h.length - 5].value - 1) * 100, asOf: last.date };
    },
  },
  /** The `r` in the identity: the EFFECTIVE rate paid on the stock, which is a
   *  lagging average of past issuance, not the marginal rate on new paper. */
  effectiveDebtRate: {
    unit: 'pct', staleAfterDays: 220, periodDated: true, label: 'Effective rate on debt held by the public',
    inputs: ['netInterestAnnual', 'debtHeldByPublic'],
    compute: (s) => ({
      value: (s.netInterestAnnual.value / s.debtHeldByPublic.value) * 100,
      asOf: s.netInterestAnnual.asOf,
    }),
  },
  /** SOFR less IORB. Positive = funding pressure. */
  sofrMinusIorb: {
    unit: 'bp', staleAfterDays: 4, label: 'SOFR less IORB',
    inputs: ['sofr', 'iorb'],
    compute: (s) => ({ value: (s.sofr.value - s.iorb.value) * 100, asOf: s.sofr.asOf }),
  },
  /** The tail of the SOFR distribution. Distributions widen before medians move. */
  sofrTailWidth: {
    unit: 'bp', staleAfterDays: 4, label: 'SOFR 99th percentile less median',
    inputs: ['sofrP99', 'sofr'],
    compute: (s) => ({ value: (s.sofrP99.value - s.sofr.value) * 100, asOf: s.sofr.asOf }),
  },
  /** CCC minus BB. The dispersion measure L6 leans on. */
  cccMinusBb: {
    unit: 'bp', staleAfterDays: 4, label: 'CCC minus BB OAS',
    inputs: ['cccOas', 'bbOas'],
    compute: (s) => (s.cccOas && s.bbOas)
      ? { value: s.cccOas.value - s.bbOas.value, asOf: s.cccOas.asOf } : null,
  },
  /** The real policy rate. L1's central distinction depends on this. */
  realPolicyRate: {
    unit: 'pct', staleAfterDays: 75, periodDated: true, label: 'Real fed funds (EFFR less core PCE y/y)',
    inputs: ['effr', 'corePceYoY'],
    compute: (s) => (s.effr && s.corePceYoY)
      ? { value: s.effr.value - s.corePceYoY.value, asOf: s.effr.asOf } : null,
  },
};

// ------------------------------------------------- non-FRED endpoints ------

export const NYFED = {
  /**
   * Secured reference rates. We take SOFR and, importantly, its 1st and 99th
   * percentiles - distributions widen before medians move, and in September
   * 2019 the tails were screaming for a fortnight while the average looked
   * immaculate.
   */
  securedRates: 'https://markets.newyorkfed.org/api/rates/secured/all/latest.json',
};

export const FISCALDATA = {
  /** Debt held by the public - the figure that prices, not gross debt. */
  debtToPenny:
    'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date&page%5Bsize%5D=1',
  /** MTS table 5: outlays by function. Net interest is line "Net Interest". */
  mtsOutlays:
    'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5?filter=record_calendar_month:eq:09,record_fiscal_year:eq:2026&page%5Bsize%5D=200',
  /** Operating cash balance - the TGA, daily rather than weekly. */
  operatingCash:
    'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/operating_cash_balance?sort=-record_date&page%5Bsize%5D=10',
};

/**
 * TreasuryDirect auction results. This is the single most valuable non-FRED
 * feed in the pipeline: it gives high yield, bid-to-cover and the full bidder
 * split, which is the entire L2 auction scorecard. Indirect share is computed
 * as indirectBidderAccepted / totalAccepted.
 *
 * The one thing it does NOT give is the when-issued yield at the bid deadline,
 * so the TAIL cannot be computed from this feed alone. We report the auction
 * mechanics that are available and leave the tail as a manual field rather
 * than inventing it - which is a real limitation and is surfaced in the UI.
 */
export const TREASURY_DIRECT = {
  auctioned: (days = 90) =>
    `https://www.treasurydirect.gov/TA_WS/securities/auctioned?format=json&days=${days}`,
  couponTerms: ['2-Year', '3-Year', '5-Year', '7-Year', '10-Year', '20-Year', '30-Year'],
};

/**
 * Fields that cannot be sourced free and stay manual. Listing them here rather
 * than leaving them implicit is the point: the UI reads this array to show
 * exactly which parts of the framework a human still has to maintain.
 */
export const MANUAL_FIELDS = [
  { key: 'acm10y', label: 'ACM 10y term premium', why: 'NY Fed publishes it as an XLS with no machine-readable feed.', where: 'https://www.newyorkfed.org/research/data_indicators/term-premia-tabs' },
  { key: 'move', label: 'MOVE index', why: 'Proprietary to ICE. No free API.', where: 'https://indices.theice.com/' },
  { key: 'swapSpread10y', label: '10y SOFR swap spread', why: 'Requires a swap curve feed. No free source.', where: 'OFR short-term funding monitor, or a dealer run' },
  { key: 'mbsOas', label: 'Agency MBS current-coupon OAS', why: 'Model-dependent and vendor-supplied.', where: 'Dealer run' },
  { key: 'auctionTails', label: 'Coupon auction tails', why: 'Requires the when-issued yield at the bid deadline, which TreasuryDirect does not publish.', where: 'Dealer run, or Bloomberg' },
  { key: 'basisTrade', label: 'Leveraged-fund gross UST futures short', why: 'CFTC TFF is machine-readable but contract-level aggregation across the five UST futures is judgement-heavy; left manual until the aggregation is validated.', where: 'https://publicreporting.cftc.gov/resource/gpe5-46if.json' },
  { key: 'foreignHoldings', label: 'TIC foreign holdings', why: 'Published with a six-week lag as fixed-width text.', where: 'https://home.treasury.gov/data/treasury-international-capital-tic-system' },
];

// ------------------------------------------------- institution lens (P6) ---

/**
 * FDIC BankFind, for the Part 6 institution lens.
 *
 * Part 6 used to describe an invented mortgage-servicing bank with invented
 * balances. That was the last large block of fabricated numbers left in the
 * framework after v3.1, and it survived only because nobody had tried to fetch
 * it. The FDIC publishes every insured depository's quarterly Call Report as
 * free JSON with no key, so there is no excuse.
 *
 * CERT 6560 is The Huntington National Bank: a Columbus, Ohio consumer and
 * commercial super-regional. It is the right worked example for three reasons.
 * Its business mix is genuinely consumer-plus-commercial rather than a
 * monoline. It has just absorbed a large acquisition, so the integration shows
 * up in the data rather than in a footnote. And it crossed $250bn of assets in
 * a single quarter, which drags it from Category IV into Category III
 * supervision - the one balance-sheet event where the rate scenario and the
 * regulatory regime interact, and the thing this section exists to analyse.
 *
 * NOTE ON SCOPE: this is the BANK, not the holding company. Huntington
 * Bancshares Incorporated consolidates slightly differently - holdco debt,
 * non-bank subsidiaries - so these figures will not tie exactly to the 10-Q.
 * The bank is the overwhelming majority of the group and it is the entity that
 * actually holds the deposits, the securities and the regulatory capital, so
 * it is the right lens for a treasury analysis. It is the wrong lens for an
 * equity valuation.
 */
export const FDIC = {
  cert: 6560,
  legalName: 'The Huntington National Bank',
  groupName: 'Huntington Bancshares Incorporated',
  ticker: 'HBAN',
  city: 'Columbus, OH',
  base: 'https://api.fdic.gov/banks/financials',
  profileUrl: 'https://banks.data.fdic.gov/bankfind-suite/bankfind/details/6560',
  quarters: 12,
  /** Call Report fields. Every one is a reported line, not a vendor estimate. */
  fields: [
    'REPDTE',     // report date
    'ASSET', 'DEP', 'LNLSNET', 'CHBAL', 'EQ',
    'SC', 'SCAF', 'SCHA',            // securities: total, AFS, HTM
    'LNCI', 'LNRENRES', 'LNRECONS',  // C&I, nonresidential RE, construction
    'LNAUTO', 'LNCONOTH',            // auto, other consumer
    'LNATRES', 'NTLNLSQ', 'NCLNLS',  // allowance, quarterly net charge-offs, noncurrent
    'P3ASSET', 'P9ASSET',            // past due 30-89, past due 90+
    'RBC1RWAJ', 'RBCT1J',            // CET1 ratio, tier 1 capital
    'NIMY', 'ROA', 'ROE', 'EEFFR', 'NONIXAY',
  ],
};

/**
 * Supervisory category thresholds, in $bn of total assets.
 *
 * These are the tailored-framework categories, and the one that matters for a
 * growing super-regional is the $250bn line: crossing it removes the AOCI
 * opt-out, so unrealised securities losses stop being filtered out of
 * regulatory capital and start counting against CET1 directly. A bank can
 * manage a mark-to-market loss. A bank cannot ignore a capital ratio.
 */
export const SUPERVISORY_THRESHOLDS = {
  categoryIV: 100,
  categoryIII: 250,
  categoryII: 700,
  source: 'Federal Reserve tailoring rule (2019), 12 CFR 252',
};

# Refresh Runbook

Nothing in this framework updates itself. This is the ordered list of pulls that
makes the snapshot true again. Budget 45–60 minutes for a full refresh.

**Run order matters.** The curve anchor comes first because every derived number
on screen is a function of it, and the audit will fail loudly until the scenario
`Today` rows match it.

---

## Before you start

```bash
git -C . checkout -b refresh/YYYY-MM-DD
```

Set `runSettings.priorRunDate` to the **current** `asOfDate` before changing
`asOfDate` to today. The "what changed" table and the `priorProbability` fields
are the only record this framework keeps of its own history — losing them loses
the track record.

---

## Step 1 — The anchor (blocking; everything depends on it)

| # | Pull | Source | Writes to |
|---|---|---|---|
| 1 | 2y, 5y, 10y, 30y par yields | [Treasury par yield curve](https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve) | `parCurve`, `anchor`, `observations.y2/y5/y10/y30` |

Then update the `Today` row of **all four** scenario paths in
`app/src/data/scenarios.ts` (the shared `TODAY` constant). The audit's
`path-t0-*` checks fail until these match to 0.5bp — that failure is the
guardrail, do not work around it.

---

## Step 2 — Policy and the path

| # | Pull | Source | Writes to |
|---|---|---|---|
| 2 | Fed funds target, last decision, vote split, dissents | [FOMC calendar](https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm) | L1 metrics, `observations.fedFundsMid` |
| 3 | SEP median dots (quarterly only) | Same | L1 metrics |
| 4 | Next-meeting and December probabilities | [CME FedWatch](https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html) | L1 metrics |
| 5 | ACM 10y term premium | [NY Fed ACM](https://www.newyorkfed.org/research/data_indicators/term-premia-tabs) | `observations.acm10y`, L2, attribution |
| 6 | Kim-Wright 10y term premium | [FRED THREEFYTP10](https://fred.stlouisfed.org/series/THREEFYTP10) | L2 metrics, model-disagreement line |
| 7 | 10y TIPS real yield, 5y5y breakeven | [FRED DFII10](https://fred.stlouisfed.org/series/DFII10), [T5YIFR](https://fred.stlouisfed.org/series/T5YIFR) | `observations.tips10y`, `bei5y5y` |

> Update the **model-disagreement** figure (ACM minus Kim-Wright) whenever
> either moves. It appears in three places and is load-bearing for the L2
> confidence rating.

---

## Step 3 — Macro

| # | Pull | Source | Writes to |
|---|---|---|---|
| 8 | Core PCE m/m, y/y, 3m SAAR | [BEA](https://www.bea.gov/data/personal-consumption-expenditures-price-index) | `observations.corePce3m`, L1 |
| 9 | Core CPI, services ex-housing | [BLS](https://www.bls.gov/news.release/) | L1 metrics |
| 10 | Payrolls, 3m average, unemployment, Sahm | [BLS](https://www.bls.gov/news.release/) / [FRED SAHMREALTIME](https://fred.stlouisfed.org/series/SAHMREALTIME) | `observations.nfp`, `unemployment`, L1 |
| 11 | WTI / Brent | [EIA](https://www.eia.gov/petroleum/) | `observations.wti`, L6, exotic chain 1 |

**Recompute the real policy rate** (funds mid minus core PCE 3m SAAR) and the
gap to r\*. This drives the single most important distinction in L1 and it is
quoted in four places.

---

## Step 4 — Supply

| # | Pull | Source | Writes to |
|---|---|---|---|
| 12 | Last 4–6 coupon auctions: tail vs WI, bid-to-cover, indirect/direct/dealer | [TreasuryDirect results](https://www.treasurydirect.gov/auctions/announcements-data-results/) | L2 metrics, scorecard `current` |
| 13 | Latest QRA: coupon sizes, bill share, guidance | [Quarterly refunding](https://home.treasury.gov/policy-issues/financing-the-government/quarterly-refunding) | L2, Scenario B invalidation |
| 14 | Buyback operation sizes | Same | L2, toolkit rung 2 |
| 15 | Deficit YTD **split into primary and net interest** | [Monthly Treasury Statement](https://fiscaldata.treasury.gov/datasets/monthly-treasury-statement/) | `FISCAL_INPUTS`, `flowChannels` |
| 16 | IG issuance YTD, AI/hyperscaler share | SIFMA / dealer runs | L2, cross-asset chain 1 |

> Step 15 is the one most likely to be skipped and it is the most valuable pull
> in the runbook. The MTS publishes interest outlays separately. Almost nobody
> splits them, and the split is what the entire Macro Lens rests on.

---

## Step 5 — Plumbing

| # | Pull | Source | Writes to |
|---|---|---|---|
| 17 | Reserves, TGA, ON RRP | [H.4.1](https://www.federalreserve.gov/releases/h41/) | `observations.reserves/tga/onRrp`, L3 |
| 18 | SOFR, TGCR, IORB, **and the 99th-percentile SOFR** | [NY Fed reference rates](https://www.newyorkfed.org/markets/reference-rates/sofr) | `observations.sofrIorb`, L3 |
| 19 | SRF take-up | [NY Fed operations](https://www.newyorkfed.org/markets/desk-operations/reverse-repo) | L3, scorecard |
| 20 | 10y SOFR swap spread | [OFR monitor](https://www.financialresearch.gov/short-term-funding-monitor/) / dealer runs | `observations.swapSpread10y`, L2/L3 |
| 21 | Leveraged-fund gross UST futures short | [CFTC TFF](https://www.cftc.gov/MarketReports/CommitmentsofTraders/) | `observations.basisTrade`, L3, Scenario D triggers |

> Pull the **99th-percentile minus median** SOFR spread, not just the median.
> Distributions widen before medians move; in September 2019 the tails were
> screaming for a fortnight while the average looked immaculate.

---

## Step 6 — Cross-border, mortgages, credit, vol

| # | Pull | Source | Writes to |
|---|---|---|---|
| 22 | JGB 10y and **30y**, BoJ policy rate | [MoF](https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/) | `observations.jgb10y`, L4 |
| 23 | USD/JPY 3m implied vol, cross-currency basis; recompute hedged UST yields | Dealer runs | L4 (tag `[E]`, method in DATA_DICTIONARY) |
| 24 | TIC / custody holdings (6-week lag — mark accordingly) | [TIC](https://home.treasury.gov/data/treasury-international-capital-tic-system) | L4 |
| 25 | 30y mortgage rate, primary-secondary spread, MBS OAS, CPR | [Freddie PMMS](https://www.freddiemac.com/pmms) + dealer runs | `observations.mortgage30y`, L5 |
| 26 | Bank AFS/HTM unrealised (quarterly) | [FFIEC](https://cdr.ffiec.gov/public/) | L5, institution lens |
| 27 | IG, HY, **CCC** OAS and all-in yields | [FRED ICE BofA](https://fred.stlouisfed.org/series/BAMLH0A0HYM2) | `observations.igOas/hyOas`, L6 |
| 28 | MOVE, VIX, S&P level | ICE / CBOE | `observations.move/vix`, L6 |

---

## Step 7 — Rewrite the judgement, not just the numbers

This is the step that separates a refresh from a data entry exercise.

1. **Re-derive the decompositions.** `decompositions` in `marketData.ts` must
   still reconcile on both views. The audit will fail if they do not. Do not
   force them — a residual that will not close means the attribution is wrong.
2. **Move the probabilities, and move `priorProbability` first.** Apply the
   scorecard rules mechanically to what actually printed, then adjust for
   judgement, then write down which of the two you did. If nothing moved, the
   audit raises a WARN and you owe the reader a sentence explaining why.
3. **Re-examine every steelman.** If a layer's steelman has become the base
   case, the signal should have flipped. Steelmen that never win are decoration.
4. **Check the flips-on conditions.** Any that fired must be honoured.
5. **Re-check the term-premium attribution.** Specifically the fragile
   components: if dealer inventory cleared or the CFTC short shrank without a
   yield move, the fragile bucket has already spent itself and Scenario D loses
   weight.
6. **Update the watchlist**, dropping past events and adding the next six weeks.
7. **Append to `docs/CHANGELOG.md`** — what changed, what you got wrong last
   time, and what the framework failed to anticipate. The third item is the
   only one that improves the framework.

---

## Step 8 — Verify and commit

```bash
npm run build --prefix app
```

The build runs `tsc --noEmit` first, so a mistyped path field is a compile error
rather than a blank table cell. Then open the app and check the self-check bar
reads **0 FAIL**. WARNs are acceptable when defended in writing; FAILs mean the
numbers on the page contradict each other.

```bash
git add -A && git commit -m "refresh: anchor YYYY-MM-DD"
```

---

## Automation candidates, in value order

1. **Steps 1, 7, 17, 18, 27, 28** are all FRED series and could be a single
   scheduled script writing `observations`. This alone would remove most
   staleness.
2. **Step 12** — TreasuryDirect publishes auction results as XML.
3. **Step 15** — the MTS is on `fiscaldata.treasury.gov` with a clean JSON API,
   and the primary/interest split is a two-field query.

Steps 7 (judgement) and the steelman review are not automation candidates and
should not become ones.

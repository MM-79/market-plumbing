# Refresh Runbook

The data refreshes itself. This document covers the two things that do not:
the seven fields with no free feed, and the reasoning.

---

## What is automated

```bash
npm run refresh --prefix app      # writes app/public/data/snapshot.json
```

Runs unattended on weekday evenings via `.github/workflows/refresh.yml`, and
commits only if something moved. **51 series and the last 14 coupon auctions**,
from four keyless public endpoints.

| Group | Series |
|---|---|
| Curve | 3m, 2y, 5y, 10y, 30y par yields |
| Real & inflation | 5y/10y TIPS, 10y breakeven, 5y5y forward breakeven |
| Policy | Effective fed funds, IORB, real policy rate (derived) |
| Term premium | Kim-Wright 10y |
| Plumbing | Reserves, TGA (weekly and daily), ON RRP, SOFR + 1st/99th percentiles, TGCR, BGCR, SOFR−IORB and tail width (derived) |
| Credit | IG, HY, BB, CCC OAS; IG and HY effective yields; CCC−BB (derived) |
| Mortgage | Freddie PMMS 30y fixed |
| Vol | VIX |
| Macro | Core PCE index → y/y and 3m SAAR (derived); core CPI; payrolls → monthly change and 3m average (derived); unemployment; Sahm; claims 4wk |
| Energy | WTI |
| Fiscal | Debt held by the public, nominal GDP → growth (derived), net interest → effective rate on the stock (derived) |
| Cross-border | USD/JPY |
| Auctions | High yield, bid-to-cover, indirect/direct/dealer split, size |

The fetcher **aborts without writing** if the curve is missing or if more than
40% of sources fail. Keeping yesterday's snapshot and flagging its age beats
publishing an empty anchor.

### Adding a series

One entry in `app/scripts/sources.mjs`:

```js
{ key: 'myKey', id: 'FRED_ID', unit: 'bp', scale: 100,
  fromUnit: 'percent', toUnit: 'bp', staleAfterDays: 4, label: 'What it is' }
```

`scale` converts the published unit into the framework's. **Getting that wrong
is the most likely failure mode of the whole pipeline**, which is why every
converted series states the unit it converts *from*. ICE BofA publishes OAS in
percent and we quote basis points; WRESBAL publishes millions and we quote
trillions.

### Staleness limits

Daily market data gets 4 days (covers a long weekend), weekly gets 10.

Monthly and quarterly series need care, and getting this wrong is why a naive
pipeline reports half its own data as permanently stale. **FRED dates a periodic
observation to the START of the period it describes.** July core PCE, published
in late August, carries `asOf: 2026-07-01` and is already ~55 days old the day
it lands. Those series carry `periodDated: true` and thresholds that cover
period length + publication lag: 70–75 days monthly, 220 quarterly.

---

## What is NOT automated: the seven manual fields

Listed on the Data Feed tab with the reason and the source. Each is a place
where hand-typed drift can re-enter, which is exactly why they are displayed
rather than buried.

| Field | Why | Where |
|---|---|---|
| ACM 10y term premium | NY Fed publishes it as XLS, no machine-readable feed | [NY Fed term premia](https://www.newyorkfed.org/research/data_indicators/term-premia-tabs) |
| MOVE index | Proprietary to ICE, no free API | [ICE indices](https://indices.theice.com/) |
| 10y SOFR swap spread | Needs a swap curve feed | OFR monitor or a dealer run |
| Agency MBS current-coupon OAS | Model-dependent, vendor-supplied | Dealer run |
| Coupon auction tails | Needs the when-issued yield at the bid deadline, which TreasuryDirect does not publish | Dealer run or Bloomberg |
| CFTC leveraged-fund positioning | Feed exists; aggregating across the five UST contracts is judgement-heavy and not yet validated | [CFTC Socrata](https://publicreporting.cftc.gov/resource/gpe5-46if.json) |
| TIC foreign holdings | Six-week lag, fixed-width text | [TIC](https://home.treasury.gov/data/treasury-international-capital-tic-system) |

They live in `MANUAL_VALUES` in `app/src/data/marketData.ts`, each with the date
it was last entered.

> Keeping ACM manual while Kim-Wright is automated is a feature, not an
> oversight. The disagreement between the two models is load-bearing for L2, and
> automating only one keeps the comparison visible instead of letting a single
> model quietly become "the" term premium.

---

## What is NOT automated: the reasoning

This is the part that matters, and the part an auto-refreshing framework is
most likely to let rot. The self-check tracks it: **warn at 10 days, fail at
45**, comparing `narrativeReviewedOn` against the data date.

### The review, in order

**1. Re-read every layer steelman.** If a steelman has become the base case,
the signal should have flipped. Steelmen that never win are decoration.

**2. Check the flips-on conditions.** Each layer names one observable that would
change its signal. Any that fired must be honoured, or the framework is not
updating on evidence.

**3. Move the probabilities — and set `priorProbability` first.** Apply the
scorecard rules mechanically to what actually printed, then adjust for
judgement, then write down which of the two you did. If nothing moved, the
audit raises a WARN and you owe the reader a sentence explaining why.

**4. Re-examine the scenario deltas.** They are stored as bp changes and rebase
themselves, so they do not go stale in the way levels did. But a delta can still
be *wrong*: if Scenario B says the long end sells off 48bp in a month and it has
already done 40bp, the scenario has partly happened and the remaining delta
should shrink.

**5. Re-check the term-premium attribution** in `sehgalLens.ts`, specifically
the fragile components. If dealer inventory cleared or positioning unwound
without a yield move, that bucket has already spent itself and Scenario D loses
weight.

**6. Update the seven manual fields.**

**7. Update the watchlist** — drop past events, add the next six weeks.

**8. Set `narrativeReviewedOn`** in `marketData.ts` *and* `scenarios.ts`.

**9. Append to `docs/CHANGELOG.md`**: what changed, what the last run got wrong,
and what the framework failed to anticipate. The third is the only one that
improves anything.

### Verify

```bash
npm run build --prefix app
```

`tsc --noEmit` runs first, so a mistyped path field is a compile error rather
than a blank table cell. Then open the app: the self-check bar should read
**0 FAIL**. WARNs are acceptable when defended in writing on the page; FAILs
mean the numbers contradict each other.

---

## When the pipeline breaks

**Symptom: header shows ● OFFLINE.** The runtime fetch of
`data/snapshot.json` failed. The page is serving the build-time copy, which is
valid and dated. Usually a network issue or the site has not deployed yet.

**Symptom: header shows ● BUILD-TIME after a data commit.** The deploy did not
run. Most likely cause: a push made by `GITHUB_TOKEN` does not trigger other
workflows, which is why `deploy.yml` also listens for `workflow_run`. Check that
trigger survives any workflow edit.

**Symptom: self-check says the snapshot is more than 4 days old.** The scheduled
job has stopped. Check Actions permissions are read+write — a fetch that
succeeds and then fails to commit looks like success in the logs.

**Symptom: a series suddenly reads `n/a`.** The series was retired or renamed
upstream. The fetcher records it under `failures` and the Data Feed tab shows
it; find the replacement ID on FRED and update `sources.mjs`. The framework
degrades rather than lying, which is the intended behaviour.

**Symptom: a value is off by a factor of 100 or 1,000,000.** A `scale` mismatch.
Check `fromUnit`/`toUnit` on that entry against what the source publishes.

# Changelog

Newest first. Each entry records what changed, and — more usefully — what the
previous run got wrong.

---

## v3.1 - 2026-09-24

**The data now fetches itself, and doing so proved that every number in v3.0 was
invented.**

### The finding

v3.0 shipped with elaborate provenance machinery: source keys, as-of dates,
staleness limits, an audit verifying every observation carried a citation. It
all passed. Then the first real fetch ran.

| Field | v3.0 claimed | Actually published | Error |
|---|---|---|---|
| 10y Treasury | 5.14% | 4.96% | 18bp |
| 30y Treasury | 5.34% | 5.29% | 5bp |
| 2y Treasury | 4.75% | 4.71% | 4bp |
| 10y TIPS real | 2.42% | 2.63% | 21bp |
| 5y5y breakeven | 2.72% | 2.36% | 36bp |
| IG OAS | 108bp | 77bp | 31bp |
| HY OAS | 342bp | 273bp | 69bp |
| CCC OAS | 782bp | 1093bp | 311bp |
| VIX | 19.4 | 14.2 | - |
| ON RRP | $89bn | $0.46bn | ~200x |
| Reserves | $3.28tn | $3.01tn | $270bn |
| Kim-Wright 10y TP | 65bp | 96bp | 31bp |
| 30y mortgage | 7.22% | 6.95% | 27bp |
| Debt held by public | $32.1tn | $32.38tn | $280bn |
| Nominal GDP | $31.5tn | $32.49tn | $990bn |
| Net interest | $0.94tn | $1.25tn | $310bn |

**A citation is not a measurement.** The v3.0 audit checked that numbers carried
a source, which is worth nothing if nobody ever fetched them.

### What this changed analytically, not just cosmetically

1. **The inflation risk premium dropped from second to fifth** among the drivers
   of the long end. v3.0 ranked it second on a 5y5y breakeven of 2.72%. The real
   figure is 2.36%, at or below target-consistent levels. The long end is not
   held up by inflation expectations, and the entire "energy inflation risk
   premium" thread was an artefact of an invented number.
2. **The credit layer inverted.** v3.0 called credit "widening but orderly" from
   342bp. HY is actually at 273bp, near cycle tights - but CCC is at 1093bp
   against BB at 159bp, a ratio near 6.9x. The story is not widening; it is
   index-level calm masking extreme quality dispersion, which is a sharper and
   later-cycle signal. L6 confidence went MED to HIGH.
3. **The plumbing warning got worse and more specific.** ON RRP is not $89bn, it
   is $0.46bn - the buffer is not thin, it is gone. Reserves at $3.01tn are
   about 9.3% of GDP, at or through the bottom of most lowest-comfortable-level
   estimates rather than $200bn above them.
4. **Scenario C gained weight (23 to 28%) and B lost it (22 to 20%).** The
   payroll three-month average is 71k, not the 118k v3.0 asserted. A labour
   market decelerating from a low base, meeting a credit index at its tights,
   is a materially different risk balance. Against that, the effective rate on
   the debt stock is 3.85% versus nominal growth of 6.56%, so the snowball term
   is firmly negative and the fiscal-meltdown thesis is weaker, not stronger,
   than v3.0 claimed.
5. **L4 (cross-border) was demoted to LOW confidence and now prints "verify".**
   v3.0 gave it a confident BEARISH signal supported entirely by hedged-yield
   and TIC figures no source had published. There is no free feed for any of it.
   A layer with no data should look like a layer with no data.

### Structural changes

- **`app/scripts/fetch-snapshot.mjs`** - zero-dependency fetcher pulling 51
  series and 14 coupon auctions from FRED, the NY Fed reference-rates API,
  Treasury Fiscal Data and TreasuryDirect. No API key required. Aborts without
  writing if the curve is missing or more than 40% of sources fail. Writes only
  when something moved, so the scheduled job produces no empty commits.
- **Scenario paths are stored as bp DELTAS**, materialised against the live
  anchor. v3.0 stored absolute levels drawn against a 5.14% 10y; when the tape
  turned out to be 4.96%, all four scenarios described a market that did not
  exist. Deltas rebase themselves on every refresh, so the `Today` row equals
  the live anchor by construction and the path audit cannot fail on it.
- **Both 10y decompositions are computed**, not asserted: term premium from the
  Kim-Wright delta, real yield from the TIPS delta, each residual closing its
  own view. Window start dates are located by scanning the history rather than
  remembered, so "the 12-month low" re-anchors on every refresh.
- **The two-clock rule.** Data has an as-of date; the reasoning has a review
  date. Both in the header. `auditNarrativeFreshness` warns at a 10-day gap and
  fails at 45, because the characteristic failure of an auto-refreshing
  framework is stale judgement hiding behind fresh numbers.
- **`auditPipeline`** replaces the provenance check: sources fetched cleanly,
  snapshot generated recently, no high-frequency series past its staleness
  limit, manual fields declared rather than hidden.
- **Data Feed tab** - pipeline status, the seven manual fields with the reason
  each cannot be fetched, and the full series register with ages and limits.
- **`.github/workflows/refresh.yml`** (weekday cron) and **`deploy.yml`**
  (Pages). The deploy listens for `workflow_run` as well as `push`, because a
  push made by `GITHUB_TOKEN` does not trigger other workflows - the single most
  likely way this setup would have silently stopped working.
- **Snapshot history** in `app/public/data/history/` - one file per refresh, the
  beginning of an actual track record.
- Staleness limits corrected for period-dated series. FRED stamps a monthly
  observation to the START of the period it describes, so July core PCE is
  already ~55 days "old" the day it publishes. Without this, a third of the
  pipeline reports itself permanently stale.

### Known limits after this change

- Seven fields remain manual: ACM term premium, MOVE, swap spreads, MBS OAS,
  auction tails, CFTC positioning, TIC holdings. All named in the UI.
- Auction **tails** are not computable from any free feed - TreasuryDirect does
  not publish the when-issued yield at the bid deadline. Bid-to-cover and the
  bidder split are live.
- The primary deficit is still an estimate, exposed on a slider so the reader
  can see how little of the conclusion depends on it.
- Still no backtest. The snapshot history and `priorProbability` are the start
  of a track record, not one yet.

---


## v3.0 - 2026-09-24 (superseded by v3.1)

A structural rebuild. v2.7.1 was a well-written document rendered as a web page;
v3.0 is a framework that checks itself.

### Correctness defects found and fixed

| Defect | Effect | Fix |
|---|---|---|
| `parCurve` carried the pre-FOMC 10y (4.96) and 30y (5.30) while the anchor table and all twelve path rows carried 5.14 and 5.34 | The dashboard displayed `2s10s = +21bp` beside a narrative arguing about `+39bp`. Two different curves on one screen. | Single `anchor` object; every spread derived by `lib/curve.ts` |
| Path rows used key `s5s30s` on 3 of 12 rows where the renderer read `s5s30` | Three scenario path cells rendered blank, silently | `PathRow` is a strict type with no spread fields at all; spreads are computed |
| `5s30s` quoted throughout with no 5y anywhere in the path tables | The spread was unverifiable against its own components | `y5` added to every path row |
| Directive text stated the 2y at 4.86 while every table said 4.75 | Internal contradiction in the flagship decomposition | Rewritten to 4.57 → 4.75 (+18bp); audited |
| 10y decomposition summed path (35) + TP (32) + breakeven (35) to 102bp | Double-counting. Inflation compensation lives *inside* both path and term premium, not alongside them | Two orthogonal decompositions, each summing to the total independently, enforced by `auditDecompositions` |
| `SoWhatSection` built Tailwind classes as `text-${capColor}` | Tailwind v4 emits only literal class strings, so every market-cap card rendered borderless and colourless without erroring | Literal class maps throughout; same fix applied preventively across the new components |
| Trade sizing quoted a 30y DV01 of $1,028/mm and a 5s30s ratio of 232mm | Both wrong; correct figures are $1,487 and 338mm | Corrected, and the derived-analytics panel now computes them so the error cannot recur. **This defect was caught by the new panel disagreeing with the prose.** |
| Missing entirely: Scenario C policy toolkit, invented facility, Fed probability tree | Required by Leviathan Part 4 | Added as the Fed Reaction tab |
| Missing entirely: sources list | Required by Leviathan §8 | Sources tab with 25 keyed references plus the observation register |

### Analytical additions

- **Scenario D, "The Pain Trade" (10%).** v1's distribution contained only
  grind, doom and recession — no branch in which yields fall for a good reason.
  That is not a distribution, it is a mood, and it is structurally long the
  consensus trade. D is priced from the term-premium attribution rather than
  asserted: ~22 of 78bp has no fundamental owner.
- **The Sehgal Macro Lens tab.** Dual-narrative ledger, flow-of-funds
  decomposition of the deficit, debt dynamics with live `r−g` sliders, term
  premium split into durable and fragile, cross-asset flow chains, and the
  asymmetry test applied to the book.
- **The framework now argues with itself in public.** The Meat Grinder layer
  reads the fiscal position as dominant and bearish; the Macro Lens reaches a
  materially softer conclusion from the same data by decomposing who receives
  the spending. Both are on screen. Neither is quietly reconciled.
- **Steelman and flips-on for every diagnostic layer.** Six layers that all
  agree is one piece of evidence counted six times.
- **`priorProbability` on every scenario**, so the update is explicit and the
  audit can warn when nothing moved.
- **Scorecard rules state the pp shift**, not just a threshold, so they can be
  checked against the tape afterwards.
- **Institution-lens actions carry trigger, owner, lead time and cost.** An
  action with only a priority label is a wish.
- **Real curve analytics**: par→zero bootstrap, 5y5y and 10y20y forwards,
  butterflies, par-bond DV01, DV01-neutral hedge ratios, roll-down.

### Engineering

- Restructured from `workspace/` to a real project root with `app/`, `docs/`,
  `archive/`; git repo lifted to the root.
- Removed 9 unused dependencies (supabase, dnd-kit, framer-motion,
  canvas-confetti, react-router, date-fns, uuid, lucide-react and their types).
  Recharts, previously installed but unused, now actually draws the curve.
- `npm run build` runs `tsc --noEmit` first, so a mistyped path field is a
  compile error rather than a blank table cell.
- Curve chart replaces four CSS divs scaled from a zero baseline, which
  compressed the entire 2–30y structure into the top 15% of the panel and made
  a 39bp slope visually identical to a flat curve.

### What v2.7.1 got wrong analytically, not just mechanically

1. **It treated the headline deficit as the stimulus.** Roughly half is net
   interest, accruing to holders with an MPC near 0.15. The demand impulse is
   about half the headline. This single decomposition moves the inflation
   outlook more than any datapoint in the diagnostic spine, and v1 did not
   contain it.
2. **It never wrote down the debt dynamics equation.** "Fiscal doom" was
   asserted from a deficit ratio. On `r−g` arithmetic the ratio rises about
   0.9pp a year — a slow leak. The real finding, which only appears once the
   equation is written, is that the fiscal risk and the recession risk are the
   *same* risk, because the snowball only turns positive if nominal growth
   falls. That makes Scenario C the fiscal tail, not Scenario B.
3. **It confused "not accommodative" with "restrictive."** The real policy rate
   is +0.28% against an r\* near 0.95%. Policy is ~67bp below neutral and has
   not been restrictive for one day of this cycle.
4. **Its book had no convexity.** Four bounded-linear spread trades plus one
   long straddle bleeding 55bp of theta a month — a directional book with an
   expensive apology attached.
5. **It had no way to be wrong.** No prior probabilities, no falsification log,
   no self-check, no steelman. Every layer agreed with every other layer and
   with the headline.

### Known open items

- All `[D]` series remain manual. Wiring the FRED subset (steps 1, 7, 17, 18,
  27, 28 of the runbook) is the highest-value next change.
- No unit tests on `lib/`. The DV01 and bootstrap sanity anchors are documented
  in `DATA_DICTIONARY.md` but not asserted in code.
- No track record yet. `priorProbability` is the beginning of one; calibration
  is unknown until several runs accumulate.

---

## v2.7.1 — 2026-09-24 (superseded)

Initial framework. Six diagnostic layers, three scenarios, synthesis, bank
treasury lens, exotic appendix, and sector/market-cap impact analysis across
eight parts. Preserved in `archive/`.

# Data Dictionary

Every field, its units, its conventions, and where it comes from. Where a
convention is a choice rather than a standard, the choice is stated and
defended.

---

## Global conventions

| Item | Convention |
|---|---|
| Yields | Percent, e.g. `5.14` means 5.14%. Never decimals. |
| Spreads | Basis points, integers, derived not stored. |
| Curve sign | Spread = long tenor minus short tenor. `2s10s = y10 − y2`. Positive = upward sloping. |
| Swap spreads | Swap rate minus Treasury yield. Negative = swaps through Treasuries. |
| SOFR−IORB | Positive = SOFR above IORB = funding pressure. |
| Coupons | Semiannual throughout. |
| Day count | Act/act for Treasuries. Not modelled — irrelevant at the precision quoted. |
| Dates | ISO `YYYY-MM-DD`. `asOf` is the date of the **observation**, never the date it was typed. |
| Money | `$tn` for fiscal aggregates, `$bn` for flows and balances, `$mm` for trade notionals. |

---

## `types/framework.ts`

### `Series` (in `lib/snapshot.ts`)

Replaces v3.0's hand-maintained `Observation`. Every one of these is written by
the fetcher, never by a human.

| Field | Type | Meaning |
|---|---|---|
| `value` | number | The fetched value, already converted into the framework's unit. |
| `unit` | string | `pct` \| `bp` \| `usd_bn` \| `usd_tn` \| `index` \| `count` \| `ratio` |
| `tag` | `D`/`E`/`I`/`S` | `D` for fetched, `E` for derived from fetched series. |
| `asOf` | ISO date | The observation's own date, as published. |
| `source` | string | e.g. `fred:DGS10`, `nyfed:reference-rates`, `derived(a+b)`. |
| `sourceUrl` | string? | Deep link, rendered in the Data Feed tab. |
| `staleAfterDays` | number | See below. |
| `periodDated` | boolean | True for monthly/quarterly series. See below. |
| `history` | array? | Retained observations. 520 points for the eight series the decompositions are computed from, 40 for the rest. |

**`staleAfterDays` and the period-dating trap.** Daily market data gets 4 (covers
a long weekend), weekly gets 10. Monthly and quarterly need care: **FRED dates a
periodic observation to the START of the period it describes.** July core PCE,
published in late August, carries `asOf: 2026-07-01` and is already ~55 days
"old" the day it lands. Without accounting for this, roughly a third of the
pipeline reports itself permanently stale. Those series carry
`periodDated: true` and thresholds covering period length + publication lag:
70-75 days monthly, 220 quarterly. The UI marks them with `*` and explains the
gap rather than implying somebody forgot to refresh.

### `MANUAL_VALUES` (in `data/marketData.ts`)

The seven fields with no free machine-readable feed, each with the date it was
last entered by hand so it can age exactly like a fetched series. Listed in the
UI with the reason, because every one is a place where the v3.0 failure - a
number typed by a human, ageing quietly behind a source citation - can recur.

### `PathRow` / `PathDelta`

**`PathDelta` is what an analyst writes; `PathRow` is what the app renders.**

A scenario is a view about CHANGE - "the long end sells off 50bp and the front
does not follow" - and that view survives the market moving underneath it.
`PathDelta` stores bp changes from today; `materialisePath()` applies them to
the live anchor to produce `PathRow`. v3.0 stored absolute levels drawn against
a 5.14% 10y, and when the tape turned out to be at 4.96% all four scenarios were
describing a market that did not exist. Deltas rebase themselves on every
refresh, so the `Today` row equals the live anchor by construction.

Two fields stay absolute on purpose: `fedFundsLow/High`, because that is a view
about a policy level rather than a drift; and `move`, because the MOVE index has
no free feed and therefore no live base to apply a delta to.

**Both types deliberately have no spread fields.** `2s10s` and
`5s30s` are computed from `y2/y5/y10/y30` by `spreads()` at render time. v1
stored them as strings, mistyped the key on three of twelve rows (`s5s30s`
instead of `s5s30`), and rendered blank cells that nobody noticed. A spread that
cannot be stored cannot disagree with the yields it comes from.

| Field | Unit | Note |
|---|---|---|
| `monthsAhead` | `0 \| 1 \| 3 \| 6` | `0` must equal the anchor. Audited. |
| `fedFundsLow/High` | pct | Target range bounds. Mid is derived. |
| `y2`, `y5`, `y10`, `y30` | pct | On `PathDelta` these are `dy2`/`dy5`/`dy10`/`dy30`, in bp from today. |
| `termPremium` | bp | Kim-Wright 10y (live). ACM is manual and shown beside it. |
| `swapSpread10y` | bp | Negative = swaps through Treasuries. |
| `sofrMinusIorb` | bp | |
| `mortgage30y` | pct | PMMS basis. |
| `igOas`, `hyOas` | bp | ICE BofA. |
| `move` | index | |

### `TradeExpression`

| Field | Meaning |
|---|---|
| `carryBpPerQuarter` | Negative = costs money to hold. |
| `targetBp` / `stopBp` | **Units differ by trade and the `sizing` field states which.** bp of the traded spread for linear trades; bp of premium for option structures. Mixing them silently makes reward-to-risk meaningless, which is why the requirement is written into the type comment. |
| `payoffShape` | `linear-bounded` \| `convex` \| `multiplicative`. Audited: a book with none of the latter two gets a WARN. |
| `asymmetryNote` | The Sehgal test in prose: if right, how much; if wrong, how much; and is the payoff bounded. |

---

## `lib/curve.ts`

### `bootstrapDiscountFactors(curve, maxYears)`
Par → zero via the standard recursion
`DF_n = (1 − (c/2)·Σ DF_i) / (1 + c/2)`.

**Stated limitation.** Only 2y/5y/10y/30y are quoted, so par yields are linearly
interpolated onto the semiannual grid before bootstrapping. Linear-on-par is
cruder than monotone-convex or Nelson-Siegel-Svensson; it is adequate for the
spread and forward arithmetic quoted in the 2–30y range and **wrong in the 0–2y
stub**, where the curve is flat-extrapolated from the 2y. Nothing inside 2y is
quoted off this curve. If the framework ever needs a 3m or 1y point, this
function must be replaced, not extended.

### `forwardRate(df, start, tenor)`
Implied forward over `[start, start+tenor]`, semiannually compounded, percent.

`5y5y` is quoted rather than the spot 10y wherever the argument is about the
terminal rate plus its term premium. The spot 10y is contaminated by the next
two years of policy, which is the one part of the path nobody disputes.

### `dv01PerMM(parYieldPct, years)`
Par-bond closed form, `Dmod = (1/y)(1 − (1+y/2)^(−2n))`, returned in dollars per
$1mm notional.

Sanity anchors, checkable against the Dashboard's derived-analytics panel:
a 10y near 5% gives roughly $780/mm and a 30y near 5.3% roughly $1,495/mm, with
the 30y carrying about 3.4x the risk per million of the 5y. Because the panel
computes these from the live curve, a code change that breaks the formula shows
up immediately as a tile that disagrees with these magnitudes.

### `classifyRegime(start, end, thresholdBp = 3)`
Names the curve regime from the move rather than accepting an assertion.

- **Direction** from the sign of `d10 + d2` (bear = yields up).
- **Twist** when the wings move in opposite directions by more than the
  threshold — a twist is not merely a large slope change.
- **Parallel** when the slope change is under the threshold.
- Otherwise `{bear|bull} {steepener|flattener}` from the sign of `dSlope`.

The 3bp threshold is a judgement call. It is large enough that daily noise does
not produce a regime label and small enough that a real week-long move does.

### `spreadCarryRoll(curve, front, back, months)`
Roll-down only — the change in quoted yield as each leg ages against a static
curve. **It is not full carry**: it excludes the coupon-versus-repo funding
differential, which requires a repo curve this framework does not carry. Where a
trade quotes carry, the figure is roll-down and the trade note says so.

---

## `lib/fiscal.ts`

### `debtDynamics(input)`
`d(D/Y) = primary deficit/Y + (r − g)·(D/Y)`.

| Input | Source | Note |
|---|---|---|
| `debtHeldByPublic` | MTS / Fiscal Data | Held **by the public**, not gross debt. Intragovernmental holdings do not price. |
| `nominalGdp` | BEA, annualised | |
| `primaryDeficit` | MTS total less net interest | The pull most often skipped. |
| `netInterest` | MTS net interest outlays | |
| `nominalGrowthPct` | Real + deflator | **Nominal**, not real. Using real growth here is the most common error in published debt-sustainability commentary and it flips the sign of the snowball term. |

`effectiveRatePct` is derived as `netInterest / debtHeldByPublic` — a backward-
looking average of past issuance, not the marginal rate. `effectiveRatePath()`
projects its convergence on the marginal rate over the weighted average maturity,
which is the honest counter to the comfortable arithmetic.

### `effectiveStimulus(channels, gdp)`
Applies an MPC per channel and returns headline versus effective impulse.

**MPC values are `[E]`, reasoned rather than estimated**, drawn from the standard
literature range (0.85–0.90 for liquidity-constrained transfer recipients, 0.10–
0.20 for interest income to financial-asset holders, ~0.05 for income leaving the
domestic circuit). The conclusion — that the effective impulse is roughly half
the headline — is robust to any plausible coefficient set. The specific figure
of 3.2% of GDP is not, and should not be quoted to one decimal.

---

## `lib/audit.ts`

`AuditResult.severity`:

- **FAIL** — the numbers on the page contradict each other or their own stated
  provenance. Blocking. Fix before publishing.
- **WARN** — a judgement flag. Acceptable when defended in writing on the page.
- **PASS** — internally consistent. **Not** a claim of correctness.

---

## `data/marketData.ts`

Nothing in this file holds a market number any more. It holds the narrative -
layer signals, steelmen, flips-on conditions - plus `MANUAL_VALUES` and
`buildLayers(snapshot)`, which interpolates live figures into the prose so a
sentence quoting a level cannot drift away from the level it quotes.

`runSettings.narrativeReviewedOn` is the date a human last re-reasoned that
prose. `auditNarrativeFreshness` compares it against the data date and warns at
a 10-day gap, failing at 45.

Layer `metrics[]` entries are display strings with a tag and are **not** audited
for provenance — they are too heterogeneous to type usefully. The rule is that
any figure a downstream calculation depends on must also exist in `observations`.
Layer metrics that are purely narrative do not.

The decompositions are computed by `buildDecompositions()` from published
series - term premium from the Kim-Wright delta, real yield from the TIPS delta,
each residual closing its own view - so they satisfy, per window, by
construction:
`expectedPathBp + termPremiumBp = total` **and**
`realYieldBp + breakevenBp = total`, each within 3bp.

The two views are orthogonal cameras on one object. Inflation compensation lives
*inside* both path and term premium; it does not sit alongside them. v1 added all
three together and reached 102bp by double-counting.

---

## `data/sehgalLens.ts`

`termPremiumAttribution.components[].durable` — whether the component has a
fundamental owner. `false` marks components that can unwind mechanically with no
change in the macro (dealer balance-sheet scarcity, positioning residual). The
fragile total is the quantitative basis for Scenario D's weight.

These splits are `[E]`/`[I]`. They are an argument with numbers attached, not a
decomposition anyone could replicate from data, and the UI says so directly
beneath them.

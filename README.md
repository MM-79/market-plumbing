# Market Plumbing — Yield-Curve-Prime

A US rates and Treasury-plumbing framework that **refreshes its own data**,
runs the **Leviathan v2** diagnostic spine, overlays the **Sehgal macro lens**,
and audits itself in public every time it loads.

```bash
npm install --prefix app
npm run refresh --prefix app   # pull a fresh snapshot from public sources
npm run dev     --prefix app   # http://localhost:3000
npm run build   --prefix app   # typecheck + production build
```

---

## How it stays current

A scheduled job runs `app/scripts/fetch-snapshot.mjs` on weekday evenings, pulls
**51 series and the last 14 coupon auctions** from free public endpoints, and
commits the snapshot only if something moved. The published page then fetches
that snapshot at runtime, so refreshed data appears without a rebuild.

| Source | What it provides | Key needed |
|---|---|---|
| FRED (public CSV, or the JSON API if `FRED_API_KEY` is set) | Curve, TIPS, breakevens, term premium, credit OAS by rating, reserves, TGA, ON RRP, mortgage, VIX, PCE, payrolls, claims, WTI, GDP, net interest | No |
| NY Fed reference rates API | SOFR, TGCR, BGCR, and the 1st/99th percentiles | No |
| Treasury Fiscal Data | Debt held by the public, daily TGA | No |
| TreasuryDirect | Coupon auction high yield, bid-to-cover, indirect/direct/dealer split | No |

**Seven fields still cannot be fetched** — ACM term premium (published as XLS),
MOVE (proprietary), swap spreads, MBS OAS, auction tails (the when-issued yield
at the bid deadline is not published), CFTC positioning, TIC holdings. They are
listed by name on the Data Feed tab, with the reason and where to get them,
because every one of them is a place where hand-typed drift can re-enter.

### The failure policy

The fetcher refuses to write a snapshot if the curve is missing or if more than
40% of sources fail. Keeping yesterday's data and flagging its age is strictly
better than publishing a page with an empty anchor.

---

## Why this version exists

v3.0 had elaborate provenance machinery: every number carried a source key, an
as-of date and a staleness limit. Then the first real data arrived.

| | v3.0 claimed | Actually published |
|---|---|---|
| 10y Treasury | 5.14% | 4.96% |
| 5y5y breakeven | 2.72% | 2.36% |
| IG OAS | 108bp | 77bp |
| HY OAS | 342bp | 273bp |
| CCC OAS | 782bp | 1093bp |
| VIX | 19.4 | 14.2 |
| ON RRP | $89bn | $0.46bn |
| Reserves | $3.28tn | $3.01tn |

Every one of those had a perfect citation beside it. None had ever been fetched.

**A citation is not a measurement.** That is the lesson this version is built
around, and it changed the conclusions, not just the tiles: the framework had
ranked an inflation risk premium second among the drivers of the long end, on a
5y5y breakeven of 2.72%. The real figure is 2.36% — at or below
target-consistent levels — so that driver dropped from second to fifth. The
credit layer flipped from a story about widening to a much sharper one about
index-level calm masking a CCC-minus-BB gap near 950bp.

---

## The three structural ideas

**1. Nobody types a number.**
Spreads, forwards, DV01s, hedge ratios, roll-down, both 10y decompositions, the
debt-dynamics arithmetic and every layer metric are computed from the snapshot.
`PathRow` has no spread fields, so a spread cannot disagree with the yields it
comes from.

**2. Scenarios are stored as deltas, not levels.**
A scenario is a view about *change* — "the long end sells off 50bp and the front
does not follow" — and that view survives the market moving underneath it. v3.0
stored absolute path levels drawn against a 5.14% 10y; when the tape turned out
to be at 4.96%, all four scenarios were describing a world that did not exist.
Deltas rebase themselves on every refresh, so the `Today` row is the live anchor
*by construction* and the audit cannot fail on it.

**3. Two clocks, both visible.**
Data has an as-of date; the reasoning has a review date. Both are in the header.
The self-check warns when they drift more than 10 days apart and fails at 45,
because the characteristic failure of an auto-refreshing framework is stale
judgement hiding behind fresh numbers.

---

## The self-check

`app/src/lib/audit.ts` runs the Leviathan §7 checklist as executable code on
every page load and renders the result — including failures — on every tab.

Pipeline: sources fetched cleanly · snapshot generated recently · no
high-frequency series past its staleness limit · manual fields declared not
hidden. Analysis: probabilities sum to 100 and moved since the prior run · every
path starts at the live anchor · both decompositions reconcile independently ·
every trade has an invalidation · the book contains a non-linear payoff ·
reward-to-risk at least 1:1 · no expression works in every scenario · every
scenario has an expression. Plus the two-clock narrative check.

Currently **0 FAIL, 2 WARN, 17 PASS**. Both warnings are real: a deliberately
sub-1:1 mean-reversion hedge that is defended in writing, and the manual-field
notice. Passing means internally consistent, not correct, and the panel says so.

---

## Layout

```
.
├── app/
│   ├── scripts/
│   │   ├── sources.mjs            Source registry: endpoints, units, staleness
│   │   └── fetch-snapshot.mjs     Zero-dependency fetcher
│   ├── public/data/
│   │   ├── snapshot.json          Current snapshot (committed)
│   │   └── history/YYYY-MM-DD.json  One per refresh — the track record
│   └── src/
│       ├── types/framework.ts     Type contracts. The cheapest auditor there is.
│       ├── lib/snapshot.ts        Baked + live loading, staleness
│       ├── lib/derive.ts          Snapshot → anchor, layers, decompositions
│       ├── lib/curve.ts           Par→zero bootstrap, forwards, DV01, carry/roll
│       ├── lib/fiscal.ts          Debt dynamics, flow-of-funds
│       ├── lib/audit.ts           The self-check, as code
│       ├── data/                  Narrative only — the part that cannot be fetched
│       └── components/
├── docs/
│   ├── METHODOLOGY.md        How the framework reasons, and its known limits
│   ├── DATA_DICTIONARY.md    Every field: meaning, source, units, conventions
│   ├── REFRESH_RUNBOOK.md    What is automated, and the judgement that is not
│   ├── PUBLISHING.md         Pushing to GitHub and enabling Pages
│   └── CHANGELOG.md
└── .github/workflows/
    ├── refresh.yml           Weekday cron → fetch → commit if changed
    └── deploy.yml            Build → GitHub Pages
```

---

## What the framework does that most do not

- **Every diagnostic layer carries a steelman** and one observable that would
  flip it. Six layers that all agree is one piece of evidence counted six times.
- **A layer that cannot be measured says so.** L4 (cross-border) carries LOW
  confidence and prints "verify" instead of numbers, because TIC lags six weeks
  and hedged yields have no free feed. v3.0 gave that layer a confident BEARISH
  signal built entirely on figures nobody had published.
- **There is a scenario where yields fall for a good reason** — D, the
  positioning squeeze — priced from the fraction of term premium that has no
  fundamental owner rather than asserted.
- **The deficit is decomposed before it is used.** Net interest accrues to
  holders of financial assets with a propensity to consume near 0.15, so the
  demand impulse is roughly half the headline.
- **Debt sustainability is an equation with live inputs.**
  `d(D/Y) = primary deficit/Y + (r−g)·(D/Y)`, with r and g on sliders. The
  finding that only appears once you write it down: the fiscal risk and the
  recession risk are the *same* risk, because the snowball only turns positive
  if nominal growth falls below the coupon.
- **The framework argues with itself in public.** The Meat Grinder layer reads
  the fiscal position as bearish; the Macro Lens reaches a softer conclusion
  from the same data. Both are on screen, unreconciled.

---

## Limits, stated plainly

- Seven fields remain manual and will drift. They are named on the Data Feed tab.
- Term premium is a model residual, not an observation. Kim-Wright is fetched;
  ACM is not; they disagree, and anything built on either inherits that gap.
- Auction *tails* cannot be computed from any free feed. Bid-to-cover and the
  bidder split are live; the tail is not.
- The par→zero bootstrap interpolates linearly between 2y/5y/10y/30y. Adequate
  for what is quoted, wrong inside 2y, where nothing is quoted.
- MPC coefficients and the term-premium attribution splits are reasoned
  estimates, not measurements.
- No backtest. `priorProbability` and the snapshot history are the beginning of
  a track record; they are not one yet.

**Analytical framework, not investment advice.** See [LICENSE](LICENSE).

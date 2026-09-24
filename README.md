# Market Plumbing — Yield-Curve-Prime

A US rates and Treasury-plumbing analysis framework, rendered as a self-auditing
terminal. It runs the **Leviathan v2** diagnostic spine and overlays the
**Sehgal macro lens**, and it is built on the premise that the most valuable
thing a research framework can do is catch itself being wrong.

```bash
npm install --prefix app
npm run dev --prefix app      # http://localhost:3000
npm run build --prefix app    # typecheck + production build
```

## What it is

A six-layer diagnostic of the US Treasury market (policy, fiscal supply and term
premium, repo plumbing, cross-border flows, MBS convexity, credit) that branches
into four scenarios over a six-month horizon, with a trade book, a bank-treasury
lens, and a set of non-financial transmission chains.

It is **not** a data terminal. Nothing refreshes itself. Every figure is a
hand-maintained snapshot with an explicit as-of date and source key, and the
application flags its own stale numbers rather than presenting them as current.
[`docs/REFRESH_RUNBOOK.md`](docs/REFRESH_RUNBOOK.md) is the ordered list of pulls
that makes the snapshot true again.

## The three ideas that shape it

**1. A spread is not a fact, it is a function of two facts.**
Every spread, forward, DV01, hedge ratio and roll-down on screen is computed by
[`app/src/lib/curve.ts`](app/src/lib/curve.ts) from the four par yields in the
anchor. None is typed. In v1 the curve panel and the scenario tables were both
hand-typed from different snapshots and disagreed by 18bp on 2s10s, on the same
screen, for weeks.

**2. Every claim carries provenance, and staleness is visible.**
Each observation has a value, a tag (`[D]` data / `[E]` estimate / `[I]`
inference / `[S]` speculation), an as-of date, a source key resolving to a URL,
and a staleness limit. The Sources tab shows the full register and highlights
anything past its limit.

**3. The framework audits itself in public.**
[`app/src/lib/audit.ts`](app/src/lib/audit.ts) runs the Leviathan §7 self-check
as executable code on every page load: probabilities sum to 100, every scenario
path starts from today's verified anchor, both 10y decompositions reconcile
independently, every trade carries an invalidation, the book contains at least
one non-linear payoff, no expression claims to work in every scenario. Results —
including failures — render in a bar at the top of every tab. Passing means
internally consistent, not correct, and the panel says so.

## Layout

```
.
├── app/                      Vite + React + TypeScript terminal
│   ├── src/
│   │   ├── types/framework.ts    Type contracts. The cheapest auditor there is.
│   │   ├── lib/curve.ts          Par→zero bootstrap, forwards, DV01, carry/roll
│   │   ├── lib/fiscal.ts         Debt dynamics, flow-of-funds decomposition
│   │   ├── lib/audit.ts          The self-check, as code
│   │   ├── data/                 The snapshot. Hand-maintained, fully sourced.
│   │   └── components/
│   └── package.json
├── docs/
│   ├── METHODOLOGY.md        How the framework reasons, and its known limits
│   ├── DATA_DICTIONARY.md    Every field: meaning, source, units, conventions
│   ├── REFRESH_RUNBOOK.md    The ~25 pulls that make the snapshot current
│   └── CHANGELOG.md          What changed between runs, and why
└── archive/                  Superseded artefacts, kept for reference
```

## Things this framework deliberately does that most do not

- **Every diagnostic layer carries a steelman.** The best available argument
  that the layer's own signal is wrong, plus the single observable that would
  flip it. Six layers that all agree is not six pieces of evidence — it is one
  piece counted six times.
- **There is a scenario in which yields fall for a good reason.** Scenario D,
  the positioning squeeze. A distribution containing only grind, doom and
  recession is not a distribution, and it will be structurally long the
  consensus trade forever.
- **The fiscal deficit is decomposed before it is used.** Roughly half of the
  headline is net interest, which accrues to holders of financial assets with a
  low propensity to consume. The demand impulse is about half the headline, and
  the Macro Lens tab reaches a materially softer conclusion on the fiscal
  question than the Meat Grinder layer does. Both are on the page.
- **Debt sustainability is an equation, not an adjective.** `d(D/Y) = primary
  deficit/Y + (r−g)·(D/Y)`, with the two inputs on live sliders, plus the honest
  counter that today's low effective rate is a fossil of zero-rate issuance.
- **Every trade states its payoff shape and reward-to-risk**, and the audit
  flags anything below 1:1 whether or not it is defended in prose. One trade in
  the current book is below 1:1 and is flagged. That is the engine working.

## Limits, stated plainly

- The snapshot is manual. Between refreshes it decays, and it will tell you so.
- Term premium is not observed. It is a model residual, and ACM and Kim-Wright
  currently disagree by 13bp — a fifth of the repricing everyone is arguing
  about. Anything built on term premium inherits that error bar.
- The par→zero bootstrap interpolates linearly between 2y/5y/10y/30y. That is
  adequate for the arithmetic quoted and wrong inside 2y, where nothing is
  quoted off this curve.
- MPC coefficients in the flow-of-funds decomposition, and the term-premium
  attribution splits, are reasoned estimates `[E]`/`[I]`, not measurements.

Analytical framework, not investment advice.

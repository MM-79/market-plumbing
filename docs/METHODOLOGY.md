# Methodology

How this framework reasons, in the order it reasons. Read `DATA_DICTIONARY.md`
for what each field means and `REFRESH_RUNBOOK.md` for how to make the snapshot
current.

---

## 1. The two frameworks and why both

**Leviathan v2** supplies the *spine*: a six-layer diagnostic, three-to-four
scenarios with path tables anchored to today's verified levels, a named
historical analog per scenario, a trade book with invalidations, a bank-treasury
lens, and a self-check. It is a measurement discipline. Its characteristic
failure is that measurement discipline produces confident numbers, and confident
numbers about a market are not the same as understanding it.

**The Sehgal macro lens** supplies the *interpretation*: for every measurement,
what is the market's telling and what is the policymaker's telling; where does
the money actually go; is this a cyclical blip or a regime shift; is the move
fundamental or a crowd; and is the expression linear or convex. Its
characteristic failure is that interpretation without measurement is just a
well-argued opinion.

Run alone, each is half a framework. The interesting part is where they
disagree, and this application is built so that they *can* disagree visibly:
the Meat Grinder layer (L2) reads the fiscal position as the dominant bearish
force, and the Macro Lens tab reaches a materially softer conclusion from the
same data by decomposing who receives the spending. Both are on screen. Neither
is quietly reconciled.

---

## 2. The evidence rules

Every quantitative claim carries a tag:

| Tag | Means | Requirement |
|---|---|---|
| `[D]` | Data | A value, an as-of date, and a source key resolving to a URL |
| `[E]` | Estimate | Modelled or derived; the method must be stated |
| `[I]` | Inference | A reasoned conclusion from data, not itself measured |
| `[S]` | Speculation | A plausible mechanism with no supporting observation yet |

Three rules that follow from this:

1. **Never fabricate.** If a value is unavailable, give the last known value
   with its date and mark it stale, or write "verify". The observation register
   on the Sources tab enforces the first half of this mechanically.
2. **Auctions do not fail.** Dealers absorb the residual. Weakness is described
   as a large tail, weak indirect participation, and a high dealer takedown.
   Any text saying an auction "failed" is wrong on the mechanics.
3. **Term premium is a residual, not an observation.** It is backed out of a
   model estimated on the same curve it purports to explain. ACM and Kim-Wright
   currently differ by 13bp. Quote both, or quote neither.

---

## 3. The diagnostic spine

Six layers, each ending in a signal (direction and confidence), a **steelman**,
and a **flips-on** condition.

| Layer | Question it answers |
|---|---|
| L1 Short-End Engine | Where is policy relative to neutral, and is the market ahead of or behind the committee? |
| L2 Meat Grinder | How much duration is being pushed into the market, and who is being paid what to absorb it? |
| L3 Shadow Plumbing | How much buffer is left before funding markets bind? |
| L4 Cross-Border | Who is the marginal buyer, and at what yield do they engage or leave? |
| L5 Convexity & MBS | What amplifies a move once it starts, and who is forced to trade? |
| L6 Credit & Risk | Has the rates move reached the assets that price default? |

**The steelman requirement is not decoration.** A dashboard where all six layers
point the same way looks like overwhelming evidence and is usually one piece of
evidence counted six times — the layers share inputs. Forcing each layer to
state its own best counter-argument, and one observable that would flip it,
breaks that illusion and makes the framework falsifiable at the layer level
rather than only at the scenario level.

### The distinction L1 exists to police

*Removing accommodation* and *moving to restrictive* are different operations
with different endpoints. With the funds mid at 3.875% against core PCE at 3.6%,
the real policy rate is +0.28%, against an HLW r\* near 0.95%. On that
arithmetic policy sits roughly 67bp **below** neutral — the Fed has been
tightening for two years and has not been restrictive for a single day of it.
Conflating the two is how the market has under-priced the terminal rate in each
of the last three cycles, and it is the largest single disagreement in the
framework.

---

## 4. Scenario construction

Four scenarios, probabilities summing to 100, each carrying its prior-run
probability so the update is explicit.

- **A — Higher for Longer Grind (45%).** The muddle-through.
- **B — Fiscal-Dominance Meltdown (22%).** Duration indigestion becomes a
  funding cascade.
- **C — Stagflationary Breakage (23%).** Growth cracks while inflation is pinned.
- **D — The Pain Trade (10%).** The crowded short covers and yields fall for an
  unglamorous reason.

**Why D exists.** v1 offered grind, doom, and recession. Read that list again:
there was no path in which yields fall for a *good* reason. A distribution whose
every branch is bad, worse, or differently bad is not a distribution — it is a
mood, and it will be structurally long the consensus trade forever. Sehgal's
bandwagon point is exactly this: when everyone is worried about the long end,
that consensus is itself a component of the price, and the crowd cannot exit
through a door it is standing in.

D is not asserted. It is priced from the term-premium attribution: of the 78bp
of ACM term premium, roughly 22bp has no fundamental owner (dealer balance-sheet
scarcity, which unwinds mechanically when inventory clears, plus a positioning
residual). Add ~20bp of policy-path repricing on a soft PCE print and you have a
40–45bp rally requiring no change to the deficit, the Fed, or the foreign bid.

### Rules every scenario must satisfy

1. The `Today` row of the path table equals the verified anchor. Enforced by
   `auditPaths()`.
2. Every spread in the path table is derived from the yields in that same row.
   Enforced by the type system: `PathRow` has no spread fields.
3. Curve shape is derived from mechanics, not asserted. Where the first-month
   regime and the full-horizon regime disagree — as in C — the scenario contains
   a *handover* and the text must stage it. The application computes and displays
   both regimes so a mismatch is visible.
4. A named historical analog, with an explicit statement of why this episode is
   bigger or smaller.
5. An invalidation that can be observed, not felt.

---

## 5. The Sehgal overlay

### 5.1 Dual narratives
For each material issue: the market's telling, the Fed's telling, the divergence,
the observable that resolves it, and which telling the price currently reflects.
Never blended. The divergence is where the signal lives.

### 5.2 Follow the flows
A dollar of deficit is not a dollar of stimulus. The budget is decomposed by
*who receives the money*, and each channel carries a marginal propensity to
consume. Interest expense accrues overwhelmingly to holders of financial assets
with a low MPC; primary spending reaches households with a high one.

Result on current inputs: a headline deficit of 6.1% of GDP delivers a demand
impulse of roughly 3.2%.

**The reflexive loop this exposes** runs opposite to intuition. The Fed hikes to
cool demand. Hiking raises the coupon on $32.1tn of rolling debt, which raises
net interest, which raises the headline deficit, which the bond market reads as
more supply and demands term premium for. But the incremental interest goes to
recipients with an MPC near 0.15. So tightening produces a *larger* fiscal
headline and a *smaller* demand impulse simultaneously. The market trades the
headline; the economy responds to the impulse.

### 5.3 Debt sustainability as an equation

```
d(D/Y) = primary deficit / Y + (r − g) × (D/Y)
```

where **r is the effective rate paid on the stock**, not the marginal rate on
new issuance, and **g is nominal growth**, not real. The entire debate reduces to
the sign of (r − g). The Macro Lens tab puts both on sliders.

On current inputs: r = 2.93%, g = 5.1%, so the snowball term is −2.2pp and the
ratio rises about 0.9pp a year against a 3.1% primary deficit. That is a slow
leak, not a spiral.

**The honest counter, which the tab states in full:** the 2.93% effective rate
is a fossil of zero-rate issuance. It converges on the ~4.55% marginal rate over
the 6.0-year weighted average maturity, at which point the ratio climbs ~2.5pp a
year. And if nominal growth falls to 4% — which is what Scenario C describes —
r exceeds g and the path becomes self-reinforcing. The correct conclusion is not
"debt is fine". It is that **the fiscal risk and the recession risk are the same
risk**, which means Scenario C is the fiscal tail, not Scenario B.

### 5.4 Bandwagon vs fundamental
The term premium is itself decomposed into components with a fundamental owner
(supply, inflation uncertainty, foreign withdrawal) and components without
(dealer balance-sheet scarcity, positioning residual). The second group is what
can vanish in a week with no news, and it is the quantitative basis for D.

### 5.5 Asymmetry
Every expression states its payoff shape — `linear-bounded`, `convex`, or
`multiplicative` — and its reward-to-risk. Being long the long bond at 5.14% and
being right gets you to maybe 4.50%: a bounded, linear 64bp. There is no version
of that trade that pays five times. Convexity must be manufactured deliberately
or it will not be there, and the audit warns if the book contains none.

### 5.6 Cross-asset chains
Trace the flow; never stop at "rates up, stocks down". The chain that matters
most currently: high rates → $0.94tn of interest income → low-MPC holders must
redeploy it → $184bn of AI and hyperscaler IG issuance absorbed → data-centre
capex → the equity complex becomes *more* levered **because** rates are high.
The transmission from rates to equities is not one-signed, which is why an
index-level view on rates has been useless this cycle.

---

## 6. The self-check

Leviathan §7 is a checklist the analyst is meant to run before delivering. Here
it is executable code in `app/src/lib/audit.ts`, run on every page load, with
results rendered at the top of every tab.

Current checks:

| Check | Enforces |
|---|---|
| Probabilities sum to 100 | Leviathan §3.5 |
| Probabilities moved vs prior run | Bayesian hygiene — a framework that never updates is anchoring |
| Path `Today` row matches the anchor | Leviathan §3.4 |
| Path rows in time order | Internal consistency |
| Deep inversions are explained, not tabled | Leviathan §5 |
| Both 10y decompositions reconcile independently | Leviathan §5 Part 1 |
| Every observation has source and date | Leviathan §3.1–3.3 |
| No `[D]` observation past its staleness limit | Leviathan §3.3 |
| Every trade has an invalidation and a stop | Leviathan §7 |
| The book contains a non-linear payoff | Sehgal §6 |
| Reward-to-risk ≥ 1:1 on every expression | Common sense |
| No expression claims to work in every scenario | Common sense |
| Every scenario has at least one expression | Common sense |

**Two design rules.** First, a check that cannot fail is decoration — these are
written to be capable of failing, and at the time of writing two are firing
(a deliberately sub-1:1 mean-reversion hedge, and a stale core PCE print).
Second, the panel states its own limit: passing means the numbers agree with
each other and with their stated provenance. It says nothing about whether the
view is right.

---

## 7. Known weaknesses

Listed because a methodology document that only describes strengths is marketing.

1. **The snapshot is manual.** Between refreshes the framework decays. It flags
   its own staleness, which is mitigation, not a fix. Wiring the `[D]` series to
   FRED and the NY Fed is the single highest-value next change.
2. **Term premium inherits model error.** Everything built on ACM — the L2
   signal, the attribution, the OP-30 indicator — carries the 13bp ACM/Kim-Wright
   disagreement inside it, and there is no way to separate model error from
   market information.
3. **MPC coefficients are reasoned, not estimated.** The flow decomposition is
   directionally robust (the conclusion survives any plausible coefficient set)
   but the precise 3.2%-of-GDP figure should not be quoted to one decimal.
4. **No backtest.** Scenario probabilities and scorecard shifts are judgement.
   The `priorProbability` field is the beginning of a track record; it is not one
   yet. Until several runs accumulate, the calibration is unknown.
5. **The term-premium attribution is not identified.** Splitting 78bp into five
   components is an argument with numbers attached, not a decomposition anyone
   could replicate from data.
6. **Equity sector reads are qualitative.** No factor model sits behind them.
   They are transmission reasoning, and should be read as direction and rank
   order rather than magnitude.

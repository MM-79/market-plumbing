# Changelog

Newest first. Each entry records what changed, and — more usefully — what the
previous run got wrong.

---

## v3.0 — 2026-09-24

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

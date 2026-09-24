import { useState } from 'react';
import {
  buildDualNarratives, flowChannels, debtResult, stimulusResult, fiscalCommentary,
  termPremiumAttribution, crossAssetChains, asymmetryCommentary, fiscalInputs,
} from '../data/sehgalLens';
import { debtDynamics } from '../lib/fiscal';
import type { Snapshot } from '../lib/snapshot';
import { val } from '../lib/snapshot';

/**
 * The Sehgal Macro Lens.
 *
 * This tab exists to argue with the rest of the application. The diagnostic
 * spine measures things; this measures what the measurements MEAN for who
 * receives the money, and it reaches a materially softer conclusion on the
 * fiscal question than the Meat Grinder layer does. Both are on the page. The
 * reader gets to see the framework disagree with itself, which is the only
 * honest way to present a view that rests on a contested decomposition.
 */
export function SehgalTab({ snap }: { snap: Snapshot }) {
  const inputs = fiscalInputs(snap);
  const base = debtResult(snap);
  const channels = flowChannels(snap);
  const stimulus = stimulusResult(snap);
  const commentary = fiscalCommentary(snap);
  const dualNarratives = buildDualNarratives(snap);
  const tp = val(snap, 'kimWright10y');

  // Live sensitivity on the two inputs the whole debt argument turns on.
  const [growth, setGrowth] = useState(inputs.nominalGrowthPct);
  const [effRate, setEffRate] = useState(base.effectiveRatePct);
  const live = debtDynamics({
    ...inputs,
    nominalGrowthPct: growth,
    netInterest: (effRate / 100) * inputs.debtHeldByPublic,
  });

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------- dual narratives --- */}
      <div className="panel">
        <div className="panel-header text-terminal-accent">
          1. THE DUAL-NARRATIVE LEDGER &mdash; WHAT THE MARKET IS TELLING vs WHAT THE FED IS TELLING
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-terminal-muted leading-relaxed">
            The rule: never present a single consensus view. For every material development there
            is the market&rsquo;s telling &mdash; forward-looking, behavioural, visible in
            positioning &mdash; and the policymaker&rsquo;s telling, which is backward-looking and
            mandate-driven. Where they converge, conviction is high. Where they diverge, the
            divergence itself is the trade. What follows never blends the two.
          </p>
          {dualNarratives.map((d, i) => (
            <div key={i} className="border border-terminal-border rounded overflow-hidden">
              <div className="bg-terminal-bg px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-bold text-terminal-text">{d.issue}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  d.pricedAs === 'market' ? 'text-info-blue border-info-blue/40'
                  : d.pricedAs === 'fed' ? 'text-neutral-amber border-neutral-amber/40'
                  : 'text-terminal-muted border-terminal-border'
                }`}>
                  PRICED AS: {d.pricedAs.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-terminal-border">
                <div className="bg-terminal-panel p-3">
                  <div className="text-[10px] font-bold text-info-blue uppercase tracking-wider mb-1">In the market&rsquo;s telling</div>
                  <p className="text-[11px] text-terminal-muted leading-relaxed">{d.marketTelling}</p>
                </div>
                <div className="bg-terminal-panel p-3">
                  <div className="text-[10px] font-bold text-neutral-amber uppercase tracking-wider mb-1">In the Fed&rsquo;s telling</div>
                  <p className="text-[11px] text-terminal-muted leading-relaxed">{d.fedTelling}</p>
                </div>
              </div>
              <div className="bg-terminal-accent/5 border-t border-terminal-border p-3">
                <div className="text-[10px] font-bold text-terminal-accent uppercase tracking-wider mb-1">The divergence is the signal</div>
                <p className="text-[11px] text-terminal-text leading-relaxed">{d.divergence}</p>
                <p className="text-[10px] text-terminal-muted mt-2">
                  <span className="text-terminal-accent font-semibold">RESOLVED BY:</span> {d.resolvedBy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------ flow of funds --- */}
      <div className="panel">
        <div className="panel-header text-terminal-accent">
          2. FOLLOW THE FLOWS &mdash; A DOLLAR OF DEFICIT IS NOT A DOLLAR OF STIMULUS
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-terminal-text leading-relaxed">{commentary.headline}</p>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>$tn</th>
                  <th>Accrues to</th>
                  <th>MPC [E]</th>
                  <th>Demand impulse</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((c, i) => (
                  <tr key={i}>
                    <td className="text-terminal-text font-semibold">{c.channel}</td>
                    <td className="font-mono">{c.amountTn.toFixed(2)}</td>
                    <td>
                      <span className={`signal-badge ${
                        c.accruesTo === 'labour' ? 'signal-bullish'
                        : c.accruesTo === 'capital' ? 'signal-bearish' : 'signal-neutral'
                      }`}>{c.accruesTo.toUpperCase()}</span>
                    </td>
                    <td className="font-mono">{c.mpc.toFixed(2)}</td>
                    <td className="font-mono text-terminal-accent">{(c.amountTn * c.mpc).toFixed(2)}</td>
                    <td className="text-[10px] text-terminal-muted">{c.rationale}</td>
                  </tr>
                ))}
                <tr className="bg-terminal-accent/10 font-bold">
                  <td className="text-terminal-accent">TOTAL</td>
                  <td className="font-mono">{stimulus.headlineTn.toFixed(2)}</td>
                  <td colSpan={2} className="text-[10px] text-terminal-muted">
                    Headline {stimulus.headlinePctGdp.toFixed(1)}% of GDP
                  </td>
                  <td className="font-mono text-terminal-accent">{stimulus.effectiveTn.toFixed(2)}</td>
                  <td className="text-[10px] text-terminal-text">
                    Effective impulse {stimulus.effectivePctGdp.toFixed(1)}% of GDP.
                    Aggregate multiplier {stimulus.multiplier.toFixed(2)}.
                    Leakage to low-MPC hands: ${stimulus.leakageTn.toFixed(2)}tn.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-bear-red/5 border border-bear-red/25 rounded p-3">
              <div className="text-[10px] font-bold text-bear-red uppercase tracking-wider mb-1">The reflexive loop</div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">{commentary.theReflexiveLoop}</p>
            </div>
            <div className="bg-info-blue/5 border border-info-blue/25 rounded p-3">
              <div className="text-[10px] font-bold text-info-blue uppercase tracking-wider mb-1">Endogenous or exogenous growth?</div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">{commentary.theEndogeneityQuestion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------- debt dynamics --- */}
      <div className="panel">
        <div className="panel-header text-terminal-accent">
          3. DEBT SUSTAINABILITY &mdash; THE EQUATION, NOT THE ADJECTIVE
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-terminal-bg border border-terminal-border rounded p-3">
            <div className="text-xs font-mono text-terminal-accent text-center">
              d(D/Y) = primary deficit / Y + (r &minus; g) &times; (D/Y)
            </div>
            <p className="text-[10px] text-terminal-muted text-center mt-1">
              where r is the EFFECTIVE rate paid on the stock, not the marginal rate on new issuance,
              and g is NOMINAL growth, not real. The entire debate reduces to the sign of (r &minus; g).
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { k: 'Debt held by public', v: `${(base.debtToGdp * 100).toFixed(0)}% of GDP` },
              { k: 'Headline deficit', v: `${base.headlineDeficitPctGdp.toFixed(1)}%` },
              { k: 'of which net interest', v: `${base.netInterestPctGdp.toFixed(1)}%`, alert: true },
              { k: 'Primary deficit', v: `${base.primaryDeficitPctGdp.toFixed(1)}%` },
            ].map((m) => (
              <div key={m.k} className="bg-terminal-bg border border-terminal-border rounded p-3">
                <div className="text-[10px] text-terminal-muted">{m.k}</div>
                <div className={`text-lg font-bold font-mono ${m.alert ? 'text-bear-red' : 'text-terminal-accent'}`}>{m.v}</div>
              </div>
            ))}
          </div>

          {/* live sensitivity */}
          <div className="bg-terminal-bg border border-terminal-border rounded p-4 space-y-3">
            <div className="text-xs font-bold text-terminal-accent uppercase tracking-wider">
              Live sensitivity &mdash; drag the two inputs that decide everything
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[11px] text-terminal-muted">
                  Nominal GDP growth (g): <span className="text-terminal-accent font-mono font-bold">{growth.toFixed(1)}%</span>
                </span>
                <input
                  type="range" min={2} max={8} step={0.1} value={growth}
                  onChange={(e) => setGrowth(Number(e.target.value))}
                  className="w-full accent-amber-500 mt-1"
                />
              </label>
              <label className="block">
                <span className="text-[11px] text-terminal-muted">
                  Effective rate on the stock (r): <span className="text-terminal-accent font-mono font-bold">{effRate.toFixed(2)}%</span>
                </span>
                <input
                  type="range" min={1} max={7} step={0.05} value={effRate}
                  onChange={(e) => setEffRate(Number(e.target.value))}
                  className="w-full accent-amber-500 mt-1"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-[10px] text-terminal-muted">r &minus; g</div>
                <div className={`text-lg font-bold font-mono ${live.rMinusG < 0 ? 'text-bull-green' : 'text-bear-red'}`}>
                  {live.rMinusG > 0 ? '+' : ''}{live.rMinusG.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-terminal-muted">Snowball term</div>
                <div className={`text-lg font-bold font-mono ${live.snowballPctGdp < 0 ? 'text-bull-green' : 'text-bear-red'}`}>
                  {live.snowballPctGdp > 0 ? '+' : ''}{live.snowballPctGdp.toFixed(2)}pp
                </div>
              </div>
              <div>
                <div className="text-[10px] text-terminal-muted">Debt/GDP change per year</div>
                <div className={`text-lg font-bold font-mono ${live.annualChangePctGdp < 1.5 ? 'text-bull-green' : live.annualChangePctGdp < 3 ? 'text-neutral-amber' : 'text-bear-red'}`}>
                  {live.annualChangePctGdp > 0 ? '+' : ''}{live.annualChangePctGdp.toFixed(2)}pp
                </div>
              </div>
              <div>
                <div className="text-[10px] text-terminal-muted">Years to 150% debt/GDP</div>
                <div className="text-lg font-bold font-mono text-terminal-text">
                  {live.yearsTo150 === null ? 'never' : `${Math.round(live.yearsTo150)}y`}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-terminal-text leading-relaxed border-t border-terminal-border pt-2">{live.verdict}</p>
          </div>

          <div className="bg-bear-red/5 border border-bear-red/25 rounded p-3">
            <div className="text-[10px] font-bold text-bear-red uppercase tracking-wider mb-1">
              The honest counter &mdash; read this before quoting the comfortable arithmetic
            </div>
            <p className="text-[11px] text-terminal-muted leading-relaxed">{commentary.theHonestCounter}</p>
          </div>
        </div>
      </div>

      {/* --------------------------------------- term premium attribution -- */}
      <div className="panel">
        <div className="panel-header text-terminal-accent">
          4. BANDWAGON vs FUNDAMENTAL &mdash; DECOMPOSING THE TERM PREMIUM ITSELF
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-terminal-muted leading-relaxed">
            When everyone is worried about the long end, that consensus is itself a reason the long
            end is cheap &mdash; and the crowd cannot exit through a door it is standing in. The
            question is how much of the {tp !== null ? Math.round(tp) : termPremiumAttribution.totalBp}bp has a fundamental owner
            and how much is simply a crowded position.
          </p>
          <div className="space-y-1">
            {termPremiumAttribution.components.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-56 shrink-0 text-[11px] text-terminal-text">{c.name}</div>
                <div className="flex-1 h-5 bg-terminal-bg rounded overflow-hidden border border-terminal-border">
                  <div
                    className={`h-full ${c.durable ? 'bg-bear-red/60' : 'bg-neutral-amber/70'}`}
                    style={{ width: `${(c.bp / termPremiumAttribution.totalBp) * 100}%` }}
                  />
                </div>
                <div className="w-14 shrink-0 text-right font-mono text-xs text-terminal-accent">
                  {c.bp}bp
                </div>
                <div className={`w-20 shrink-0 text-[9px] font-bold ${c.durable ? 'text-bear-red' : 'text-neutral-amber'}`}>
                  {c.durable ? 'DURABLE' : 'FRAGILE'}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-bear-red/10 border border-bear-red/30 rounded p-3 text-center">
              <div className="text-[10px] text-terminal-muted">Durable (fundamental owner)</div>
              <div className="text-2xl font-bold text-bear-red font-mono">{termPremiumAttribution.durableBp}bp</div>
            </div>
            <div className="bg-neutral-amber/10 border border-neutral-amber/30 rounded p-3 text-center">
              <div className="text-[10px] text-terminal-muted">Fragile (no fundamental owner)</div>
              <div className="text-2xl font-bold text-neutral-amber font-mono">{termPremiumAttribution.fragileBp}bp</div>
            </div>
            <div className="bg-bull-green/10 border border-bull-green/30 rounded p-3 text-center">
              <div className="text-[10px] text-terminal-muted">Squeeze capacity with no macro change</div>
              <div className="text-2xl font-bold text-bull-green font-mono">40-45bp</div>
            </div>
          </div>
          <p className="text-[11px] text-terminal-text leading-relaxed bg-terminal-bg border border-terminal-border rounded p-3">
            {termPremiumAttribution.implication}
          </p>
          <div className="text-[10px] text-terminal-muted italic">
            Component splits are [E] and [I]. They are reasoned attributions of an unobservable
            residual, not measurements. Anyone quoting them to the basis point, including this page,
            is overstating their precision &mdash; which is exactly the criticism this section levels
            at the term premium models themselves.
          </div>
        </div>
      </div>

      {/* --------------------------------------------- cross-asset chains -- */}
      <div className="panel">
        <div className="panel-header text-terminal-accent">
          5. CROSS-ASSET CHAINS &mdash; TRACE THE FLOW, DO NOT STOP AT &ldquo;RATES UP, STOCKS DOWN&rdquo;
        </div>
        <div className="p-4 space-y-4">
          {crossAssetChains.map((c, i) => (
            <div key={i} className="bg-terminal-bg border border-terminal-border rounded p-4">
              <div className="text-xs font-bold text-terminal-accent mb-2">{c.title}</div>
              <ol className="space-y-1 mb-3">
                {c.steps.map((s, j) => (
                  <li key={j} className="text-[11px] text-terminal-muted flex gap-2">
                    <span className="text-terminal-accent font-mono shrink-0">{j + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <div className="border-t border-terminal-border pt-2 space-y-2">
                <p className="text-[11px] text-terminal-text leading-relaxed">
                  <span className="text-terminal-accent font-semibold">SO WHAT: </span>{c.implication}
                </p>
                <p className="text-[10px] text-terminal-muted leading-relaxed">
                  <span className="text-bear-red font-semibold">FALSIFICATION: </span>{c.falsification}
                  <span className="ml-2 text-terminal-muted/60">[{c.tag}]</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------ asymmetry note -- */}
      <div className="panel">
        <div className="panel-header text-terminal-accent">
          6. THE ASYMMETRY TEST &mdash; APPLIED TO THE BOOK
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-terminal-text leading-relaxed">{asymmetryCommentary.principle}</p>
          <p className="text-xs text-terminal-muted leading-relaxed">{asymmetryCommentary.bookLevelObservation}</p>
          <p className="text-[11px] text-terminal-muted italic">
            The per-trade payoff shapes and reward-to-risk ratios are on the Synthesis tab, and the
            self-check flags any expression falling below 1:1 whether or not it is defended in prose.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SehgalTab;

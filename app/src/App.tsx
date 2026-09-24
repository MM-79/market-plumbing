import { useState, useMemo } from 'react';
import {
  runSettings, anchorCheck, parCurve, anchor, observations,
  diagnosticLayers, decompositions, SOURCES,
} from './data/marketData';
import { scenarios, scenarioList, fedToolkitLadder, inventedFacility, fedProbabilityTree } from './data/scenarios';
import { scorecard, trades, watchlist } from './data/synthesis';
import { institutionImpacts, treasuryActions, exoticChains, inventedIndicator } from './data/institutionData';
import {
  soWhat_Part0, soWhat_Part1, soWhat_Part2, soWhat_Part3, soWhat_Part4,
  soWhat_Part5, soWhat_Part6, soWhat_Appendix, soWhat_ScenarioD,
} from './data/soWhatData';
import SoWhatSection from './components/SoWhatSection';
import CurveChart from './components/CurveChart';
import SehgalTab from './components/SehgalTab';
import { AuditBar, AuditPanel } from './components/AuditPanel';
import {
  spreads, classifyRegime, bootstrapDiscountFactors, forwardRate, dv01PerMM,
  dv01NeutralRatio, spreadCarryRoll, decompositionCheck,
} from './lib/curve';
import {
  auditProbabilities, auditPaths, auditDecompositions, auditProvenance,
  auditTrades, summarise,
} from './lib/audit';

type Tab = 'dashboard' | 'directive' | 'lens' | 'scenarios' | 'policy'
  | 'synthesis' | 'institution' | 'exotic' | 'audit' | 'sources';

/**
 * Tailwind v4 generates utilities by scanning source for LITERAL class strings.
 * A class built as `text-${tone}` is never emitted and silently renders
 * unstyled. Every conditional colour therefore resolves through this map, where
 * each value is a literal the scanner can see.
 */
type Tone = 'bear-red' | 'bull-green' | 'neutral-amber' | 'info-blue' | 'muted';
const TONE: Record<Tone, { text: string; tint: string; ring: string; edge: string }> = {
  'bear-red':      { text: 'text-bear-red',      tint: 'bg-bear-red/10',      ring: 'border-bear-red/30',      edge: 'border-bear-red/50' },
  'bull-green':    { text: 'text-bull-green',    tint: 'bg-bull-green/10',    ring: 'border-bull-green/30',    edge: 'border-bull-green/50' },
  'neutral-amber': { text: 'text-neutral-amber', tint: 'bg-neutral-amber/10', ring: 'border-neutral-amber/30', edge: 'border-neutral-amber/50' },
  'info-blue':     { text: 'text-info-blue',     tint: 'bg-info-blue/10',     ring: 'border-info-blue/30',     edge: 'border-info-blue/50' },
  'muted':         { text: 'text-terminal-muted', tint: 'bg-terminal-bg',     ring: 'border-terminal-border',  edge: 'border-terminal-border' },
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'P0 · Dashboard' },
  { id: 'directive', label: 'P1 · Directive' },
  { id: 'lens', label: 'Macro Lens' },
  { id: 'scenarios', label: 'P2-4 · Scenarios' },
  { id: 'policy', label: 'P4b · Fed Reaction' },
  { id: 'synthesis', label: 'P5 · Synthesis' },
  { id: 'institution', label: 'P6 · Bank Treasury' },
  { id: 'exotic', label: 'Appendix · Exotic' },
  { id: 'audit', label: 'Self-Check' },
  { id: 'sources', label: 'Sources' },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const audit = useMemo(() => summarise([
    ...auditProbabilities(scenarioList),
    ...auditPaths(scenarioList, anchor),
    ...auditDecompositions(decompositions),
    ...auditProvenance(observations, runSettings.asOfDate),
    ...auditTrades(trades, scenarioList.length),
  ]), []);

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      <header className="border-b border-terminal-border bg-terminal-panel">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-bull-green pulse-live" />
              <h1 className="text-lg font-bold text-terminal-accent glow-amber tracking-wider">YIELD-CURVE-PRIME</h1>
              <span className="text-xs text-terminal-muted">v3.0 · Market Plumbing Intelligence</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-terminal-muted">
              <span>AS OF: <span className="text-terminal-text">{runSettings.asOfDate}</span></span>
              <span>PRIOR: <span className="text-terminal-text">{runSettings.priorRunDate}</span></span>
              <span>VOICE: <span className="text-terminal-accent">{runSettings.voiceLabel}</span></span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[10px] text-terminal-muted border-t border-terminal-border pt-2">
            <span>HORIZON: <span className="text-terminal-text">{runSettings.scenarioHorizon}</span></span>
            <span>INSTITUTION LENS: <span className="text-bull-green">{runSettings.institutionLens}</span></span>
            <span>MACRO LENS: <span className="text-bull-green">{runSettings.macroLens}</span></span>
            <span>EXOTIC: <span className="text-bull-green">{runSettings.exoticAppendix}</span></span>
            <span>FOCUS: <span className="text-terminal-accent italic">{runSettings.focusQuestion}</span></span>
          </div>
        </div>
      </header>

      <nav className="border-b border-terminal-border bg-terminal-panel/50 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-3 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors ${
                  activeTab === t.id ? 'tab-active' : 'tab-inactive'
                }`}
              >
                {t.label}
                {t.id === 'audit' && audit.fails > 0 && (
                  <span className="ml-1.5 text-bear-red">●</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-4 py-4 space-y-4">
        <AuditBar summary={audit} onOpen={() => setActiveTab('audit')} />
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'directive' && <DirectiveTab />}
        {activeTab === 'lens' && <SehgalTab />}
        {activeTab === 'scenarios' && <ScenariosTab />}
        {activeTab === 'policy' && <PolicyTab />}
        {activeTab === 'synthesis' && <SynthesisTab />}
        {activeTab === 'institution' && <InstitutionTab />}
        {activeTab === 'exotic' && <ExoticTab />}
        {activeTab === 'audit' && <AuditPanel summary={audit} />}
        {activeTab === 'sources' && <SourcesTab />}
      </main>

      <footer className="border-t border-terminal-border bg-terminal-panel py-3 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 text-center text-[10px] text-terminal-muted space-y-1">
          <div className="text-terminal-text font-semibold">Analytical framework, not investment advice.</div>
          <div>
            Tags: [D] data, dated and sourced · [E] estimate, method stated · [I] inference · [S] speculation.
            All figures are a hand-maintained snapshot; see docs/REFRESH_RUNBOOK.md. Nothing on this page updates itself.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================ DASHBOARD ====

function DashboardTab() {
  const sp = spreads(anchor);
  const df = useMemo(() => bootstrapDiscountFactors(parCurve), []);
  const f5y5y = forwardRate(df, 5, 5);
  const f10y20y = forwardRate(df, 10, 20);
  const todayRow = scenarios.A.path[0];

  return (
    <div className="space-y-4">
      {/* what changed */}
      <div className="panel">
        <div className="panel-header flex items-center gap-2">
          <span className="text-terminal-accent">⚡</span> WHAT CHANGED SINCE {anchorCheck.priorRun}
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Field</th><th>Prior run</th><th>Now</th><th>Delta</th><th>Note</th><th>Status</th></tr>
            </thead>
            <tbody>
              {anchorCheck.corrections.map((c, i) => (
                <tr key={i}>
                  <td className="font-semibold text-terminal-text">{c.field}</td>
                  <td className="text-terminal-muted font-mono">{c.prior}</td>
                  <td className="text-terminal-text font-mono">{c.now}</td>
                  <td className={`font-mono ${c.delta.startsWith('+') ? 'text-bear-red' : c.delta.startsWith('-') ? 'text-bull-green' : 'text-terminal-muted'}`}>{c.delta}</td>
                  <td className="text-terminal-muted text-[10px]">{c.note}</td>
                  <td>
                    <span className={`signal-badge ${
                      c.status === 'corrected' ? 'signal-bearish'
                      : c.status === 'stale' ? 'signal-neutral'
                      : c.status === 'verified' ? 'signal-bullish' : 'signal-neutral'
                    }`}>{c.status.toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* curve + derived */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="panel lg:col-span-2">
          <div className="panel-header">PAR CURVE &mdash; {runSettings.asOfDate}</div>
          <div className="p-3">
            <CurveChart rows={[{ label: 'Today', row: todayRow }]} title="US Treasury par yields, log tenor axis" />
            <div className="grid grid-cols-3 gap-2 mt-2 text-center border-t border-terminal-border pt-2">
              {[
                { k: '2s10s', v: sp.s2s10 }, { k: '5s30s', v: sp.s5s30 }, { k: '2s30s', v: sp.s2s30 },
              ].map((x) => (
                <div key={x.k}>
                  <div className="text-[10px] text-terminal-muted">{x.k}</div>
                  <div className="text-sm font-bold font-mono text-bull-green">+{x.v}bp</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-terminal-muted mt-2 border-t border-terminal-border pt-2">
              Every spread above is computed from the four par yields by <code>lib/curve.ts</code>.
              None is typed. In v1 this panel and the scenario tables disagreed by 18bp because both
              were typed by hand from different snapshots.
            </div>
          </div>
        </div>

        <div className="panel lg:col-span-3">
          <div className="panel-header">DERIVED ANALYTICS &mdash; BOOTSTRAPPED FROM THE PAR CURVE</div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { k: '5y5y forward', v: `${f5y5y.toFixed(2)}%`, note: 'Terminal rate plus the premium demanded to own it. The tenor the Parts 1-2 argument is actually about.' },
              { k: '10y20y forward', v: `${f10y20y.toFixed(2)}%`, note: 'The pure long-end forward. Carries almost no policy-path content at all.' },
              { k: '2s5s10s fly', v: `${sp.fly2s5s10}bp`, note: 'Negative = belly rich to the wings. The cheapest way to own the plateau-vs-summit disagreement.' },
              { k: '5s10s30s fly', v: `${sp.fly5s10s30}bp`, note: 'The long-end butterfly. Positive = 10y cheap to its wings.' },
              { k: '10y DV01 / $1mm', v: `$${dv01PerMM(anchor.y10, 10).toFixed(0)}`, note: 'Par bond closed form, semiannual.' },
              { k: '30y DV01 / $1mm', v: `$${dv01PerMM(anchor.y30, 30).toFixed(0)}`, note: '3.4x the 5y, 1.9x the 10y. Ignore this and a curve trade becomes an accidental duration position.' },
              { k: '5s30s DV01-neutral', v: `${dv01NeutralRatio({ parYieldPct: anchor.y5, years: 5 }, { parYieldPct: anchor.y30, years: 30 }).frontPer100mmBack.toFixed(0)}mm`, note: '5y notional per $100mm of 30y.' },
              { k: '5s30s 3m carry+roll', v: `${spreadCarryRoll(parCurve, 5, 30, 3).netRollBp > 0 ? '+' : ''}${spreadCarryRoll(parCurve, 5, 30, 3).netRollBp}bp`, note: 'Roll-down on the spread, curve held still.' },
            ].map((m) => (
              <div key={m.k} className="bg-terminal-bg border border-terminal-border rounded p-2">
                <div className="text-[10px] text-terminal-muted">{m.k}</div>
                <div className="text-base font-bold font-mono text-terminal-accent">{m.v}</div>
                <div className="text-[9px] text-terminal-muted/80 leading-snug mt-1">{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* upshot */}
      <div className="panel">
        <div className="panel-header">THE UPSHOT &mdash; THREE SENTENCES</div>
        <div className="p-4 space-y-3 text-sm leading-relaxed">
          <p>
            <span className="text-terminal-accent font-bold">DRIVER: </span>
            The 10y is 102bp above its February low, and the decomposition matters more than the
            number: roughly 70bp is expected policy path and 32bp is term premium, which means the
            fiscal supply story owns about a third of the move rather than all of it. Since Jackson
            Hole the mix has tilted toward the long end &mdash; a measured bear steepener, 30y
            outrunning 10y by 10bp &mdash; but even in that window term premium is only 12 of 32bp.
          </p>
          <p>
            <span className="text-terminal-accent font-bold">RISK BALANCE: </span>
            Muddle-through at 45% remains the base case, the fiscal meltdown at 22% is real but
            resolvable by a Treasury press release rather than a crisis, and stagflationary breakage
            at 23% is the genuine fiscal tail because it is the only path where nominal growth falls
            below the effective coupon. The new line is Scenario D at 10%: about 22bp of the 78bp
            term premium has no fundamental owner, which is enough fuel for a 40-45bp rally that
            requires nothing at all to change about the deficit, the Fed, or the foreign bid.
          </p>
          <p>
            <span className="text-terminal-accent font-bold">WATCH: </span>
            Two dates, in this order. The August PCE print on 26 September is the largest single
            information event in this run and it can move 8pp in either direction on one number. The
            7 November refunding is the cheapest possible resolution of the entire fiscal argument:
            a bill share guided above 22% removes roughly $40B a month of duration and kills
            Scenario B on the announcement, not on the data.
          </p>
        </div>
      </div>

      {/* diagnostic spine */}
      <div className="panel">
        <div className="panel-header">DIAGNOSTIC SPINE &mdash; SIX LAYERS, EACH WITH ITS OWN STRONGEST COUNTER</div>
        <div className="p-4 space-y-4">
          <p className="text-[11px] text-terminal-muted">
            v1 change: every layer now carries a <span className="text-terminal-accent">STEELMAN</span> &mdash;
            the best available argument that the layer&rsquo;s own signal is wrong &mdash; and a
            <span className="text-terminal-accent"> FLIPS ON</span> line naming the single observable
            that would change it. A six-layer dashboard where all six agree is not six pieces of
            evidence; it is one piece of evidence counted six times.
          </p>
          {diagnosticLayers.map((l) => (
            <div key={l.id} className="border border-terminal-border rounded overflow-hidden">
              <div className="bg-terminal-bg px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-terminal-accent">{l.id}</span>
                  <span className="text-sm font-bold text-terminal-text">{l.name}</span>
                  <span className="text-[10px] text-terminal-muted">{l.subtitle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`signal-badge ${
                    l.signal === 'BEARISH' ? 'signal-bearish' : l.signal === 'BULLISH' ? 'signal-bullish' : 'signal-neutral'
                  }`}>{l.signal}</span>
                  <span className="text-[10px] text-terminal-muted">{l.signalDetail}</span>
                  <span className={`text-[10px] font-bold ${
                    l.confidence === 'HIGH' ? 'text-bull-green' : l.confidence === 'MED' ? 'text-neutral-amber' : 'text-terminal-muted'
                  }`}>CONF {l.confidence}</span>
                </div>
              </div>
              <div className="p-3 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {l.metrics.map((m) => (
                    <span key={m.name} className="text-[10px] bg-terminal-bg border border-terminal-border rounded px-1.5 py-0.5">
                      <span className="text-terminal-muted">{m.name}</span>{' '}
                      <span className="text-terminal-text font-mono">{m.value}</span>{' '}
                      <span className="text-terminal-muted/50">[{m.tag}]</span>
                    </span>
                  ))}
                </div>
                <p className="text-xs leading-relaxed">{l.narrative}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-info-blue/5 border border-info-blue/25 rounded p-2.5">
                    <div className="text-[10px] font-bold text-info-blue uppercase tracking-wider mb-1">Steelman &mdash; why this signal may be wrong</div>
                    <p className="text-[11px] text-terminal-muted leading-relaxed">{l.steelman}</p>
                  </div>
                  <div className="bg-neutral-amber/5 border border-neutral-amber/25 rounded p-2.5">
                    <div className="text-[10px] font-bold text-neutral-amber uppercase tracking-wider mb-1">Flips on</div>
                    <p className="text-[11px] text-terminal-muted leading-relaxed">{l.flipsOn}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SoWhatSection data={soWhat_Part0} partTitle="Part 0 — Current State" />
    </div>
  );
}

// ============================================================ DIRECTIVE ====

function DirectiveTab() {
  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header text-terminal-accent">PART 1 &mdash; DECOMPOSING THE MOVE, PER WINDOW, WITH THE REGIME MEASURED</div>
        <div className="p-4 space-y-4">
          <p className="text-xs text-terminal-muted leading-relaxed">
            Two decompositions per window, each summing to the total independently. Path and term
            premium is one camera; real yield and breakeven is another camera on the same object.
            v1 added the two together and got 102bp out of three components that double-counted
            inflation compensation &mdash; it appears inside both path and term premium, never
            alongside them. The regime label under each window is computed by
            <code> classifyRegime()</code> from the 2y and 10y moves, not asserted.
          </p>
          {decompositions.map((d) => {
            const c = decompositionCheck(d);
            return (
              <div key={d.window} className="border border-terminal-border rounded overflow-hidden">
                <div className="bg-terminal-bg px-3 py-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-bold text-terminal-accent">{d.window} ({d.startDate})</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono">{d.startY10.toFixed(2)}% &rarr; {d.endY10.toFixed(2)}%</span>
                    <span className={`font-mono font-bold ${c.totalBp > 0 ? 'text-bear-red' : 'text-bull-green'}`}>
                      {c.totalBp > 0 ? '+' : ''}{c.totalBp}bp
                    </span>
                    <span className="signal-badge signal-bearish uppercase">{c.regime.regime}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-terminal-border">
                  <div className="bg-terminal-panel p-3">
                    <div className="text-[10px] font-bold text-terminal-muted uppercase tracking-wider mb-2">View 1 &mdash; risk-neutral path vs risk premium</div>
                    <Bar label="Expected policy path" bp={d.expectedPathBp} total={c.totalBp} color="bg-info-blue/60" />
                    <Bar label="Term premium (ACM)" bp={d.termPremiumBp} total={c.totalBp} color="bg-bear-red/60" />
                    <div className="text-[10px] text-terminal-muted mt-1">Residual: {c.view1Residual}bp</div>
                  </div>
                  <div className="bg-terminal-panel p-3">
                    <div className="text-[10px] font-bold text-terminal-muted uppercase tracking-wider mb-2">View 2 &mdash; real yield vs inflation compensation</div>
                    <Bar label="Real yield" bp={d.realYieldBp} total={c.totalBp} color="bg-bull-green/60" />
                    <Bar label="Breakeven" bp={d.breakevenBp} total={c.totalBp} color="bg-neutral-amber/60" />
                    <div className="text-[10px] text-terminal-muted mt-1">Residual: {c.view2Residual}bp</div>
                  </div>
                </div>
                <div className="p-3 border-t border-terminal-border bg-terminal-accent/5">
                  <p className="text-[11px] text-terminal-text leading-relaxed">{d.comment}</p>
                  <p className="text-[10px] text-terminal-muted mt-1 font-mono">
                    Measured: 2y {c.regime.d2 > 0 ? '+' : ''}{c.regime.d2}bp · 10y {c.regime.d10 > 0 ? '+' : ''}{c.regime.d10}bp ·
                    2s10s {c.regime.dSlope > 0 ? '+' : ''}{c.regime.dSlope}bp
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header text-terminal-accent">THE THREE-WAY BATTLE &mdash; AND WHAT WOULD FLIP IT</div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {[
              { t: 'RESILIENT DATA', s: 'LOSING SLOWLY', c: 'bull-green' as Tone, d: 'PMIs firm, payrolls 3m avg +118k and decelerating. Not broken, not helping.' },
              { t: 'DURATION SUPPLY', s: 'WINNING', c: 'bear-red' as Tone, d: 'Tails, weak indirects, bill share below TBAC guidance. Winning on the margin, not on the whole move.' },
              { t: 'FED WILL NOT PIVOT', s: 'HOLDING', c: 'neutral-amber' as Tone, d: 'Three dissents to hike. Real policy rate still 67bp below neutral estimates.' },
            ].map((x) => (
              <div key={x.t} className={`p-3 rounded ${TONE[x.c].tint} border ${TONE[x.c].ring}`}>
                <div className={`text-[10px] font-bold ${TONE[x.c].text}`}>{x.t}</div>
                <div className={`text-xl font-bold ${TONE[x.c].text} mt-1`}>{x.s}</div>
                <div className="text-[10px] text-terminal-muted mt-1 leading-snug">{x.d}</div>
              </div>
            ))}
          </div>
          <div className="bg-terminal-bg border border-terminal-border rounded p-3 space-y-2">
            <p className="text-xs text-terminal-text leading-relaxed">
              <span className="font-bold text-terminal-accent">Currently winning: duration supply, but by less than the narrative claims.</span>{' '}
              The market is price-clearing rather than quantity-clearing &mdash; yields rise until the
              marginal buyer engages, and the estimated level at which domestic real money engages in
              size is roughly 5.25% on the 10y [E], about 11bp from here. That is a very different
              statement from &ldquo;there is no buyer&rdquo;, which is incoherent: every bond that
              exists is owned by somebody at every moment.
            </p>
            <p className="text-xs text-terminal-muted leading-relaxed">
              <span className="font-bold text-terminal-text">What flips it: </span>
              (a) a QRA bill-share shift above 22%, which removes the supply without removing the
              deficit; (b) two negative payroll prints, which collapses the whole argument into a
              policy-path story; or (c) the CFTC de-grossing signature, where a record short stops
              producing new yield highs &mdash; the point at which supply stops being the marginal
              price-setter and positioning takes over.
            </p>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header text-terminal-accent">WHY THE LONG END IS WHERE IT IS &mdash; RANKED BY EVIDENTIARY SUPPORT</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { r: 1, t: 'Term premium normalisation', tone: 'bear-red' as Tone, d: 'ACM +78bp from +46bp in February; Kim-Wright +65bp. Both models agree on direction. Worth stating plainly: the 1990-2007 average was above 150bp, so +78bp is not a crisis level, it is the partial removal of a QE-era distortion. [D]' },
            { r: 2, t: 'Duration supply, Treasury and corporate', tone: 'bear-red' as Tone, d: '$128B/month net coupon into a market where IG has already absorbed $1.12tn YTD, $184bn of it AI and hyperscaler paper competing for the same buyer. Bill share at 18.2% is a policy choice adding duration, not absorbing it. [D/E]' },
            { r: 3, t: 'Inflation risk premium from energy', tone: 'neutral-amber' as Tone, d: '5y5y breakevens +24bp from February with WTI at $92. This is compensation for variance, not for level, and it is the component most likely to reverse quickly. [D]' },
            { r: 4, t: 'Foreign demand substitution', tone: 'neutral-amber' as Tone, d: 'The important part is not that Japan is selling - it is that the 30y JGB at 2.64% is a genuine domestic substitute for the first time in twenty years. That is structural and it does not reverse when oil falls. [D/E]' },
            { r: 5, t: 'Dealer balance-sheet scarcity', tone: 'muted' as Tone, d: 'Dealer UST inventory at $284B, above the 90th percentile, with the 10y swap spread at -12bp pricing it directly. Roughly 10bp of the term premium [I]. Mechanically unwinds when inventory clears - this is not a view about America. ' },
            { r: 6, t: 'Positioning and the bandwagon', tone: 'bull-green' as Tone, d: 'Roughly 12bp of term premium with no fundamental owner [I]. Listed last by evidentiary support and first by reversal speed. It is the only component that can vanish in a week with no news, which is exactly why it is the one nobody models.' },
          ].map((x) => (
            <div key={x.r} className="bg-terminal-bg rounded p-3 border border-terminal-border">
              <div className={`text-[10px] font-bold ${TONE[x.tone].text} mb-1`}>{x.r}. {x.t.toUpperCase()}</div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </div>

      <SoWhatSection data={soWhat_Part1} partTitle="Part 1 — The Current Directive" />
    </div>
  );
}

function Bar({ label, bp, total, color }: { label: string; bp: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.abs(bp / total) * 100;
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="w-36 shrink-0 text-[10px] text-terminal-muted">{label}</div>
      <div className="flex-1 h-4 bg-terminal-bg rounded overflow-hidden border border-terminal-border">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <div className="w-12 shrink-0 text-right font-mono text-[11px] text-terminal-accent">
        {bp > 0 ? '+' : ''}{bp}bp
      </div>
    </div>
  );
}

// ============================================================ SCENARIOS ====

function ScenariosTab() {
  const [active, setActive] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const s = scenarios[active];
  const soWhat = { A: soWhat_Part2, B: soWhat_Part3, C: soWhat_Part4, D: soWhat_ScenarioD }[active];

  const startRegime = classifyRegime(s.path[0], s.path[1]);
  const fullRegime = classifyRegime(s.path[0], s.path[s.path.length - 1]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarioList.map((sc) => {
          const delta = sc.probability - sc.priorProbability;
          return (
            <button
              key={sc.key}
              onClick={() => setActive(sc.key)}
              className={`panel p-3 text-left transition-all ${
                active === sc.key ? 'border-terminal-accent ring-1 ring-terminal-accent' : 'hover:border-terminal-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-terminal-accent">SCENARIO {sc.key}</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-bold ${
                    sc.key === 'A' ? 'text-neutral-amber' : sc.key === 'B' ? 'text-bear-red'
                    : sc.key === 'C' ? 'text-info-blue' : 'text-bull-green'
                  }`}>{sc.probability}%</span>
                  <span className={`text-[9px] font-mono ${delta > 0 ? 'text-bull-green' : delta < 0 ? 'text-bear-red' : 'text-terminal-muted'}`}>
                    {delta > 0 ? '+' : ''}{delta}
                  </span>
                </div>
              </div>
              <div className="text-xs font-semibold text-terminal-text leading-tight">{sc.name}</div>
              <div className="text-[10px] text-terminal-muted">{sc.subtitle}</div>
            </button>
          );
        })}
      </div>

      <div className="panel">
        <div className="panel-header flex items-center justify-between flex-wrap gap-2">
          <span><span className="text-terminal-accent">SCENARIO {s.key}:</span> {s.name} &mdash; {s.subtitle}</span>
          <span className="text-terminal-accent font-bold">
            {s.probability}% (prior {s.priorProbability}%)
          </span>
        </div>
        <div className="p-4 space-y-4 text-sm">
          <p className="leading-relaxed">{s.definition}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CurveChart
              rows={[
                { label: 'Today', row: s.path[0] },
                { label: 'Month 3', row: s.path[2], color: '#3b82f6' },
                { label: 'Month 6', row: s.path[3], color: '#10b981' },
              ]}
              title={`Scenario ${s.key} curve path`}
            />
            <div className="space-y-2">
              <div className="bg-terminal-bg border border-terminal-border rounded p-3">
                <div className="text-[10px] font-bold text-terminal-muted uppercase tracking-wider mb-1">Measured regime, not asserted</div>
                <div className="text-xs space-y-1">
                  <div>First month: <span className="text-terminal-accent font-bold uppercase">{startRegime.regime}</span>{' '}
                    <span className="font-mono text-terminal-muted">(2y {startRegime.d2 > 0 ? '+' : ''}{startRegime.d2} · 10y {startRegime.d10 > 0 ? '+' : ''}{startRegime.d10} · slope {startRegime.dSlope > 0 ? '+' : ''}{startRegime.dSlope})</span>
                  </div>
                  <div>Full horizon: <span className="text-terminal-accent font-bold uppercase">{fullRegime.regime}</span>{' '}
                    <span className="font-mono text-terminal-muted">(2y {fullRegime.d2 > 0 ? '+' : ''}{fullRegime.d2} · 10y {fullRegime.d10 > 0 ? '+' : ''}{fullRegime.d10} · slope {fullRegime.dSlope > 0 ? '+' : ''}{fullRegime.dSlope})</span>
                  </div>
                </div>
                <p className="text-[10px] text-terminal-muted mt-2">
                  Where these two disagree, the scenario contains a handover and the curveShape text
                  below has to explain the staging. Scenario C is the clearest case.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-bear-red/5 border border-bear-red/25 rounded p-2.5">
                  <div className="text-[10px] font-bold text-bear-red uppercase mb-1">Triggers already visible</div>
                  <ul className="space-y-0.5">{s.triggers.map((t, i) => <li key={i} className="text-[10px] text-terminal-muted">▸ {t}</li>)}</ul>
                </div>
                <div className="bg-neutral-amber/5 border border-neutral-amber/25 rounded p-2.5">
                  <div className="text-[10px] font-bold text-neutral-amber uppercase mb-1">2-6 week signposts</div>
                  <ul className="space-y-0.5">{s.signposts.map((x, i) => <li key={i} className="text-[10px] text-terminal-muted">◈ {x}</li>)}</ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-terminal-muted uppercase tracking-wider mb-2">
              Path table &mdash; spreads DERIVED from the yields, never typed
            </h4>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th><th>Fed funds</th><th>2y</th><th>5y</th><th>10y</th><th>30y</th>
                    <th>2s10s</th><th>5s30s</th><th>ACM TP</th><th>10y swap spr</th>
                    <th>SOFR-IORB</th><th>30y mort</th><th>IG OAS</th><th>HY OAS</th><th>MOVE</th>
                  </tr>
                </thead>
                <tbody>
                  {s.path.map((r) => {
                    const sp = spreads(r);
                    return (
                      <tr key={r.label} className={r.monthsAhead === 0 ? 'bg-terminal-accent/5' : ''}>
                        <td className="font-bold text-terminal-accent">{r.label}</td>
                        <td className="font-mono">{r.fedFundsLow.toFixed(2)}-{r.fedFundsHigh.toFixed(2)}</td>
                        <td className="font-mono">{r.y2.toFixed(2)}</td>
                        <td className="font-mono">{r.y5.toFixed(2)}</td>
                        <td className="font-mono">{r.y10.toFixed(2)}</td>
                        <td className="font-mono">{r.y30.toFixed(2)}</td>
                        <td className="font-mono text-terminal-accent">{sp.s2s10 > 0 ? '+' : ''}{sp.s2s10}</td>
                        <td className="font-mono text-terminal-accent">{sp.s5s30 > 0 ? '+' : ''}{sp.s5s30}</td>
                        <td className="font-mono">{r.acmTermPremium}</td>
                        <td className="font-mono">{r.swapSpread10y}</td>
                        <td className="font-mono">{r.sofrMinusIorb}</td>
                        <td className="font-mono">{r.mortgage30y.toFixed(2)}</td>
                        <td className="font-mono">{r.igOas}</td>
                        <td className="font-mono">{r.hyOas}</td>
                        <td className="font-mono">{r.move}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Box title="Curve shape — derived from mechanics" tone="info-blue" body={s.curveShape} />
            <Box title="Invalidation — what kills this" tone="bear-red" body={s.invalidation} />
          </div>

          <div className="bg-terminal-bg border border-terminal-border rounded p-3">
            <div className="text-[10px] font-bold text-terminal-accent uppercase tracking-wider mb-1">
              Historical analog: {s.analog.episode}
            </div>
            <p className="text-[11px] text-terminal-muted leading-relaxed mb-2">{s.analog.why}</p>
            <p className="text-[11px] text-terminal-text leading-relaxed">
              <span className="font-semibold text-terminal-accent">Bigger or smaller: </span>{s.analog.biggerOrSmaller}
            </p>
          </div>

          <div className="border border-terminal-border rounded overflow-hidden">
            <div className="bg-terminal-bg px-3 py-1.5 text-[10px] font-bold text-terminal-accent uppercase tracking-wider">
              Dual narrative &mdash; market&rsquo;s telling vs Fed&rsquo;s telling
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-terminal-border">
              <div className="bg-terminal-panel p-3">
                <div className="text-[10px] font-bold text-info-blue uppercase mb-1">Market</div>
                <p className="text-[11px] text-terminal-muted leading-relaxed">{s.dualNarrative.market}</p>
              </div>
              <div className="bg-terminal-panel p-3">
                <div className="text-[10px] font-bold text-neutral-amber uppercase mb-1">Fed</div>
                <p className="text-[11px] text-terminal-muted leading-relaxed">{s.dualNarrative.fed}</p>
              </div>
            </div>
            <div className="bg-terminal-accent/5 border-t border-terminal-border p-3">
              <div className="text-[10px] font-bold text-terminal-accent uppercase mb-1">The divergence is the trade</div>
              <p className="text-[11px] text-terminal-text leading-relaxed">{s.dualNarrative.divergence}</p>
            </div>
          </div>
        </div>
      </div>

      <SoWhatSection data={soWhat} partTitle={`Scenario ${s.key} — ${s.subtitle}`} />
    </div>
  );
}

function Box({ title, tone, body }: { title: string; tone: Tone; body: string }) {
  const c = TONE[tone];
  return (
    <div className={`${c.tint} border ${c.ring} rounded p-3`}>
      <div className={`text-[10px] font-bold ${c.text} uppercase tracking-wider mb-1`}>{title}</div>
      <p className="text-[11px] text-terminal-muted leading-relaxed">{body}</p>
    </div>
  );
}

// =============================================================== POLICY ====

function PolicyTab() {
  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header text-terminal-accent">THE TOOLKIT LADDER &mdash; IN THE ORDER IT ACTUALLY GETS USED</div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-terminal-muted leading-relaxed">
            The ordering matters more than the contents. Each rung is chosen because it is cheaper in
            institutional capital than the one below it, not because it is more effective. Analysts
            who jump straight to &ldquo;the Fed will do QE&rdquo; skip four rungs that between them
            resolve most episodes &mdash; and two of those rungs are not even the Fed&rsquo;s to pull.
          </p>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Tool</th><th>Owner</th><th>Authority</th><th>Trigger</th><th>Mechanics</th><th>Cost</th><th>Speed</th></tr>
              </thead>
              <tbody>
                {fedToolkitLadder.map((t) => (
                  <tr key={t.rung}>
                    <td className="font-bold text-terminal-accent">{t.rung}</td>
                    <td className="font-semibold text-terminal-text">{t.tool}</td>
                    <td className="text-[10px]">{t.owner}</td>
                    <td className="text-[10px] text-terminal-muted">{t.authority}</td>
                    <td className="text-[10px] text-terminal-muted">{t.trigger}</td>
                    <td className="text-[10px] text-terminal-muted">{t.mechanics}</td>
                    <td className="text-[10px] text-terminal-muted">{t.cost}</td>
                    <td className="text-[10px] text-neutral-amber">{t.speed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel border-terminal-accent/40">
        <div className="panel-header text-terminal-accent">
          THE FACILITY THAT DOES NOT EXIST YET &mdash; {inventedFacility.acronym}: {inventedFacility.name.toUpperCase()}
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-terminal-accent italic font-semibold">{inventedFacility.tagline}</p>
          {[
            { k: 'Legal authority', v: inventedFacility.legalAuthority, tone: 'bear-red' as Tone },
            { k: 'Mechanics', v: inventedFacility.mechanics, tone: 'muted' as Tone },
            { k: 'Sizing', v: inventedFacility.sizing, tone: 'muted' as Tone },
            { k: 'Sterilisation', v: inventedFacility.sterilisation, tone: 'muted' as Tone },
            { k: 'Exit', v: inventedFacility.exit, tone: 'muted' as Tone },
            { k: 'Why it is YCC in effect', v: inventedFacility.whyItIsYccInEffect, tone: 'neutral-amber' as Tone },
            { k: 'Why it is not YCC in law', v: inventedFacility.whyItIsNotYccInLaw, tone: 'info-blue' as Tone },
            { k: 'Failure mode', v: inventedFacility.failureMode, tone: 'bear-red' as Tone },
          ].map((x) => (
            <div key={x.k} className={`border-l-2 ${TONE[x.tone].edge} pl-3 py-1`}>
              <div className={`text-[10px] font-bold ${TONE[x.tone].text} uppercase tracking-wider mb-0.5`}>{x.k}</div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">{x.v}</p>
            </div>
          ))}
          <div className="text-[10px] text-terminal-muted italic border-t border-terminal-border pt-2">
            [S] CLAMP is invented. It does not exist and has not been proposed. The legal reasoning
            about Section 14(b) and the 1951 Accord is real; the facility is a thought experiment
            about what the constraint actually is.
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header text-terminal-accent">FED PROBABILITY TREE &mdash; CONDITIONAL ON SCENARIO C</div>
        <div className="p-4 space-y-3">
          <div className="bg-terminal-bg border border-terminal-border rounded p-3 text-xs text-terminal-text">
            <span className="text-terminal-accent font-bold">ROOT: </span>{fedProbabilityTree.root}
          </div>
          <div className="space-y-2">
            {fedProbabilityTree.branches.map((b) => (
              <div key={b.id} className="border border-terminal-border rounded overflow-hidden">
                <div className="bg-terminal-bg px-3 py-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-terminal-accent font-mono">{b.id}</span>
                    <span className="text-xs font-bold text-terminal-text">{b.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 h-2 bg-terminal-border rounded overflow-hidden">
                      <div className="h-full bg-terminal-accent/70" style={{ width: `${b.weight}%` }} />
                    </div>
                    <span className="text-sm font-bold text-terminal-accent font-mono w-10 text-right">{b.weight}%</span>
                  </div>
                </div>
                <div className="p-3 space-y-1.5">
                  <p className="text-[11px]"><span className="text-terminal-muted font-semibold">CONDITION: </span><span className="text-terminal-muted">{b.condition}</span></p>
                  <p className="text-[11px]"><span className="text-info-blue font-semibold">PATH: </span><span className="text-terminal-muted">{b.path}</span></p>
                  <p className="text-[11px]"><span className="text-terminal-accent font-semibold">RATES: </span><span className="text-terminal-text">{b.rateImplication}</span></p>
                  <p className="text-[11px]"><span className="text-bull-green font-semibold">TELL: </span><span className="text-terminal-muted">{b.tell}</span></p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-terminal-muted italic">
            Branch weights are conditional on C having begun and sum to 100. The most useful line on
            this page is C3 at 18%: a bull flattener that persists rather than handing over to a
            steepener is the single most under-priced path in the framework, and it is the one that
            destroys a book positioned for the easing cycle.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================ SYNTHESIS ====

function SynthesisTab() {
  const towardColor = (t: string) =>
    t === 'A' ? 'text-neutral-amber' : t === 'B' ? 'text-bear-red' : t === 'C' ? 'text-info-blue' : 'text-bull-green';

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">SCENARIO SCORECARD &mdash; DECISION RULES, NOT OBSERVATIONS</div>
        <div className="p-4 space-y-2">
          <p className="text-[11px] text-terminal-muted">
            Each rule states the probability shift in percentage points. v1 listed thresholds without
            consequences, which cannot be checked against the tape afterwards. These can.
          </p>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Indicator</th><th>Weight</th><th>Current</th><th>Decision rules</th><th>Next print</th></tr>
              </thead>
              <tbody>
                {scorecard.map((r) => (
                  <tr key={r.indicator}>
                    <td className="font-semibold text-terminal-text">{r.indicator}</td>
                    <td><span className={`signal-badge ${r.weight === 'High' ? 'signal-bearish' : 'signal-neutral'}`}>{r.weight}</span></td>
                    <td className="font-mono text-[10px]">{r.current}</td>
                    <td>
                      <div className="space-y-1">
                        {r.rules.map((rule, i) => (
                          <div key={i} className="text-[10px] text-terminal-muted">
                            {rule.condition} <span className={`font-bold ${towardColor(rule.toward)}`}>&rarr; {rule.shift} to {rule.toward}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="text-[10px] text-neutral-amber">{r.nextPrint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">THE BOOK &mdash; EVERY EXPRESSION WITH ITS ASYMMETRY STATED</div>
        <div className="p-4 space-y-3">
          <p className="text-[11px] text-terminal-muted">
            Illustrative. Units are bp of the traded spread for linear trades and bp of premium for
            option structures, stated per trade because mixing them silently makes a reward-to-risk
            ratio arithmetically meaningless.
          </p>
          {trades.map((t) => {
            const rr = t.targetBp / t.stopBp;
            return (
              <div key={t.name} className="border border-terminal-border rounded overflow-hidden">
                <div className="bg-terminal-bg px-3 py-2 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-terminal-text">{t.name}</span>
                    <span className="signal-badge signal-neutral">{t.type}</span>
                    <span className="text-[10px] text-terminal-muted">Scenario {t.scenarios.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className={`font-bold px-1.5 py-0.5 rounded border ${
                      t.payoffShape === 'multiplicative' ? 'text-bull-green border-bull-green/40'
                      : t.payoffShape === 'convex' ? 'text-info-blue border-info-blue/40'
                      : 'text-terminal-muted border-terminal-border'
                    }`}>{t.payoffShape.toUpperCase()}</span>
                    <span className={`font-mono font-bold ${rr >= 2 ? 'text-bull-green' : rr >= 1 ? 'text-neutral-amber' : 'text-bear-red'}`}>
                      {rr.toFixed(1)}:1
                    </span>
                  </div>
                </div>
                <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="space-y-1 text-[10px]">
                    <div><span className="text-terminal-muted">ENTRY: </span><span className="text-terminal-text">{t.entry}</span></div>
                    <div><span className="text-terminal-muted">SIZING: </span><span className="text-terminal-text">{t.sizing}</span></div>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div><span className="text-terminal-muted">CARRY: </span>
                      <span className={`font-mono ${t.carryBpPerQuarter >= 0 ? 'text-bull-green' : 'text-bear-red'}`}>
                        {t.carryBpPerQuarter > 0 ? '+' : ''}{t.carryBpPerQuarter}bp/qtr
                      </span>
                    </div>
                    <div><span className="text-terminal-muted">TARGET: </span><span className="font-mono text-bull-green">+{t.targetBp}bp</span>
                      <span className="text-terminal-muted"> · STOP: </span><span className="font-mono text-bear-red">-{t.stopBp}bp</span></div>
                    <div><span className="text-terminal-muted">INVALIDATION: </span><span className="text-terminal-text">{t.invalidation}</span></div>
                  </div>
                  <div className="bg-terminal-accent/5 border border-terminal-accent/20 rounded p-2">
                    <div className="text-[9px] font-bold text-terminal-accent uppercase tracking-wider mb-1">Asymmetry</div>
                    <p className="text-[10px] text-terminal-muted leading-relaxed">{t.asymmetryNote}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">WATCHLIST &mdash; NEXT SIX WEEKS</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Event</th><th>Weight</th><th>What would change the view</th></tr></thead>
            <tbody>
              {watchlist.map((w) => (
                <tr key={w.date + w.event} className={w.weight === 'CRITICAL' ? 'bg-terminal-accent/5' : ''}>
                  <td className="font-mono text-terminal-accent whitespace-nowrap">{w.date}</td>
                  <td className="font-semibold text-terminal-text">{w.event}</td>
                  <td><span className={`signal-badge ${w.weight === 'CRITICAL' ? 'signal-bearish' : w.weight === 'HIGH' ? 'signal-neutral' : 'signal-neutral'}`}>{w.weight}</span></td>
                  <td className="text-[10px] text-terminal-muted">{w.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SoWhatSection data={soWhat_Part5} partTitle="Part 5 — Synthesis" />
    </div>
  );
}

// ========================================================== INSTITUTION ====

function InstitutionTab() {
  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">PART 6 &mdash; BANK TREASURY AT A MORTGAGE-SERVICING BANK</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Area</th><th>Current</th>
                <th className="text-neutral-amber">A · Grind</th>
                <th className="text-bear-red">B · Fiscal</th>
                <th className="text-info-blue">C · Stagflation</th>
                <th className="text-bull-green">D · Squeeze</th>
                <th>Own indicator</th>
              </tr>
            </thead>
            <tbody>
              {institutionImpacts.map((r) => (
                <tr key={r.area}>
                  <td className="font-semibold text-terminal-text">{r.area}</td>
                  <td className="text-[10px] font-mono text-terminal-muted">{r.current}</td>
                  <td className="text-[10px] text-terminal-muted">{r.A}</td>
                  <td className="text-[10px] text-terminal-muted">{r.B}</td>
                  <td className="text-[10px] text-terminal-muted">{r.C}</td>
                  <td className="text-[10px] text-terminal-muted">{r.D}</td>
                  <td className="text-[10px] text-bull-green">{r.ownIndicator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">ACTIONS &mdash; WITH TRIGGER, OWNER, LEAD TIME AND COST</div>
        <div className="p-4 space-y-2">
          <p className="text-[11px] text-terminal-muted">
            v1 listed five actions with a priority label and nothing else. An action without an owner
            and a lead time is a wish. Note that three of these have a trigger of &ldquo;now&rdquo;:
            the cheapest insurance is always the insurance bought while nobody wants it.
          </p>
          {treasuryActions.map((a) => (
            <div key={a.action} className="border border-terminal-border rounded p-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-bold text-terminal-text">{a.action}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-terminal-muted">protects {a.protects}</span>
                  <span className={`signal-badge ${a.priority === 'HIGH' ? 'signal-bearish' : 'signal-neutral'}`}>{a.priority}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[10px]">
                <div><span className="text-terminal-muted">TRIGGER: </span><span className="text-terminal-text">{a.trigger}</span></div>
                <div><span className="text-terminal-muted">OWNER: </span><span className="text-terminal-text">{a.owner}</span></div>
                <div><span className="text-terminal-muted">LEAD TIME: </span><span className="text-neutral-amber">{a.leadTime}</span></div>
                <div><span className="text-terminal-muted">COST: </span><span className="text-terminal-text">{a.cost}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SoWhatSection data={soWhat_Part6} partTitle="Part 6 — Institution Lens" />
    </div>
  );
}

// =============================================================== EXOTIC ====

function ExoticTab() {
  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">APPENDIX &mdash; NON-FINANCIAL TRANSMISSION CHAINS</div>
        <div className="p-4 space-y-4">
          {exoticChains.map((c) => (
            <div key={c.name} className="border border-terminal-border rounded overflow-hidden">
              <div className="bg-terminal-bg px-3 py-2 text-xs font-bold text-terminal-accent">
                {c.name} <span className="text-terminal-muted/60 font-normal">[{c.tag}]</span>
              </div>
              <div className="p-3 space-y-2">
                <ol className="space-y-1">
                  {c.chain.map((s, i) => (
                    <li key={i} className="text-[11px] text-terminal-muted flex gap-2">
                      <span className="text-terminal-accent font-mono shrink-0">{i + 1}.</span><span>{s}</span>
                    </li>
                  ))}
                </ol>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-terminal-border pt-2 text-[10px]">
                  <div><span className="text-terminal-muted">SOURCE: </span><span className="text-terminal-text">{c.source}</span></div>
                  <div><span className="text-terminal-muted">LAG: </span><span className="text-terminal-text">{c.lag}</span></div>
                  <div><span className="text-terminal-muted">SIGN: </span><span className="text-terminal-text">{c.sign}</span></div>
                  <div><span className="text-terminal-muted">MAGNITUDE: </span><span className="text-terminal-accent">{c.magnitude}</span></div>
                </div>
                <div className="bg-bear-red/5 border border-bear-red/25 rounded p-2">
                  <span className="text-[10px] font-bold text-bear-red uppercase">Falsification: </span>
                  <span className="text-[10px] text-terminal-muted leading-relaxed">{c.falsification}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel border-terminal-accent/40">
        <div className="panel-header text-terminal-accent">INVENTED INDICATOR &mdash; {inventedIndicator.name.toUpperCase()}</div>
        <div className="p-4 space-y-3">
          <div className="bg-terminal-bg border border-terminal-border rounded p-3">
            <div className="text-[10px] text-terminal-muted uppercase tracking-wider mb-1">Formula</div>
            <code className="text-[11px] text-terminal-accent font-mono break-all">{inventedIndicator.formula}</code>
          </div>
          {[
            { k: 'In plain English', v: inventedIndicator.plainEnglish },
            { k: 'Why it is different', v: inventedIndicator.whyItIsDifferent },
            { k: 'Data sources', v: inventedIndicator.dataSources },
            { k: 'Backtest design', v: inventedIndicator.backtestDesign },
            { k: 'Current reading', v: inventedIndicator.currentReading },
            { k: 'Trade', v: inventedIndicator.trade },
          ].map((x) => (
            <div key={x.k}>
              <div className="text-[10px] font-bold text-terminal-accent uppercase tracking-wider mb-0.5">{x.k}</div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">{x.v}</p>
            </div>
          ))}
          <div className="bg-bear-red/10 border border-bear-red/30 rounded p-3">
            <div className="text-[10px] font-bold text-bear-red uppercase tracking-wider mb-1">Data-mining caveat &mdash; read before trading</div>
            <p className="text-[11px] text-terminal-muted leading-relaxed">{inventedIndicator.dataMiningCaveat}</p>
          </div>
        </div>
      </div>

      <SoWhatSection data={soWhat_Appendix} partTitle="Appendix — Exotic Signals" />
    </div>
  );
}

// ============================================================== SOURCES ====

function SourcesTab() {
  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">SOURCES &mdash; EVERY [D] TAG ON THIS PAGE RESOLVES HERE</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Key</th><th>Source</th><th>Cadence</th></tr></thead>
            <tbody>
              {SOURCES.map((s) => (
                <tr key={s.key}>
                  <td className="font-mono text-terminal-accent text-[10px]">{s.key}</td>
                  <td>
                    <a href={s.url} target="_blank" rel="noreferrer" className="text-info-blue hover:underline text-[11px]">
                      {s.title}
                    </a>
                  </td>
                  <td className="text-[10px] text-terminal-muted">{s.cadence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">OBSERVATION REGISTER &mdash; PROVENANCE AND STALENESS</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Key</th><th>Value</th><th>Tag</th><th>As of</th><th>Source</th><th>Stale after</th><th>Note</th></tr></thead>
            <tbody>
              {Object.entries(observations).map(([k, o]) => {
                const age = (new Date(runSettings.asOfDate).getTime() - new Date(o.asOf).getTime()) / 86400000;
                const stale = o.tag === 'D' && age > o.staleAfterDays;
                return (
                  <tr key={k} className={stale ? 'bg-neutral-amber/10' : ''}>
                    <td className="font-mono text-[10px] text-terminal-text">{k}</td>
                    <td className="font-mono text-terminal-accent">{o.value}</td>
                    <td className="text-[10px]">[{o.tag}]</td>
                    <td className="font-mono text-[10px]">{o.asOf}</td>
                    <td className="text-[10px] text-terminal-muted">{o.source}</td>
                    <td className={`text-[10px] ${stale ? 'text-neutral-amber font-bold' : 'text-terminal-muted'}`}>
                      {o.staleAfterDays}d {stale ? `· STALE (${Math.round(age)}d)` : ''}
                    </td>
                    <td className="text-[10px] text-terminal-muted">{o.note ?? ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;

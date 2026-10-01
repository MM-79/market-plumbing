import { useState, useMemo } from 'react';
import { runSettings, SOURCES, MANUAL_VALUES, buildLayers } from './data/marketData';
import {
  scenarios, scenarioList, fedToolkitLadder, inventedFacility, fedProbabilityTree,
  materialisePath, pathBase, narrativeReviewedOn,
} from './data/scenarios';
import { scorecard, trades, watchlist } from './data/synthesis';
import {
  institutionImpacts, treasuryActions, exoticChains, inventedIndicator,
  regulatoryTransition, superRegionalThemes, depositBetaAsymmetry,
  anchorValues, institutionReviewedOn,
} from './data/institutionData';
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
  auditProbabilities, auditPaths, auditDecompositions, auditPipeline,
  auditNarrativeFreshness, auditTrades, summarise,
} from './lib/audit';
import {
  useLiveSnapshot, type Snapshot, type SnapshotStatus, ageDays, isStale, fmt, val,
} from './lib/snapshot';
import { buildAnchor, buildParCurve, buildDecompositions, type Anchor } from './lib/derive';
import type { PathRow } from './types/framework';

type Tab = 'dashboard' | 'directive' | 'lens' | 'scenarios' | 'policy'
  | 'synthesis' | 'institution' | 'exotic' | 'audit' | 'data';

/**
 * Tailwind v4 generates utilities by scanning source for LITERAL class strings.
 * A class built as `text-${tone}` is never emitted and silently renders
 * unstyled. Every conditional colour therefore resolves through this map.
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
  { id: 'data', label: 'Data Feed' },
];

/** Everything downstream reads from this one derived bundle. */
interface View {
  snap: Snapshot;
  anchor: Anchor;
  parCurve: ReturnType<typeof buildParCurve>;
  layers: ReturnType<typeof buildLayers>;
  decompositions: ReturnType<typeof buildDecompositions>;
  paths: Record<'A' | 'B' | 'C' | 'D', PathRow[]>;
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { snap, status, detail } = useLiveSnapshot();

  const view: View = useMemo(() => {
    const anchor = buildAnchor(snap);
    const base = pathBase(snap, {
      move: MANUAL_VALUES.move.value,
      swapSpread10y: MANUAL_VALUES.swapSpread10y.value,
      acm10y: MANUAL_VALUES.acm10y.value,
    });
    return {
      snap,
      anchor,
      parCurve: buildParCurve(snap),
      layers: buildLayers(snap),
      decompositions: buildDecompositions(snap),
      paths: {
        A: materialisePath(scenarios.A.path, anchor, base),
        B: materialisePath(scenarios.B.path, anchor, base),
        C: materialisePath(scenarios.C.path, anchor, base),
        D: materialisePath(scenarios.D.path, anchor, base),
      },
    };
  }, [snap]);

  const audit = useMemo(() => summarise([
    ...auditPipeline(snap),
    ...auditNarrativeFreshness(narrativeReviewedOn, snap),
    ...auditProbabilities(scenarioList),
    ...auditPaths(
      (['A', 'B', 'C', 'D'] as const).map((k) => ({ key: k, rows: view.paths[k] })),
      view.anchor,
    ),
    ...auditDecompositions(view.decompositions),
    ...auditTrades(trades, scenarioList.length),
  ]), [snap, view]);

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      <header className="border-b border-terminal-border bg-terminal-panel">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-bull-green pulse-live" />
              <h1 className="text-lg font-bold text-terminal-accent glow-amber tracking-wider">YIELD-CURVE-PRIME</h1>
              <span className="text-xs text-terminal-muted">v3.1 · Self-refreshing</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-terminal-muted">
              <span>DATA: <span className="text-terminal-text">{snap.asOfDate}</span></span>
              <span>NARRATIVE: <span className="text-terminal-text">{runSettings.narrativeReviewedOn}</span></span>
              <StatusPill status={status} />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[10px] text-terminal-muted border-t border-terminal-border pt-2">
            <span>HORIZON: <span className="text-terminal-text">{runSettings.scenarioHorizon}</span></span>
            <span>MACRO LENS: <span className="text-bull-green">{runSettings.macroLens}</span></span>
            <span>SERIES: <span className="text-terminal-text">{Object.keys(snap.series).length} live</span></span>
            <span>MANUAL: <span className="text-neutral-amber">{snap.manualFields.length}</span></span>
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
                {t.id === 'audit' && audit.fails > 0 && <span className="ml-1.5 text-bear-red">●</span>}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-4 py-4 space-y-4">
        <AuditBar summary={audit} onOpen={() => setActiveTab('audit')} />
        <div className="text-[10px] text-terminal-muted px-1">{detail}</div>
        {activeTab === 'dashboard' && <DashboardTab v={view} />}
        {activeTab === 'directive' && <DirectiveTab v={view} />}
        {activeTab === 'lens' && <SehgalTab snap={snap} />}
        {activeTab === 'scenarios' && <ScenariosTab v={view} />}
        {activeTab === 'policy' && <PolicyTab />}
        {activeTab === 'synthesis' && <SynthesisTab />}
        {activeTab === 'institution' && <InstitutionTab v={view} />}
        {activeTab === 'exotic' && <ExoticTab />}
        {activeTab === 'audit' && <AuditPanel summary={audit} />}
        {activeTab === 'data' && <DataTab v={view} status={status} detail={detail} />}
      </main>

      <footer className="border-t border-terminal-border bg-terminal-panel py-3 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 text-center text-[10px] text-terminal-muted space-y-1">
          <div className="text-terminal-text font-semibold">Analytical framework, not investment advice.</div>
          <div>
            Tags: [D] fetched from a named source · [E] estimate, method stated · [I] inference · [S] speculation.
            Numbers refresh on a schedule; the reasoning does not. Both dates are in the header, and the self-check
            complains when they drift apart.
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatusPill({ status }: { status: SnapshotStatus }) {
  const map: Record<SnapshotStatus, { label: string; cls: string }> = {
    baked: { label: '◌ LOADING', cls: 'text-terminal-muted' },
    live: { label: '● LIVE', cls: 'text-bull-green' },
    'stale-live': { label: '● BUILD-TIME', cls: 'text-neutral-amber' },
    error: { label: '● OFFLINE', cls: 'text-bear-red' },
  };
  const m = map[status];
  return <span className={`${m.cls} font-bold`}>{m.label}</span>;
}

// ============================================================ DASHBOARD ====

function DashboardTab({ v }: { v: View }) {
  const { snap, anchor, parCurve, layers } = v;
  const sp = spreads(anchor);
  const df = useMemo(() => bootstrapDiscountFactors(parCurve), [parCurve]);
  const todayRow = v.paths.A[0];
  const reservesPctGdp = (val(snap, 'reserves')! / val(snap, 'nominalGdp')!) * 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="panel lg:col-span-2">
          <div className="panel-header">PAR CURVE &mdash; {snap.series.y10?.asOf ?? snap.asOfDate}</div>
          <div className="p-3">
            <CurveChart rows={[{ label: 'Today', row: todayRow }]} title="US Treasury par yields, log tenor axis" />
            <div className="grid grid-cols-3 gap-2 mt-2 text-center border-t border-terminal-border pt-2">
              {[{ k: '2s10s', n: sp.s2s10 }, { k: '5s30s', n: sp.s5s30 }, { k: '2s30s', n: sp.s2s30 }].map((x) => (
                <div key={x.k}>
                  <div className="text-[10px] text-terminal-muted">{x.k}</div>
                  <div className={`text-sm font-bold font-mono ${x.n >= 0 ? 'text-bull-green' : 'text-bear-red'}`}>
                    {x.n > 0 ? '+' : ''}{x.n}bp
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-terminal-muted mt-2 border-t border-terminal-border pt-2">
              Yields fetched from FRED; every spread computed from them by <code>lib/curve.ts</code>.
              Nothing on this panel was typed by a human.
            </div>
          </div>
        </div>

        <div className="panel lg:col-span-3">
          <div className="panel-header">DERIVED ANALYTICS &mdash; BOOTSTRAPPED FROM THE LIVE CURVE</div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { k: '5y5y forward', v: `${forwardRate(df, 5, 5).toFixed(2)}%`, note: 'Terminal rate plus the premium demanded to own it. The tenor the Parts 1-2 argument is really about.' },
              { k: '10y20y forward', v: `${forwardRate(df, 10, 20).toFixed(2)}%`, note: 'The pure long-end forward. Almost no policy-path content.' },
              { k: '2s5s10s fly', v: `${sp.fly2s5s10}bp`, note: 'Negative = belly rich to the wings.' },
              { k: '5s10s30s fly', v: `${sp.fly5s10s30}bp`, note: 'Positive = 10y cheap to its wings.' },
              { k: '10y DV01 / $1mm', v: `$${dv01PerMM(anchor.y10, 10).toFixed(0)}`, note: 'Par bond closed form, semiannual.' },
              { k: '30y DV01 / $1mm', v: `$${dv01PerMM(anchor.y30, 30).toFixed(0)}`, note: `${(dv01PerMM(anchor.y30, 30) / dv01PerMM(anchor.y5, 5)).toFixed(1)}x the 5y. Ignore it and a curve trade becomes an accidental duration position.` },
              { k: '5s30s DV01-neutral', v: `${dv01NeutralRatio({ parYieldPct: anchor.y5, years: 5 }, { parYieldPct: anchor.y30, years: 30 }).frontPer100mmBack.toFixed(0)}mm`, note: '5y notional per $100mm of 30y.' },
              { k: '5s30s 3m roll', v: `${spreadCarryRoll(parCurve, 5, 30, 3).netRollBp > 0 ? '+' : ''}${spreadCarryRoll(parCurve, 5, 30, 3).netRollBp}bp`, note: 'Roll-down on the spread, curve held still.' },
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

      <div className="panel">
        <div className="panel-header">THE UPSHOT</div>
        <div className="p-4 space-y-3 text-sm leading-relaxed">
          <p>
            <span className="text-terminal-accent font-bold">DRIVER: </span>
            The long end carries a high term premium &mdash; Kim-Wright at {fmt(val(snap, 'kimWright10y'), 0)}bp &mdash;
            while the front is held by a policy rate that is only {fmt(val(snap, 'realPolicyRate'))}% in real terms and
            therefore barely restrictive at all. The result is 2s10s at {sp.s2s10 > 0 ? '+' : ''}{sp.s2s10}bp with the
            risk premium sitting almost entirely at the back. Note what is NOT driving it: the 5y5y breakeven is{' '}
            {fmt(val(snap, 'bei5y5y'))}%, at or below target-consistent levels. Whatever is holding the long end up, the
            market&rsquo;s long-run inflation expectation is not it.
          </p>
          <p>
            <span className="text-terminal-accent font-bold">RISK BALANCE: </span>
            Two numbers should unsettle anyone reading this page. Payroll growth is averaging{' '}
            {fmt(val(snap, 'nfp3mAvg'), 0)}k over three months, and CCC sits at {fmt(val(snap, 'cccOas'), 0)}bp against
            BB at {fmt(val(snap, 'bbOas'), 0)}bp. A labour market decelerating from a low base, met by a credit index at
            its tights with no cushion, is what moves weight toward the growth scenario rather than the fiscal one.
          </p>
          <p>
            <span className="text-terminal-accent font-bold">WATCH: </span>
            ON RRP take-up is {fmt(val(snap, 'onRrp'), 2)}bn &mdash; the facility that absorbed trillions in 2022 is
            empty &mdash; and reserves are {fmt(val(snap, 'reserves'))}tn, about {reservesPctGdp.toFixed(1)}% of GDP,
            at or through the bottom of most estimates of the comfortable range. The SOFR distribution is the thing to
            watch and its tail is currently {fmt(val(snap, 'sofrTailWidth'), 0)}bp wide.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">DIAGNOSTIC SPINE &mdash; SIX LAYERS, EACH WITH ITS OWN STRONGEST COUNTER</div>
        <div className="p-4 space-y-4">
          <p className="text-[11px] text-terminal-muted">
            Metrics are fetched. Signals, narratives and steelmen are judgement, last re-reasoned on{' '}
            <span className="text-terminal-accent">{runSettings.narrativeReviewedOn}</span>. A layer marked
            <span className="text-neutral-amber"> LOW</span> confidence with &ldquo;verify&rdquo; metrics is one this
            framework genuinely cannot measure &mdash; a better thing to display than a confident signal resting on
            nothing.
          </p>
          {layers.map((l) => (
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
                  {l.metrics.map((m, i) => (
                    <span key={i} className={`text-[10px] border rounded px-1.5 py-0.5 ${
                      m.stale ? 'bg-neutral-amber/10 border-neutral-amber/40' : 'bg-terminal-bg border-terminal-border'
                    }`}>
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

      <div className="panel">
        <div className="panel-header">RECENT COUPON AUCTIONS &mdash; FETCHED FROM TREASURYDIRECT</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Term</th><th>High yield</th><th>Bid-to-cover</th><th>Size</th><th>Indirect</th><th>Direct</th><th>Dealer</th></tr>
            </thead>
            <tbody>
              {snap.auctions.slice(0, 8).map((a) => (
                <tr key={a.cusip}>
                  <td className="font-mono text-terminal-accent">{a.auctionDate}</td>
                  <td className="text-terminal-text">{a.term}</td>
                  <td className="font-mono">{a.highYield.toFixed(3)}%</td>
                  <td className="font-mono">{a.bidToCover?.toFixed(2) ?? 'n/a'}</td>
                  <td className="font-mono">${a.totalAcceptedBn.toFixed(1)}bn</td>
                  <td className="font-mono">{a.indirectPct.toFixed(1)}%</td>
                  <td className="font-mono">{a.directPct.toFixed(1)}%</td>
                  <td className={`font-mono ${a.dealerPct > 25 ? 'text-bear-red' : ''}`}>{a.dealerPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-terminal-muted mt-2">
            TreasuryDirect does not publish the when-issued yield at the bid deadline, so the TAIL cannot be computed
            from this feed. Bid-to-cover and the bidder split are live; tails remain manual and are listed as such on
            the Data Feed tab. Dealer takedown above 25% is highlighted, since that is the L2 stress threshold.
          </p>
        </div>
      </div>

      <SoWhatSection data={soWhat_Part0} partTitle="Part 0 — Current State" />
    </div>
  );
}

// ============================================================ DIRECTIVE ====

function DirectiveTab({ v }: { v: View }) {
  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header text-terminal-accent">PART 1 &mdash; DECOMPOSING THE MOVE, COMPUTED FROM PUBLISHED SERIES</div>
        <div className="p-4 space-y-4">
          <p className="text-xs text-terminal-muted leading-relaxed">
            Both decompositions come straight out of the data. Term premium is the change in Kim-Wright, so the
            expected-path component is its residual; the real-yield component is the change in the 10y TIPS yield, so
            inflation compensation is its residual. Each view sums to the total independently, by construction. The
            windows are located in the history rather than remembered &mdash; the &ldquo;low&rdquo; below is found by
            scanning the series, so it re-anchors on every refresh instead of quietly referring to a level that stopped
            being the low months ago.
          </p>
          {v.decompositions.map((d) => {
            const c = decompositionCheck(d);
            return (
              <div key={d.window} className="border border-terminal-border rounded overflow-hidden">
                <div className="bg-terminal-bg px-3 py-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-bold text-terminal-accent">{d.window} (from {d.startDate})</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono">{d.startY10.toFixed(2)}% &rarr; {d.endY10.toFixed(2)}%</span>
                    <span className={`font-mono font-bold ${c.totalBp > 0 ? 'text-bear-red' : 'text-bull-green'}`}>
                      {c.totalBp > 0 ? '+' : ''}{c.totalBp}bp
                    </span>
                    <span className="signal-badge signal-neutral uppercase">{c.regime.regime}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-terminal-border">
                  <div className="bg-terminal-panel p-3">
                    <div className="text-[10px] font-bold text-terminal-muted uppercase tracking-wider mb-2">View 1 &mdash; risk-neutral path vs risk premium</div>
                    <Bar label="Expected policy path" bp={d.expectedPathBp} total={c.totalBp} color="bg-info-blue/60" />
                    <Bar label="Term premium (Kim-Wright)" bp={d.termPremiumBp} total={c.totalBp} color="bg-bear-red/60" />
                  </div>
                  <div className="bg-terminal-panel p-3">
                    <div className="text-[10px] font-bold text-terminal-muted uppercase tracking-wider mb-2">View 2 &mdash; real yield vs inflation compensation</div>
                    <Bar label="Real yield (10y TIPS)" bp={d.realYieldBp} total={c.totalBp} color="bg-bull-green/60" />
                    <Bar label="Breakeven" bp={d.breakevenBp} total={c.totalBp} color="bg-neutral-amber/60" />
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
        <div className="panel-header text-terminal-accent">WHY THE LONG END IS WHERE IT IS &mdash; RANKED BY EVIDENTIARY SUPPORT</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { r: 1, t: 'Term premium normalisation', tone: 'bear-red' as Tone, d: `Kim-Wright has the 10y term premium near ${fmt(val(v.snap, 'kimWright10y'), 0)}bp. Worth stating plainly: the pre-2008 average was higher still, so an elevated term premium is not in itself a crisis signal - it is the partial removal of a quantitative-easing distortion. [D]` },
            { r: 2, t: 'Duration supply', tone: 'bear-red' as Tone, d: `Debt held by the public is ${fmt(val(v.snap, 'debtHeldByPublic'))}tn and the auction calendar is relentless. But the live bidder splits do not show a buyer strike - indirect participation across recent coupons is running in its normal range, which is the opposite of what the supply thesis predicts. [D]` },
            { r: 3, t: 'Inflation risk premium', tone: 'muted' as Tone, d: `Demoted from second to fifth on the live data, and this is the single largest correction to the previous version of this framework. The 5y5y breakeven is ${fmt(val(v.snap, 'bei5y5y'))}% - at or below target-consistent levels. The long end is not being held up by inflation expectations. [D]` },
            { r: 4, t: 'Foreign demand', tone: 'muted' as Tone, d: 'Unmeasurable with the current pipeline. TIC publishes with a six-week lag in fixed-width text and there is no free feed for hedged yields. The previous version ranked this fourth on the strength of numbers no source had published. [I]' },
            { r: 5, t: 'Dealer balance-sheet scarcity', tone: 'muted' as Tone, d: 'Priced directly by the 10y swap spread, which remains a manual field. Mechanically unwinds when inventory clears - this is not a view about America. [I]' },
            { r: 6, t: 'Positioning and the bandwagon', tone: 'bull-green' as Tone, d: 'Listed last by evidentiary support and first by reversal speed. The only component that can vanish in a week with no news, which is exactly why it is the one nobody models. [I]' },
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
      <div className="w-40 shrink-0 text-[10px] text-terminal-muted">{label}</div>
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

function ScenariosTab({ v }: { v: View }) {
  const [active, setActive] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const s = scenarios[active];
  const rows = v.paths[active];
  const soWhat = { A: soWhat_Part2, B: soWhat_Part3, C: soWhat_Part4, D: soWhat_ScenarioD }[active];

  const startRegime = classifyRegime(rows[0], rows[1]);
  const fullRegime = classifyRegime(rows[0], rows[rows.length - 1]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarioList.map((sc) => {
          const delta = sc.probability - sc.priorProbability;
          return (
            <button
              key={sc.key}
              onClick={() => setActive(sc.key as 'A' | 'B' | 'C' | 'D')}
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
          <span className="text-terminal-accent font-bold">{s.probability}% (prior {s.priorProbability}%)</span>
        </div>
        <div className="p-4 space-y-4 text-sm">
          <p className="leading-relaxed">{s.definition}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CurveChart
              rows={[
                { label: 'Today', row: rows[0] },
                { label: 'Month 3', row: rows[2], color: '#3b82f6' },
                { label: 'Month 6', row: rows[3], color: '#10b981' },
              ]}
              title={`Scenario ${s.key} curve path, rebased to the live anchor`}
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
                  Where these two disagree the scenario contains a handover and the curve-shape text has to stage it.
                  Scenario C is the clearest case.
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
              Path table &mdash; stored as bp DELTAS, materialised against today&rsquo;s live curve, spreads derived
            </h4>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th><th>Fed funds</th><th>2y</th><th>5y</th><th>10y</th><th>30y</th>
                    <th>2s10s</th><th>5s30s</th><th>Term prem</th><th>Swap spr</th>
                    <th>SOFR-IORB</th><th>30y mort</th><th>IG OAS</th><th>HY OAS</th><th>MOVE</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
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
                        <td className="font-mono">{r.termPremium}</td>
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
            The ordering matters more than the contents. Each rung is cheaper in institutional capital than the one
            below it, not more effective. Analysts who jump straight to &ldquo;the Fed will do QE&rdquo; skip four rungs
            that between them resolve most episodes &mdash; and two of those rungs are not even the Fed&rsquo;s to pull.
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
            [S] CLAMP is invented. It does not exist and has not been proposed. The legal reasoning about Section 14(b)
            and the 1951 Accord is real; the facility is a thought experiment about what the constraint actually is.
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
            Branch weights are conditional on C having begun and sum to 100. The most useful line is C3: a bull flattener
            that persists rather than handing over to a steepener is the most under-priced path in the framework, and the
            one that destroys a book positioned for the easing cycle.
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
            Each rule states the probability shift in percentage points, so it can be checked against the tape
            afterwards. Live levels for these indicators are on the Dashboard and Data Feed tabs.
          </p>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Indicator</th><th>Weight</th><th>Decision rules</th><th>Next print</th></tr>
              </thead>
              <tbody>
                {scorecard.map((r) => (
                  <tr key={r.indicator}>
                    <td className="font-semibold text-terminal-text">{r.indicator}</td>
                    <td><span className={`signal-badge ${r.weight === 'High' ? 'signal-bearish' : 'signal-neutral'}`}>{r.weight}</span></td>
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
            Illustrative. Units are bp of the traded spread for linear trades and bp of premium for option structures,
            stated per trade because mixing them silently makes a reward-to-risk ratio arithmetically meaningless.
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
        <div className="panel-header">WATCHLIST</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Event</th><th>Weight</th><th>What would change the view</th></tr></thead>
            <tbody>
              {watchlist.map((w) => (
                <tr key={w.date + w.event} className={w.weight === 'CRITICAL' ? 'bg-terminal-accent/5' : ''}>
                  <td className="font-mono text-terminal-accent whitespace-nowrap">{w.date}</td>
                  <td className="font-semibold text-terminal-text">{w.event}</td>
                  <td><span className={`signal-badge ${w.weight === 'CRITICAL' ? 'signal-bearish' : 'signal-neutral'}`}>{w.weight}</span></td>
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

function InstitutionTab({ v }: { v: View }) {
  const b = v.snap.bank;

  if (!b) {
    return (
      <div className="panel">
        <div className="panel-header text-bear-red">PART 6 UNAVAILABLE &mdash; CALL REPORT NOT FETCHED</div>
        <div className="p-4 text-xs text-terminal-muted">
          The FDIC feed failed on the last pipeline run, so there are no balance-sheet figures to
          analyse. This section deliberately renders nothing rather than falling back to illustrative
          numbers &mdash; inventing a bank is precisely the failure this version of the framework was
          built to remove.
        </div>
      </div>
    );
  }

  const L = b.latest;
  const Y = b.yearAgo;
  const delta = (now: number | null, then: number | null | undefined, dp = 2, suffix = '') => {
    if (now === null || then === null || then === undefined) return null;
    const d = now - then;
    return `${d > 0 ? '+' : ''}${d.toFixed(dp)}${suffix}`;
  };

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------- the institution --- */}
      <div className="panel">
        <div className="panel-header flex items-center justify-between flex-wrap gap-2">
          <span>PART 6 &mdash; {b.legalName.toUpperCase()}</span>
          <span className="text-terminal-muted font-normal normal-case text-[10px]">
            FDIC cert {b.cert} · {b.city} · Call Report {b.asOf.slice(0, 4)}Q{Math.ceil(Number(b.asOf.slice(4, 6)) / 3)}
          </span>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-terminal-muted leading-relaxed">
            A consumer and commercial super-regional, chosen over the invented mortgage-servicing bank
            this section used to describe for three reasons: the mix is genuinely consumer plus
            commercial rather than a monoline, it has just absorbed a large acquisition so integration
            strain shows up in reported numbers rather than a footnote, and it crossed $250bn of assets
            in a single quarter &mdash; dragging it from Category IV into Category III supervision.
            That last one is where the rate scenario and the regulatory regime collide, and it is what
            this section now exists to analyse.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { k: 'Assets', v: `$${L.assets.toFixed(1)}bn`, d: delta(L.assets, Y?.assets, 1, 'bn') },
              { k: 'Deposits', v: `$${L.deposits.toFixed(1)}bn`, d: delta(L.deposits, Y?.deposits, 1, 'bn') },
              { k: 'Net loans', v: `$${L.loans.toFixed(1)}bn`, d: delta(L.loans, Y?.loans, 1, 'bn') },
              { k: 'Loans / deposits', v: `${L.loansToDeposits?.toFixed(1)}%`, d: delta(L.loansToDeposits, Y?.loansToDeposits, 1, 'pp') },
              { k: 'CET1', v: `${L.cet1Pct?.toFixed(2)}%`, d: delta(L.cet1Pct, Y?.cet1Pct, 2, 'pp') },
              { k: 'NIM', v: `${L.nimPct?.toFixed(2)}%`, d: delta(L.nimPct, Y?.nimPct, 2, 'pp') },
              { k: 'ROA', v: `${L.roaPct?.toFixed(2)}%`, d: delta(L.roaPct, Y?.roaPct, 2, 'pp') },
              { k: 'Efficiency', v: `${L.efficiencyPct?.toFixed(1)}%`, d: delta(L.efficiencyPct, Y?.efficiencyPct, 1, 'pp') },
              { k: 'AFS securities', v: `$${L.securitiesAfs.toFixed(1)}bn`, d: null },
              { k: 'AFS share of book', v: `${L.afsShareOfSecurities?.toFixed(1)}%`, d: null },
              { k: 'NCO (ann.)', v: `${L.ncoBp}bp`, d: delta(L.ncoBp, Y?.ncoBp, 0, 'bp') },
              { k: 'NPL ratio', v: `${L.nplPct?.toFixed(2)}%`, d: delta(L.nplPct, Y?.nplPct, 2, 'pp') },
            ].map((m) => (
              <div key={m.k} className="bg-terminal-bg border border-terminal-border rounded p-2">
                <div className="text-[10px] text-terminal-muted">{m.k}</div>
                <div className="text-sm font-bold font-mono text-terminal-accent">{m.v}</div>
                {m.d && <div className="text-[9px] font-mono text-terminal-muted">{m.d} y/y</div>}
              </div>
            ))}
          </div>

          <p className="text-[10px] text-terminal-muted italic border-t border-terminal-border pt-2">
            Every figure fetched from the FDIC Call Report API, no key required.{' '}
            <span className="text-neutral-amber">Scope: {b.scopeNote}</span>{' '}
            <a href={b.sourceUrl} target="_blank" rel="noreferrer" className="text-info-blue hover:underline">
              BankFind profile
            </a>
            . Narrative last re-reasoned {institutionReviewedOn}.
          </p>
        </div>
      </div>

      {/* --------------------------------------------- the threshold event --- */}
      <div className="panel border-bear-red/40">
        <div className="panel-header text-bear-red">
          THE THRESHOLD EVENT &mdash; {regulatoryTransition.headline.toUpperCase()}
        </div>
        <div className="p-4 space-y-4">
          {b.crossedAt && (
            <div className="bg-terminal-bg border border-terminal-border rounded p-3">
              <div className="flex items-center justify-center gap-4 flex-wrap text-center">
                <div>
                  <div className="text-[10px] text-terminal-muted">{b.crossedAt.fromQuarter}</div>
                  <div className="text-xl font-bold font-mono text-terminal-text">${b.crossedAt.fromAssets.toFixed(0)}bn</div>
                  <div className="text-[10px] text-bull-green">Category IV</div>
                </div>
                <div className="text-2xl text-terminal-accent">&rarr;</div>
                <div className="px-3">
                  <div className="text-[10px] text-terminal-muted">threshold</div>
                  <div className="text-xl font-bold font-mono text-neutral-amber">
                    ${b.thresholds.categoryIII}bn
                  </div>
                  <div className="text-[10px] text-terminal-muted">{b.thresholds.source}</div>
                </div>
                <div className="text-2xl text-terminal-accent">&rarr;</div>
                <div>
                  <div className="text-[10px] text-terminal-muted">{b.crossedAt.toQuarter}</div>
                  <div className="text-xl font-bold font-mono text-terminal-text">${b.crossedAt.toAssets.toFixed(0)}bn</div>
                  <div className="text-[10px] text-bear-red">Category III</div>
                </div>
              </div>
              <p className="text-[10px] text-terminal-muted text-center mt-2">
                One quarter. Not a gradual approach that could be managed toward &mdash; a single step of
                ${(b.crossedAt.toAssets - b.crossedAt.fromAssets).toFixed(0)}bn that cleared the line by
                ${(b.crossedAt.toAssets - b.thresholds.categoryIII).toFixed(0)}bn.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {regulatoryTransition.whatChanges.map((c) => (
              <div
                key={c.item}
                className={`border rounded p-3 ${
                  c.severity === 'HIGH' ? 'border-bear-red/40 bg-bear-red/5'
                  : c.severity === 'MED' ? 'border-neutral-amber/30 bg-neutral-amber/5'
                  : 'border-terminal-border bg-terminal-bg'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-bold ${
                    c.severity === 'HIGH' ? 'text-bear-red'
                    : c.severity === 'MED' ? 'text-neutral-amber' : 'text-terminal-muted'
                  }`}>{c.item}</span>
                  <div className="flex items-center gap-2">
                    {c.rateSensitive && (
                      <span className="text-[9px] font-bold text-bear-red border border-bear-red/40 rounded px-1.5 py-0.5">
                        RATE-SENSITIVE
                      </span>
                    )}
                    <span className="text-[9px] text-terminal-muted">{c.severity}</span>
                  </div>
                </div>
                <p className="text-[11px] text-terminal-muted leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-bear-red/10 border border-bear-red/30 rounded p-3">
              <div className="text-[10px] font-bold text-bear-red uppercase tracking-wider mb-1">The collision</div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">{regulatoryTransition.theCollision}</p>
            </div>
            <div className="bg-bull-green/10 border border-bull-green/30 rounded p-3">
              <div className="text-[10px] font-bold text-bull-green uppercase tracking-wider mb-1">The other side of it</div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">{regulatoryTransition.theDefence}</p>
            </div>
            <div className="bg-terminal-accent/10 border border-terminal-accent/30 rounded p-3">
              <div className="text-[10px] font-bold text-terminal-accent uppercase tracking-wider mb-1">What to actually do</div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">{regulatoryTransition.theActionableVersion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------- loan book composition --- */}
      <div className="panel">
        <div className="panel-header">LOAN BOOK &mdash; CONSUMER PLUS COMMERCIAL, NOT A MONOLINE</div>
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            {[
              { name: 'Commercial & industrial', amt: L.ci, pct: L.ciPctLoans, tone: 'bg-bear-red/60' },
              { name: 'Commercial real estate (incl. construction)', amt: L.cre, pct: L.loans ? (L.cre / L.loans) * 100 : 0, tone: 'bg-neutral-amber/60' },
              { name: 'Auto', amt: L.auto, pct: L.loans ? (L.auto / L.loans) * 100 : 0, tone: 'bg-info-blue/60' },
              { name: 'Other consumer', amt: L.consumerOther, pct: L.loans ? (L.consumerOther / L.loans) * 100 : 0, tone: 'bg-bull-green/60' },
              { name: 'Residential mortgage & all other', amt: L.loans - L.ci - L.cre - L.auto - L.consumerOther, pct: L.loans ? ((L.loans - L.ci - L.cre - L.auto - L.consumerOther) / L.loans) * 100 : 0, tone: 'bg-terminal-muted/40' },
            ].map((x) => (
              <div key={x.name} className="flex items-center gap-3">
                <div className="w-64 shrink-0 text-[11px] text-terminal-text">{x.name}</div>
                <div className="flex-1 h-5 bg-terminal-bg rounded overflow-hidden border border-terminal-border">
                  <div className={`h-full ${x.tone}`} style={{ width: `${Math.max(0, Math.min(100, x.pct ?? 0))}%` }} />
                </div>
                <div className="w-20 shrink-0 text-right font-mono text-xs text-terminal-accent">
                  ${x.amt.toFixed(1)}bn
                </div>
                <div className="w-14 shrink-0 text-right font-mono text-[10px] text-terminal-muted">
                  {(x.pct ?? 0).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-bull-green/10 border border-bull-green/30 rounded p-3">
              <div className="text-[10px] text-terminal-muted">CRE concentration vs tier 1</div>
              <div className="text-2xl font-bold font-mono text-bull-green">{L.crePctTier1}%</div>
              <div className="text-[10px] text-terminal-muted leading-snug mt-1">
                Supervisory guidance flags concentration above 300%. Sitting at less than half that is
                the single biggest structural difference between this balance sheet and the regionals
                that broke in 2023-24, and almost nobody gives it credit for that.
              </div>
            </div>
            <div className="bg-info-blue/10 border border-info-blue/30 rounded p-3">
              <div className="text-[10px] text-terminal-muted">Direct consumer share of loans</div>
              <div className="text-2xl font-bold font-mono text-info-blue">{L.consumerPctLoans}%</div>
              <div className="text-[10px] text-terminal-muted leading-snug mt-1">
                Fixed-rate and long-dated, so the existing book is insulated from a rate selloff and
                acts as a margin stabiliser when the Fed cuts. The quiet virtue of a consumer franchise
                relative to a pure commercial lender.
              </div>
            </div>
            <div className="bg-bear-red/10 border border-bear-red/30 rounded p-3">
              <div className="text-[10px] text-terminal-muted">C&amp;I share of loans</div>
              <div className="text-2xl font-bold font-mono text-bear-red">{L.ciPctLoans}%</div>
              <div className="text-[10px] text-terminal-muted leading-snug mt-1">
                Mostly floating-rate, so it reprices down at close to 100% in a cutting cycle. Also
                where lending to non-depository financial institutions hides, with no separate Call
                Report disclosure &mdash; the largest exposure here that cannot be sized from outside.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- credit signal --- */}
      <div className="panel border-neutral-amber/40">
        <div className="panel-header text-neutral-amber">
          THE CREDIT SIGNAL &mdash; FORMATION VERSUS REALISATION
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-terminal-muted leading-relaxed">
            Normalisation and deterioration look identical for about three quarters and then diverge
            violently. The tell is not the charge-off rate &mdash; it is the relationship between
            non-performing loans ENTERING the book and losses LEAVING it. A stable charge-off rate
            alongside rising non-accruals is not normalisation. It is a queue.
          </p>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quarter</th><th>Assets $bn</th><th>Loans $bn</th><th>NPL $bn</th><th>NPL %</th>
                  <th>NCO bp (ann.)</th><th>Allowance %</th><th>Reserve cover</th><th>CET1 %</th><th>NIM %</th><th>Efficiency %</th>
                </tr>
              </thead>
              <tbody>
                {b.quarters.slice(0, 9).map((q, i) => {
                  const crossed = b.crossedAt && q.quarter === b.crossedAt.toQuarter;
                  return (
                    <tr key={q.quarter} className={i === 0 ? 'bg-terminal-accent/5' : crossed ? 'bg-bear-red/10' : ''}>
                      <td className="font-mono text-terminal-accent">
                        {q.quarter}
                        {crossed && <span className="ml-1 text-[9px] text-bear-red">CAT III</span>}
                      </td>
                      <td className="font-mono">{q.assets.toFixed(1)}</td>
                      <td className="font-mono">{q.loans.toFixed(1)}</td>
                      <td className="font-mono">{q.npl.toFixed(2)}</td>
                      <td className="font-mono text-neutral-amber">{q.nplPct?.toFixed(2)}</td>
                      <td className="font-mono">{q.ncoBp}</td>
                      <td className="font-mono">{q.allowanceToLoansPct?.toFixed(2)}</td>
                      <td className={`font-mono ${(q.reserveCoverage ?? 9) < 1.5 ? 'text-bear-red' : ''}`}>
                        {q.reserveCoverage?.toFixed(2)}x
                      </td>
                      <td className="font-mono">{q.cet1Pct?.toFixed(2)}</td>
                      <td className="font-mono">{q.nimPct?.toFixed(2)}</td>
                      <td className="font-mono">{q.efficiencyPct?.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-terminal-bg border border-terminal-border rounded p-3">
            <div className="text-[10px] font-bold text-neutral-amber uppercase tracking-wider mb-1">
              Read the table this way
            </div>
            <p className="text-[11px] text-terminal-muted leading-relaxed">
              Non-performing loans have risen sharply across the acquisition quarters while the
              annualised charge-off rate has been flat to LOWER. Reserve coverage of non-accruals has
              fallen as a direct consequence. Part of that is purchase accounting &mdash; acquired loans
              arrive with their own credit marks and show up as non-accrual without generating a
              charge-off. Part of it may not be. The honest position is that these two explanations are
              observationally equivalent right now and separate within two or three quarters, which is
              exactly why the formation-to-realisation gap belongs on the ALCO dashboard as a standing
              trigger rather than as a quarterly discussion item.
            </p>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------- deposit beta trap --- */}
      <div className="panel">
        <div className="panel-header">THE DOWN-BETA TRAP &mdash; WHY AN EASING CYCLE HURTS FIRST</div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-terminal-text leading-relaxed">{depositBetaAsymmetry.premise}</p>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Balance sheet leg</th><th>Reprices at</th><th>Speed</th><th>Why it matters</th></tr></thead>
              <tbody>
                {depositBetaAsymmetry.legs.map((l) => (
                  <tr key={l.leg}>
                    <td className="font-semibold text-terminal-text">{l.leg}</td>
                    <td className="font-mono text-terminal-accent">{l.repricesAt}</td>
                    <td className="text-[10px] text-terminal-muted">{l.speed}</td>
                    <td className="text-[10px] text-terminal-muted">{l.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-bear-red/5 border border-bear-red/25 rounded p-3">
              <div className="text-[10px] font-bold text-bear-red uppercase tracking-wider mb-1">The trap</div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">{depositBetaAsymmetry.theTrap}</p>
            </div>
            <div className="bg-info-blue/5 border border-info-blue/25 rounded p-3">
              <div className="text-[10px] font-bold text-info-blue uppercase tracking-wider mb-1">The hedge, and what it actually costs</div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">{depositBetaAsymmetry.theHedge}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------- scenario grid --------- */}
      <div className="panel">
        <div className="panel-header">BALANCE SHEET BY SCENARIO</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Area</th><th>Live anchors</th>
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
                  <td className="text-[10px]">
                    {anchorValues(v.snap, r.anchors).map((a) => (
                      <div key={a.key} className="whitespace-nowrap">
                        <span className="text-terminal-muted">{a.key} </span>
                        <span className="font-mono text-terminal-accent">{a.value}</span>
                      </div>
                    ))}
                    <div className="text-terminal-muted/60 mt-1">{r.measure}</div>
                  </td>
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

      {/* ------------------------------------------- super-regional themes --- */}
      <div className="panel">
        <div className="panel-header">THE SUPER-REGIONAL CONVERSATION &mdash; AND WHERE IT IS WRONG</div>
        <div className="p-4 space-y-3">
          {superRegionalThemes.map((t) => (
            <div key={t.theme} className="border border-terminal-border rounded overflow-hidden">
              <div className="bg-terminal-bg px-3 py-2 text-xs font-bold text-terminal-accent">{t.theme}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-terminal-border">
                <div className="bg-terminal-panel p-3">
                  <div className="text-[10px] font-bold text-info-blue uppercase tracking-wider mb-1">What the street says</div>
                  <p className="text-[11px] text-terminal-muted leading-relaxed">{t.whatTheStreetSays}</p>
                </div>
                <div className="bg-terminal-panel p-3">
                  <div className="text-[10px] font-bold text-neutral-amber uppercase tracking-wider mb-1">What it actually means</div>
                  <p className="text-[11px] text-terminal-muted leading-relaxed">{t.whatItActuallyMeans}</p>
                </div>
              </div>
              <div className="bg-terminal-accent/5 border-t border-terminal-border p-3">
                <span className="text-[10px] font-bold text-terminal-accent uppercase tracking-wider">On this balance sheet: </span>
                <span className="text-[11px] text-terminal-text leading-relaxed">{t.thisBank}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------- actions ----- */}
      <div className="panel">
        <div className="panel-header">ACTIONS &mdash; WITH TRIGGER, OWNER, LEAD TIME AND COST</div>
        <div className="p-4 space-y-2">
          <p className="text-[11px] text-terminal-muted">
            An action without an owner and a lead time is a wish. Four of these have a trigger of
            &ldquo;now&rdquo;, and three of those are driven by the regulatory calendar rather than by
            anything the market does &mdash; which is what makes them the ones most likely to slip.
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

// ============================================================= DATA FEED ===

function DataTab({ v, status, detail }: { v: View; status: SnapshotStatus; detail: string }) {
  const { snap } = v;
  const series = Object.entries(snap.series).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">PIPELINE STATUS</div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { k: 'Snapshot generated', v: `${snap.generatedAt.slice(0, 16).replace('T', ' ')}Z` },
              { k: 'Series fetched', v: String(Object.keys(snap.series).length) },
              { k: 'Auctions fetched', v: String(snap.auctions.length) },
              { k: 'Fetch failures', v: String(snap.failures.length) },
              { k: 'Manual fields', v: String(snap.manualFields.length) },
            ].map((m) => (
              <div key={m.k} className="bg-terminal-bg border border-terminal-border rounded p-3">
                <div className="text-[10px] text-terminal-muted">{m.k}</div>
                <div className="text-sm font-bold font-mono text-terminal-accent">{m.v}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-terminal-muted"><StatusPill status={status} /> &nbsp;{detail}</p>
          <p className="text-[11px] text-terminal-muted leading-relaxed">
            The pipeline runs <code>scripts/fetch-snapshot.mjs</code> against free, keyless public endpoints &mdash;
            FRED, the NY Fed reference-rates API, Treasury Fiscal Data and TreasuryDirect. It refuses to write a
            snapshot if the curve is missing or if more than 40% of sources fail, because keeping yesterday&rsquo;s data
            and saying so is strictly better than publishing a page with an empty anchor.
          </p>
        </div>
      </div>

      <div className="panel border-neutral-amber/40">
        <div className="panel-header text-neutral-amber">STILL MAINTAINED BY HAND &mdash; WHERE DRIFT RE-ENTERS</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Field</th><th>Why it cannot be fetched</th><th>Where to get it</th></tr></thead>
            <tbody>
              {snap.manualFields.map((m) => (
                <tr key={m.key}>
                  <td className="font-semibold text-neutral-amber">{m.label}</td>
                  <td className="text-[10px] text-terminal-muted">{m.why}</td>
                  <td className="text-[10px] text-info-blue break-all">{m.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-terminal-muted mt-2">
            Every row here is a place where the previous failure can recur: a number typed by a human, ageing quietly
            behind a source citation. They are listed rather than hidden precisely for that reason.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">SERIES REGISTER &mdash; {series.length} FETCHED</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Key</th><th>Label</th><th>Value</th><th>Tag</th><th>As of</th><th>Age</th><th>Limit</th><th>Source</th></tr></thead>
            <tbody>
              {series.map(([k, o]) => {
                const age = ageDays(o.asOf, snap.asOfDate);
                const stale = isStale(o, snap.asOfDate);
                return (
                  <tr key={k} className={stale ? 'bg-neutral-amber/10' : ''}>
                    <td className="font-mono text-[10px] text-terminal-text">{k}</td>
                    <td className="text-[10px] text-terminal-muted">{o.label}</td>
                    <td className="font-mono text-terminal-accent">{o.value}</td>
                    <td className="text-[10px]">[{o.tag}]</td>
                    <td className="font-mono text-[10px]">{o.asOf}</td>
                    <td className={`font-mono text-[10px] ${stale ? 'text-neutral-amber font-bold' : ''}`}>{age}d</td>
                    <td className="font-mono text-[10px] text-terminal-muted">
                      {o.staleAfterDays}d{o.periodDated ? ' *' : ''}
                    </td>
                    <td className="text-[10px] text-terminal-muted">
                      {o.sourceUrl
                        ? <a href={o.sourceUrl} target="_blank" rel="noreferrer" className="text-info-blue hover:underline">{o.source}</a>
                        : o.source}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-[10px] text-terminal-muted mt-2">
            * Period-dated. FRED stamps a monthly or quarterly observation to the START of the period it describes, so
            a July figure published in late August arrives already two months &ldquo;old&rdquo;. Their limits cover
            period length plus publication lag; they are not evidence that anybody forgot to refresh.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">SOURCES</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Key</th><th>Source</th><th>Cadence</th></tr></thead>
            <tbody>
              {SOURCES.map((s) => (
                <tr key={s.key}>
                  <td className="font-mono text-terminal-accent text-[10px]">{s.key}</td>
                  <td><a href={s.url} target="_blank" rel="noreferrer" className="text-info-blue hover:underline text-[11px]">{s.title}</a></td>
                  <td className="text-[10px] text-terminal-muted">{s.cadence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;

import { useState } from 'react';
import {
  runSettings,
  anchorCheck,
  parCurve,
  diagnosticLayers,
  scenarios,
  synthesis,
  institutionLens,
  exoticSignals,
} from './data/marketData';

type Tab = 'dashboard' | 'directive' | 'scenarios' | 'synthesis' | 'institution' | 'exotic';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Part 0: Dashboard' },
    { id: 'directive', label: 'Part 1: Current Directive' },
    { id: 'scenarios', label: 'Parts 2-4: Scenarios' },
    { id: 'synthesis', label: 'Part 5: Synthesis' },
    { id: 'institution', label: 'Part 6: Bank Treasury' },
    { id: 'exotic', label: 'Appendix: Exotic' },
  ];

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      {/* Header */}
      <header className="border-b border-terminal-border bg-terminal-panel">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-bull-green pulse-live"></div>
              <h1 className="text-lg font-bold text-terminal-accent glow-amber tracking-wider">
                YIELD-CURVE-PRIME
              </h1>
              <span className="text-xs text-terminal-muted">v2.7.1 | Fixed Income Intelligence</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-terminal-muted">
              <span>AS OF: <span className="text-terminal-text">{runSettings.asOfDate}</span></span>
              <span>VOICE: <span className="text-terminal-accent">{runSettings.voiceLabel}</span></span>
              <span className="text-bull-green cursor-blink">● LIVE</span>
            </div>
          </div>
          {/* Run Settings Bar */}
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[10px] text-terminal-muted border-t border-terminal-border pt-2">
            <span>HORIZON: <span className="text-terminal-text">{runSettings.scenarioHorizon}</span></span>
            <span>LENGTH: <span className="text-terminal-text">{runSettings.length}</span></span>
            <span>INSTITUTION LENS: <span className="text-bull-green">{runSettings.institutionLens}</span></span>
            <span>EXOTIC: <span className="text-bull-green">{runSettings.exoticAppendix}</span></span>
            <span>FOCUS: <span className="text-terminal-accent italic">{runSettings.focusQuestion}</span></span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-terminal-border bg-terminal-panel/50 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? 'tab-active' : 'tab-inactive'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'directive' && <DirectiveTab />}
        {activeTab === 'scenarios' && <ScenariosTab />}
        {activeTab === 'synthesis' && <SynthesisTab />}
        {activeTab === 'institution' && <InstitutionTab />}
        {activeTab === 'exotic' && <ExoticTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-terminal-border bg-terminal-panel py-3 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 text-center text-[10px] text-terminal-muted">
          Analytical framework, not investment advice. | Yield-Curve-Prime © 2026 | Data tagged [D] sourced, [E] estimated, [I] inferred, [S] speculative
        </div>
      </footer>
    </div>
  );
}

// ==================== DASHBOARD TAB ====================
function DashboardTab() {
  return (
    <div className="space-y-6">
      {/* Anchor Corrections */}
      <div className="panel">
        <div className="panel-header flex items-center gap-2">
          <span className="text-terminal-accent">⚡</span> ANCHOR CHECK — CORRECTIONS & VERIFICATIONS
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Original</th>
                <th>Verified</th>
                <th>Note</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {anchorCheck.corrections.map((c, i) => (
                <tr key={i}>
                  <td className="font-semibold text-terminal-text">{c.field}</td>
                  <td className="text-terminal-muted">{c.original}</td>
                  <td className="text-terminal-text font-mono">{c.verified}</td>
                  <td className="text-terminal-muted text-xs">{c.note}</td>
                  <td>
                    <span className={`signal-badge ${
                      c.status === 'updated' ? 'signal-neutral' :
                      c.status === 'verified' ? 'signal-bullish' : 'signal-neutral'
                    }`}>
                      {c.status === 'updated' ? '↑ UPDATED' : c.status === 'verified' ? '✓ VERIFIED' : '+ NEW'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Par Curve Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel">
          <div className="panel-header">PAR CURVE — {parCurve.date}</div>
          <div className="p-4">
            <div className="flex items-end gap-4 h-40 mb-4">
              {parCurve.points.map((p) => (
                <div key={p.tenor} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-terminal-accent font-bold">{p.yield}%</span>
                  <div
                    className="w-full bg-gradient-to-t from-terminal-accent/80 to-terminal-accent/30 rounded-t"
                    style={{ height: `${(p.yield / 6) * 100}%` }}
                  ></div>
                  <span className="text-xs text-terminal-muted font-semibold">{p.tenor}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs border-t border-terminal-border pt-2">
              <span>2s10s: <span className="text-bull-green font-bold">+{parCurve.spreads['2s10s']}bp</span></span>
              <span>5s30s: <span className="text-bull-green font-bold">+{parCurve.spreads['5s30s']}bp</span></span>
            </div>
          </div>
        </div>

        {/* The Upshot */}
        <div className="panel lg:col-span-2">
          <div className="panel-header">THE UPSHOT</div>
          <div className="p-4 space-y-3">
            <p className="text-sm leading-relaxed">
              <span className="text-terminal-accent font-bold">DRIVER:</span> The 10y has moved +100bp from the February low driven primarily by term premium repricing (+30bp of the move per ACM) and a repricing of the policy path post-Jackson Hole. Real yields account for ~60bp; breakevens ~40bp. The curve is in a <span className="text-bear-red font-semibold">bear steepener</span> regime since Aug 28 — the long end is leading on fiscal supply concerns, not the short end leading on policy.
            </p>
            <p className="text-sm leading-relaxed">
              <span className="text-terminal-accent font-bold">RISK BALANCE:</span> Skewed toward higher-for-longer (Scenario A, 50%) but with meaningful tail risk of a fiscal supply dislocation (Scenario B, 25%). The stagflationary breakage scenario (C, 25%) requires a growth shock that isn't yet in the data but is building in leading indicators.
            </p>
            <p className="text-sm leading-relaxed">
              <span className="text-terminal-accent font-bold">WATCH:</span> The next 10y auction (Oct 10) is the single most important event. A tail &gt;2.5bp with indirect &lt;62% is the trigger that shifts probability meaningfully toward Scenario B. Until then, the market is testing where the natural buyer base re-engages.
            </p>
          </div>
        </div>
      </div>

      {/* Diagnostic Dashboard Table */}
      <div className="panel">
        <div className="panel-header">DIAGNOSTIC SPINE — SIX-LAYER DASHBOARD</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Layer</th>
                <th>Key Metrics</th>
                <th>Signal</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {diagnosticLayers.map((layer) => (
                <tr key={layer.id}>
                  <td>
                    <div className="font-bold text-terminal-accent">{layer.id}</div>
                    <div className="text-xs text-terminal-muted">{layer.name}</div>
                    <div className="text-[10px] text-terminal-muted">{layer.subtitle}</div>
                  </td>
                  <td>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                      {layer.metrics.slice(0, 6).map((m, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-terminal-muted">{m.name}:</span>
                          <span className="text-terminal-text font-mono ml-2">{m.value} <span className="text-terminal-muted text-[9px]">[{m.tag}]</span></span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`signal-badge ${
                      layer.signal === 'BEARISH' ? 'signal-bearish' :
                      layer.signal === 'BULLISH' ? 'signal-bullish' : 'signal-neutral'
                    }`}>
                      {layer.signal === 'BEARISH' ? '▼' : layer.signal === 'BULLISH' ? '▲' : '◆'} {layer.signal}
                    </span>
                    <div className="text-[10px] text-terminal-muted mt-1">{layer.signalDetail}</div>
                  </td>
                  <td>
                    <span className={`font-bold text-xs ${
                      layer.confidence === 'HIGH' ? 'conf-high' :
                      layer.confidence === 'MED' ? 'conf-med' : 'conf-low'
                    }`}>
                      {layer.confidence === 'HIGH' ? '●●●' : layer.confidence === 'MED' ? '●●○' : '●○○'} {layer.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== DIRECTIVE TAB ====================
function DirectiveTab() {
  return (
    <div className="space-y-6">
      <div className="panel">
        <div className="panel-header text-terminal-accent">
          PART 1 — THE CURRENT DIRECTIVE: THE WARSH REALITY CHECK
        </div>
        <div className="p-6 space-y-6 text-sm leading-relaxed">
          {/* Section 1: Decompose the 10y move */}
          <section>
            <h3 className="text-terminal-accent font-bold text-base mb-3">1. Decomposing the 10y Move</h3>
            <div className="space-y-3">
              <p>
                <span className="text-terminal-accent font-semibold">Since February low (4.12% → 5.14%, +102bp):</span> The move decomposes into three roughly equal components. Expected policy path (SOFR futures implied) contributed ~35bp — the market went from pricing two cuts in 2026 to pricing one hike. Term premium (ACM) repriced +32bp, from +46bp to +78bp — this is the fiscal supply and foreign demand story. The remaining ~35bp is breakeven inflation repricing (5y5y from 2.48% to 2.72%, +24bp) plus a real yield residual. <span className="text-terminal-muted text-xs">[I]</span>
              </p>
              <p>
                <span className="text-terminal-accent font-semibold">Since Jackson Hole (Aug 28) (4.82% → 5.14%, +32bp):</span> This window is entirely a <span className="text-bear-red font-semibold">bear steepener</span>. The 2y rose 18bp (4.68 → 4.86, front-loaded on Dec hike repricing) but the 10y rose 32bp and the 30y rose 42bp. The long end is leading. This is not a policy-driven move — it's a term premium and supply story. Warsh's Jackson Hole speech (emphasizing balance-sheet normalization and fiscal sustainability) was the catalyst, but the move has continued on auction results and corporate supply. <span className="text-terminal-muted text-xs">[D] Treasury par curve, NY Fed ACM</span>
              </p>
              <p>
                <span className="text-terminal-accent font-semibold">Since Sept 16 FOMC (4.96% → 5.14%, +18bp):</span> Post-FOMC, the move accelerated on the combination of: (a) the SEP showing one more hike than the market expected, (b) core PCE projection at 3.4% (vs. market's 3.1%), and (c) the 10y auction on Sept 11 tailing +2.4bp with indirect at 62.8% (below the 65% 12-month average). The FOMC was the trigger; supply was the amplifier. <span className="text-terminal-muted text-xs">[D] Treasury auction results, FOMC SEP</span>
              </p>
            </div>
          </section>

          {/* Section 2: Why long end at 2007 highs */}
          <section>
            <h3 className="text-terminal-accent font-bold text-base mb-3">2. Why the Long End Is at 2007 Highs While the Fed Is Hiking</h3>
            <div className="space-y-3">
              <p>
                This is the central paradox. The Fed is tightening, yet the 30y is at levels last seen when the financial system was melting down in 2007. Five competing explanations, ranked by evidentiary support:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-terminal-bg rounded p-3 border border-terminal-border">
                  <div className="text-xs font-bold text-bear-red mb-1">1. TERM PREMIUM REPRICING (Primary)</div>
                  <p className="text-xs text-terminal-muted">ACM at +78bp, up from +46bp in Feb. Kim-Wright at +65bp. Both models agree: the compensation for holding duration has repriced structurally. This is the fiscal story — deficits at 6.3% of GDP with no consolidation plan. <span className="text-terminal-muted">[D] NY Fed ACM</span></p>
                </div>
                <div className="bg-terminal-bg rounded p-3 border border-terminal-border">
                  <div className="text-xs font-bold text-bear-red mb-1">2. DURATION SUPPLY (Primary)</div>
                  <p className="text-xs text-terminal-muted">Treasury coupon at $128B/mo net. AI/hyperscaler IG issuance at $184B YTD competing for the same buyer base. 5y auction tailing 3.1bp. The natural buyer (foreign official, insurance, pension) is not absorbing supply at these levels. <span className="text-terminal-muted">[D] Treasury QRA, new issuance data</span></p>
                </div>
                <div className="bg-terminal-bg rounded p-3 border border-terminal-border">
                  <div className="text-xs font-bold text-neutral-amber mb-1">3. ENERGY INFLATION RISK PREMIUM (Secondary)</div>
                  <p className="text-xs text-terminal-muted">5y5y BEI at 2.72%, up 24bp from Feb. Oil at $92/bbl on Iran/GCC disruption. The market is pricing an inflation risk premium of ~20-30bp into the long end that wasn't there when energy was $70. <span className="text-terminal-muted">[D] Treasury BREI, EIA</span></p>
                </div>
                <div className="bg-terminal-bg rounded p-3 border border-terminal-border">
                  <div className="text-xs font-bold text-neutral-amber mb-1">4. FADING FOREIGN DEMAND (Secondary)</div>
                  <p className="text-xs text-terminal-muted">TIC data shows foreign official holdings flat-to-down for 6 months. China at $748B (down from $870B peak). FX-hedged yields unattractive for JPY buyers. The marginal foreign buyer needs 5.5%+ to engage on a hedged basis. <span className="text-terminal-muted">[D] TIC, NY Fed custody</span></p>
                </div>
                <div className="bg-terminal-bg rounded p-3 border border-terminal-border">
                  <div className="text-xs font-bold text-terminal-muted mb-1">5. DEALER BALANCE-SHEET LIMITS (Tertiary)</div>
                  <p className="text-xs text-terminal-muted">eSLR constrains dealer intermediation. Primary dealer inventory of UST at $284B (above 90th percentile). The market's "shock absorber" is full. Basel III endgame uncertainty adds caution. <span className="text-terminal-muted">[D] FRED, CFTC</span></p>
                </div>
                <div className="bg-terminal-bg rounded p-3 border border-terminal-border">
                  <div className="text-xs font-bold text-terminal-muted mb-1">6. FED CREDIBILITY / R* (Minor)</div>
                  <p className="text-xs text-terminal-muted">Warsh's first FOMC as Chair — market testing his reaction function. Some repricing of r* higher (strong real growth, fiscal stimulus). But this is ~10bp of the move, not the driver. <span className="text-terminal-muted">[I]</span></p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Three-way battle */}
          <section>
            <h3 className="text-terminal-accent font-bold text-base mb-3">3. The Three-Way Battle</h3>
            <div className="bg-terminal-bg rounded p-4 border border-terminal-border">
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div className="p-3 rounded bg-bull-green/10 border border-bull-green/30">
                  <div className="text-xs text-bull-green font-bold">RESILIENT DATA</div>
                  <div className="text-2xl font-bold text-bull-green mt-1">LOSING</div>
                  <div className="text-[10px] text-terminal-muted mt-1">PMIs strong but payrolls softening</div>
                </div>
                <div className="p-3 rounded bg-bear-red/10 border border-bear-red/30">
                  <div className="text-xs text-bear-red font-bold">DURATION SUPPLY</div>
                  <div className="text-2xl font-bold text-bear-red mt-1">WINNING</div>
                  <div className="text-[10px] text-terminal-muted mt-1">Auctions tailing, TP repricing</div>
                </div>
                <div className="p-3 rounded bg-neutral-amber/10 border border-neutral-amber/30">
                  <div className="text-xs text-neutral-amber font-bold">FED WON'T PIVOT</div>
                  <div className="text-2xl font-bold text-neutral-amber mt-1">HOLDING</div>
                  <div className="text-[10px] text-terminal-muted mt-1">Warsh hawkish, dots signal more</div>
                </div>
              </div>
              <p className="text-xs text-terminal-muted">
                <span className="text-terminal-text font-semibold">Currently winning: Duration supply.</span> The market is price-clearing, not quantity-clearing. Yields must rise to attract the marginal buyer. Data would shift this if: (a) NFP goes negative for 2 months (forces Fed pivot, removes the supply-vs-policy tension), or (b) Treasury shifts issuance to bills (removes the supply pressure at the long end). Until either happens, supply sets the price.
              </p>
            </div>
          </section>

          {/* Section 4: Cross-layer transmission chains */}
          <section>
            <h3 className="text-terminal-accent font-bold text-base mb-3">4. Cross-Layer Transmission Chains</h3>
            <div className="space-y-4">
              <div className="bg-terminal-bg rounded p-4 border border-terminal-border">
                <div className="text-xs font-bold text-terminal-accent mb-2">CHAIN 1: Auction Tails → Dealer Inventory → Swap Spreads → Basis Trade</div>
                <div className="text-xs text-terminal-muted space-y-1">
                  <p>→ 5y auction tails 3.1bp (Sept 18) with dealer takedown at 22% <span className="text-terminal-muted">[D]</span></p>
                  <p>→ Primary dealer UST inventory rises to $284B, above 90th percentile <span className="text-terminal-muted">[D]</span></p>
                  <p>→ Dealer balance sheet capacity constrained → repo haircuts on UST collateral increase 50bp <span className="text-terminal-muted">[E]</span></p>
                  <p>→ 10y swap spread widens to -12bp (from -8bp in August) as cash-futures basis adjusts <span className="text-terminal-muted">[D]</span></p>
                  <p>→ Basis trade becomes less profitable → leveraged funds reduce shorts by $8B in 2 weeks <span className="text-terminal-muted">[D] CFTC TFF</span></p>
                  <p>→ But the unwind itself is destabilizing: selling futures → yields rise → more margin calls → more selling <span className="text-terminal-muted">[I]</span></p>
                </div>
              </div>
              <div className="bg-terminal-bg rounded p-4 border border-terminal-border">
                <div className="text-xs font-bold text-terminal-accent mb-2">CHAIN 2: Energy Shock → Breakevens → Fed Dots → 2y → FX-Hedged Foreign Demand</div>
                <div className="text-xs text-terminal-muted space-y-1">
                  <p>→ Iran/GCC conflict → oil at $92/bbl, +$14 from August <span className="text-terminal-muted">[D] EIA</span></p>
                  <p>→ 5y5y BEI reprices from 2.48% to 2.72% (+24bp) as inflation risk premium builds <span className="text-terminal-muted">[D]</span></p>
                  <p>→ SEP core PCE projection rises to 3.4% → median dot stays at 4.1% (no cut, possible hike) <span className="text-terminal-muted">[D]</span></p>
                  <p>→ 2y reprices from 4.55% to 4.75% (+20bp) on policy path <span className="text-terminal-muted">[D]</span></p>
                  <p>→ FX-hedged 10y for JPY buyer rises to 5.82% (from 5.48%) — now above the 5.75% threshold where Japanese insurance companies historically reduce duration <span className="text-terminal-muted">[E]</span></p>
                  <p>→ Foreign official buying drops: TIC data shows -$22B in August (latest) <span className="text-terminal-muted">[D] TIC</span></p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ==================== SCENARIOS TAB ====================
function ScenariosTab() {
  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | 'C'>('A');

  const scenarioData = scenarios[activeScenario];

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="grid grid-cols-3 gap-3">
        {(['A', 'B', 'C'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setActiveScenario(key)}
            className={`panel p-4 text-left transition-all ${
              activeScenario === key
                ? 'border-terminal-accent ring-1 ring-terminal-accent'
                : 'hover:border-terminal-muted'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-terminal-accent">SCENARIO {key}</span>
              <span className={`text-lg font-bold ${
                key === 'A' ? 'text-neutral-amber' : key === 'B' ? 'text-bear-red' : 'text-info-blue'
              }`}>
                {scenarios[key].probability}%
              </span>
            </div>
            <div className="text-sm font-semibold text-terminal-text">{scenarios[key].name}</div>
            <div className="text-xs text-terminal-muted">{scenarios[key].subtitle}</div>
          </button>
        ))}
      </div>

      {/* Active Scenario Detail */}
      <div className="panel">
        <div className="panel-header flex items-center justify-between">
          <span>
            <span className="text-terminal-accent">SCENARIO {activeScenario}:</span>{' '}
            {scenarioData.name} — {scenarioData.subtitle}
          </span>
          <span className="text-terminal-accent font-bold">{scenarioData.probability}% PROBABILITY</span>
        </div>
        <div className="p-6 space-y-5 text-sm">
          {/* Definition */}
          <div>
            <h4 className="text-xs font-bold text-terminal-muted uppercase tracking-wider mb-2">Definition</h4>
            <p className="leading-relaxed">{scenarioData.definition}</p>
          </div>

          {/* Triggers & Signposts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-terminal-bg rounded p-3 border border-terminal-border">
              <h4 className="text-xs font-bold text-bear-red uppercase tracking-wider mb-2">Triggers Already Visible</h4>
              <ul className="space-y-1">
                {scenarioData.triggers.map((t, i) => (
                  <li key={i} className="text-xs text-terminal-muted flex items-start gap-2">
                    <span className="text-bear-red mt-0.5">▸</span> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-terminal-bg rounded p-3 border border-terminal-border">
              <h4 className="text-xs font-bold text-neutral-amber uppercase tracking-wider mb-2">Signposts (2-6 Week Confirmation)</h4>
              <ul className="space-y-1">
                {scenarioData.signposts.map((s, i) => (
                  <li key={i} className="text-xs text-terminal-muted flex items-start gap-2">
                    <span className="text-neutral-amber mt-0.5">◈</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Path Table */}
          <div>
            <h4 className="text-xs font-bold text-terminal-muted uppercase tracking-wider mb-2">Path Table — From Today's Verified Levels</h4>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Fed Funds</th>
                    <th>2y</th>
                    <th>10y</th>
                    <th>30y</th>
                    <th>2s10s</th>
                    <th>5s30s</th>
                    <th>ACM TP</th>
                    <th>10y Swap Spr</th>
                    <th>SOFR-IORB</th>
                    <th>30y Mort</th>
                    <th>IG OAS</th>
                    <th>HY OAS</th>
                    <th>MOVE</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioData.pathTable.map((row, i) => (
                    <tr key={i} className={i === 0 ? 'bg-terminal-accent/5' : ''}>
                      <td className="font-bold text-terminal-accent">{row.month}</td>
                      <td className="font-mono">{row.funds}</td>
                      <td className="font-mono">{row.y2}</td>
                      <td className="font-mono">{row.y10}</td>
                      <td className="font-mono">{row.y30}</td>
                      <td className="font-mono">{row.s2s10}</td>
                      <td className="font-mono">{row.s5s30}</td>
                      <td className="font-mono">{row.acm}</td>
                      <td className="font-mono">{row.swaps}</td>
                      <td className="font-mono">{row.sofr}</td>
                      <td className="font-mono">{row.mort}</td>
                      <td className="font-mono">{row.ig}</td>
                      <td className="font-mono">{row.hy}</td>
                      <td className="font-mono">{row.move}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Curve Shape */}
          <div className="bg-terminal-bg rounded p-3 border border-terminal-border">
            <h4 className="text-xs font-bold text-info-blue uppercase tracking-wider mb-2">Curve Shape — Derived from Mechanics</h4>
            <p className="text-xs text-terminal-muted leading-relaxed">{scenarioData.curveShape}</p>
          </div>

          {/* Historical Analog */}
          <div className="bg-terminal-bg rounded p-3 border border-terminal-border">
            <h4 className="text-xs font-bold text-terminal-accent uppercase tracking-wider mb-2">Historical Analog</h4>
            <p className="text-xs text-terminal-muted leading-relaxed">{scenarioData.analog}</p>
          </div>

          {/* Invalidation */}
          <div className="bg-bear-red/5 rounded p-3 border border-bear-red/20">
            <h4 className="text-xs font-bold text-bear-red uppercase tracking-wider mb-2">Invalidation — What Kills This Scenario</h4>
            <p className="text-xs text-terminal-muted leading-relaxed">{scenarioData.invalidation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SYNTHESIS TAB ====================
function SynthesisTab() {
  return (
    <div className="space-y-6">
      {/* Scenario Scorecard */}
      <div className="panel">
        <div className="panel-header">SCENARIO SCORECARD — PROBABILITY-SHIFTING INDICATORS</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Indicator</th>
                <th className="text-neutral-amber">→ Scenario A (Muddle)</th>
                <th className="text-bear-red">→ Scenario B (Fiscal)</th>
                <th className="text-info-blue">→ Scenario C (Stagflation)</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {synthesis.scorecard.map((row, i) => (
                <tr key={i}>
                  <td className="font-semibold text-terminal-text">{row.indicator}</td>
                  <td className="text-xs text-neutral-amber">{row.thresholdA}</td>
                  <td className="text-xs text-bear-red">{row.thresholdB}</td>
                  <td className="text-xs text-info-blue">{row.thresholdC}</td>
                  <td>
                    <span className={`text-xs font-bold ${
                      row.weight === 'High' ? 'text-bear-red' : 'text-neutral-amber'
                    }`}>
                      {row.weight}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex gap-4 text-xs text-terminal-muted">
            <span>Shift rule: 3 consecutive coupon tails &gt;2bp → +10pp to B</span>
            <span>|</span>
            <span>NFP &lt;0 for 2 months → +15pp to C</span>
            <span>|</span>
            <span>MOVE &lt;100 sustained → +5pp to A</span>
          </div>
        </div>
      </div>

      {/* Trade Expressions */}
      <div className="panel">
        <div className="panel-header">TRADE EXPRESSIONS — 5 POSITIONING IDEAS</div>
        <div className="p-4 space-y-3">
          {synthesis.trades.map((trade, i) => (
            <div key={i} className="bg-terminal-bg rounded p-3 border border-terminal-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-terminal-accent bg-terminal-accent/10 px-2 py-0.5 rounded">
                    {trade.type}
                  </span>
                  <span className="text-sm font-bold text-terminal-text">{trade.name}</span>
                </div>
                <span className="text-xs text-terminal-muted">Bets on: <span className="text-terminal-accent font-semibold">{trade.scenario}</span></span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-terminal-muted block">Entry:</span>
                  <span className="text-terminal-text">{trade.entry}</span>
                </div>
                <div>
                  <span className="text-terminal-muted block">Carry/Roll:</span>
                  <span className="text-terminal-text">{trade.carry}</span>
                </div>
                <div>
                  <span className="text-terminal-muted block">Target:</span>
                  <span className="text-bull-green">{trade.target}</span>
                </div>
                <div>
                  <span className="text-terminal-muted block">Invalidation:</span>
                  <span className="text-bear-red">{trade.invalidation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dated Watchlist */}
      <div className="panel">
        <div className="panel-header">DATED WATCHLIST — NEXT 4-6 WEEKS</div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>View-Changing Outcome</th>
              </tr>
            </thead>
            <tbody>
              {synthesis.watchlist.map((item, i) => (
                <tr key={i}>
                  <td className="font-mono text-terminal-accent font-bold whitespace-nowrap">{item.date}</td>
                  <td className="font-semibold text-terminal-text">{item.event}</td>
                  <td className="text-xs text-terminal-muted">{item.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== INSTITUTION TAB ====================
function InstitutionTab() {
  return (
    <div className="space-y-6">
      <div className="panel">
        <div className="panel-header text-info-blue">
          PART 6 — INSTITUTION LENS: BANK TREASURY AT A MORTGAGE-SERVICING BANK
        </div>
        <div className="p-6 space-y-6">
          {/* Impact Table */}
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Current State</th>
                  <th className="text-neutral-amber">Scenario A</th>
                  <th className="text-bear-red">Scenario B</th>
                  <th className="text-info-blue">Scenario C</th>
                </tr>
              </thead>
              <tbody>
                {institutionLens.impacts.map((impact, i) => (
                  <tr key={i}>
                    <td className="font-bold text-terminal-text text-xs">{impact.area}</td>
                    <td className="text-xs text-terminal-muted">{impact.current}</td>
                    <td className="text-xs text-neutral-amber">{impact.scenarioA}</td>
                    <td className="text-xs text-bear-red">{impact.scenarioB}</td>
                    <td className="text-xs text-info-blue">{impact.scenarioC}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div>
            <h4 className="text-xs font-bold text-terminal-accent uppercase tracking-wider mb-3">
              ACTIONS TO CONSIDER NOW
            </h4>
            <div className="space-y-2">
              {institutionLens.actions.map((action, i) => (
                <div key={i} className="flex items-center gap-3 bg-terminal-bg rounded p-3 border border-terminal-border">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    action.priority === 'HIGH'
                      ? 'bg-bear-red/20 text-bear-red'
                      : 'bg-neutral-amber/20 text-neutral-amber'
                  }`}>
                    {action.priority}
                  </span>
                  <span className="text-xs text-terminal-text flex-1">{action.action}</span>
                  <span className="text-[10px] text-terminal-muted">
                    Protects against: <span className="text-terminal-accent font-semibold">Scenario {action.protects}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== EXOTIC TAB ====================
function ExoticTab() {
  return (
    <div className="space-y-6">
      {/* Transmission Chains */}
      <div className="panel">
        <div className="panel-header text-terminal-accent">
          APPENDIX — NON-FINANCIAL → YIELD TRANSMISSION CHAINS <span className="text-terminal-muted">[S] SPECULATIVE</span>
        </div>
        <div className="p-6 space-y-6">
          {exoticSignals.chains.map((chain, i) => (
            <div key={i} className="bg-terminal-bg rounded p-4 border border-terminal-border">
              <h4 className="text-sm font-bold text-terminal-accent mb-3">{chain.name}</h4>
              <div className="space-y-1 mb-4">
                {chain.chain.map((step, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs">
                    <span className="text-terminal-accent font-mono mt-px">
                      {j === 0 ? '●' : '→'}
                    </span>
                    <span className="text-terminal-muted">{step}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs border-t border-terminal-border pt-3">
                <div>
                  <span className="text-terminal-muted block font-semibold">Source:</span>
                  <span className="text-terminal-text">{chain.source}</span>
                </div>
                <div>
                  <span className="text-terminal-muted block font-semibold">Lag:</span>
                  <span className="text-terminal-text">{chain.lag}</span>
                </div>
                <div>
                  <span className="text-terminal-muted block font-semibold">Sign:</span>
                  <span className="text-terminal-text">{chain.sign}</span>
                </div>
                <div>
                  <span className="text-terminal-muted block font-semibold">Magnitude:</span>
                  <span className="text-terminal-text">{chain.magnitude}</span>
                </div>
                <div>
                  <span className="text-terminal-muted block font-semibold">Falsification:</span>
                  <span className="text-bear-red">{chain.falsification}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invented Indicator */}
      <div className="panel">
        <div className="panel-header text-terminal-accent">
          INVENTED LEADING INDICATOR — THE WARSH-WIGGLE (WW-30)
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-terminal-bg rounded p-4 border border-terminal-border">
            <h4 className="text-sm font-bold text-terminal-accent mb-2">Formula</h4>
            <code className="text-xs text-bull-green block bg-black/30 rounded p-2 font-mono">
              {exoticSignals.inventedIndicator.formula}
            </code>
          </div>
          <div className="text-sm text-terminal-muted leading-relaxed">
            {exoticSignals.inventedIndicator.description}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-terminal-bg rounded p-3 border border-terminal-border">
              <h5 className="text-xs font-bold text-terminal-muted uppercase mb-2">Data Sources</h5>
              <p className="text-xs text-terminal-muted">{exoticSignals.inventedIndicator.dataSources}</p>
            </div>
            <div className="bg-terminal-bg rounded p-3 border border-terminal-border">
              <h5 className="text-xs font-bold text-terminal-muted uppercase mb-2">Backtest Design</h5>
              <p className="text-xs text-terminal-muted">{exoticSignals.inventedIndicator.backtest}</p>
            </div>
          </div>
          <div className="bg-bear-red/5 rounded p-3 border border-bear-red/20">
            <h5 className="text-xs font-bold text-bear-red uppercase mb-2">⚠ Honest Data-Mining Caveat</h5>
            <p className="text-xs text-terminal-muted">{exoticSignals.inventedIndicator.caveat}</p>
          </div>
          <div className="bg-terminal-bg rounded p-3 border border-terminal-accent/30">
            <h5 className="text-xs font-bold text-terminal-accent uppercase mb-2">Trade It Would Trigger</h5>
            <p className="text-xs text-terminal-muted">{exoticSignals.inventedIndicator.trade}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

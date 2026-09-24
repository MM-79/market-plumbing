import type { AuditSummary, AuditResult } from '../lib/audit';

const sevStyle = (s: AuditResult['severity']) =>
  s === 'FAIL' ? 'text-bear-red border-bear-red/40 bg-bear-red/10'
  : s === 'WARN' ? 'text-neutral-amber border-neutral-amber/40 bg-neutral-amber/10'
  : 'text-bull-green border-bull-green/30 bg-bull-green/5';

/**
 * The self-check, rendered rather than promised.
 *
 * Leviathan section 7 is a checklist the analyst is supposed to run before
 * delivering. In v1 it was run by a human, once, in their head, and the reader
 * had no way to know. Here it runs in code on every load and prints the
 * failures at the top of the page. The compact bar is visible on every tab.
 */
export function AuditBar({ summary, onOpen }: { summary: AuditSummary; onOpen: () => void }) {
  // Literal class strings only - Tailwind v4 cannot see `text-${tone}`.
  const tone = summary.fails > 0 ? 'text-bear-red'
    : summary.warns > 0 ? 'text-neutral-amber'
    : 'text-bull-green';
  return (
    <button
      onClick={onOpen}
      className={`w-full text-left px-3 py-2 border rounded text-[11px] flex items-center gap-3 hover:brightness-125 transition ${
        summary.fails > 0 ? 'border-bear-red/40 bg-bear-red/10'
        : summary.warns > 0 ? 'border-neutral-amber/40 bg-neutral-amber/10'
        : 'border-bull-green/30 bg-bull-green/5'
      }`}
    >
      <span className={`font-bold ${tone} tracking-wider`}>SELF-CHECK</span>
      <span className="text-bear-red">{summary.fails} FAIL</span>
      <span className="text-neutral-amber">{summary.warns} WARN</span>
      <span className="text-bull-green">{summary.passes} PASS</span>
      <span className="text-terminal-muted truncate flex-1">{summary.verdict}</span>
      <span className="text-terminal-muted">open &rsaquo;</span>
    </button>
  );
}

export function AuditPanel({ summary }: { summary: AuditSummary }) {
  const order = { FAIL: 0, WARN: 1, PASS: 2 } as const;
  const sorted = [...summary.results].sort((a, b) => order[a.severity] - order[b.severity]);

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">SELF-CHECK &mdash; LEVIATHAN SECTION 7, RUN AS CODE</div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-terminal-muted leading-relaxed">
            Every check below runs against the live data objects on each page load. A framework
            that cannot be caught being wrong is not a framework. Note the limit of what a pass
            means: these checks verify that the numbers on this page agree with each other and
            with their own stated provenance. They say nothing whatsoever about whether the view
            is correct. Internal consistency is a floor, not a ceiling.
          </p>
          <div className="flex gap-4 text-xs font-bold">
            <span className="text-bear-red">{summary.fails} FAIL</span>
            <span className="text-neutral-amber">{summary.warns} WARN</span>
            <span className="text-bull-green">{summary.passes} PASS</span>
          </div>
          <p className="text-xs text-terminal-text">{summary.verdict}</p>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((r) => (
          <div key={r.id} className={`border rounded p-3 ${sevStyle(r.severity)}`}>
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-bold">{r.check}</span>
              <span className="text-[10px] font-bold tracking-wider shrink-0">{r.severity}</span>
            </div>
            <p className="text-[11px] text-terminal-muted mt-1 leading-relaxed">{r.detail}</p>
            <p className="text-[10px] text-terminal-muted/70 mt-1 italic">{r.clause}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuditPanel;

import { type SoWhatData } from '../data/soWhatData';

interface SoWhatSectionProps {
  data: SoWhatData;
  partTitle: string;
}

function SoWhatSection({ data, partTitle }: SoWhatSectionProps) {
  const directionColor = (dir: string) => {
    switch (dir) {
      case 'BULLISH': return 'text-bull-green';
      case 'BEARISH': return 'text-bear-red';
      case 'NEUTRAL': return 'text-neutral-amber';
      case 'MIXED': return 'text-info-blue';
      default: return 'text-terminal-muted';
    }
  };

  const directionBg = (dir: string) => {
    switch (dir) {
      case 'BULLISH': return 'bg-bull-green/10 border-bull-green/30';
      case 'BEARISH': return 'bg-bear-red/10 border-bear-red/30';
      case 'NEUTRAL': return 'bg-neutral-amber/10 border-neutral-amber/30';
      case 'MIXED': return 'bg-info-blue/10 border-info-blue/30';
      default: return 'bg-terminal-bg border-terminal-border';
    }
  };

  const directionIcon = (dir: string) => {
    switch (dir) {
      case 'BULLISH': return '▲';
      case 'BEARISH': return '▼';
      case 'NEUTRAL': return '◆';
      case 'MIXED': return '◈';
      default: return '•';
    }
  };

  const magnitudeBar = (mag: string) => {
    const fills = mag === 'HIGH' ? 3 : mag === 'MED' ? 2 : 1;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-sm ${
              i <= fills ? 'bg-terminal-accent' : 'bg-terminal-border'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="panel border-l-4 border-l-terminal-accent">
      <div className="panel-header flex items-center gap-2">
        <span className="text-terminal-accent text-base">⚡</span>
        <span className="text-terminal-accent">SO-WHAT?</span>
        <span className="text-terminal-muted">— Directional Market Impact | {partTitle}</span>
      </div>

      <div className="p-5 space-y-6">
        {/* Summary */}
        <div className="bg-terminal-bg rounded p-4 border border-terminal-accent/20">
          <p className="text-sm text-terminal-text leading-relaxed">
            <span className="text-terminal-accent font-bold">BOTTOM LINE: </span>
            {data.summary}
          </p>
        </div>

        {/* Sector Impact Grid */}
        <div>
          <h4 className="text-xs font-bold text-terminal-muted uppercase tracking-wider mb-3">
            Sector Impact — SPY Definitions (GICS)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {data.sectors.map((sector, i) => (
              <div
                key={i}
                className={`rounded p-3 border ${directionBg(sector.direction)} transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${directionColor(sector.direction)}`}>
                      {directionIcon(sector.direction)}
                    </span>
                    <span className="text-xs font-bold text-terminal-text">{sector.ticker}</span>
                    <span className="text-[10px] text-terminal-muted">{sector.sector}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {magnitudeBar(sector.magnitude)}
                  </div>
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${directionColor(sector.direction)}`}>
                  {sector.direction} — {sector.magnitude} Magnitude
                </div>
                <p className="text-[11px] text-terminal-muted leading-relaxed">
                  {sector.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Market Cap Narratives */}
        <div>
          <h4 className="text-xs font-bold text-terminal-muted uppercase tracking-wider mb-3">
            Market Cap Narrative — Small / Mid / Large
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {data.caps.map((cap, i) => {
              // Literal class strings only. Tailwind v4 scans source text for
              // class names and never emits a class assembled as `text-${x}`,
              // so the v1 version of this block rendered every cap card
              // borderless and colourless without erroring.
              const cap_ = cap.cap === 'Small Cap'
                ? { border: 'border-bear-red/30', text: 'text-bear-red', tint: 'bg-bear-red/10', idx: 'RUT' }
                : cap.cap === 'Mid Cap'
                ? { border: 'border-neutral-amber/30', text: 'text-neutral-amber', tint: 'bg-neutral-amber/10', idx: 'MDY' }
                : { border: 'border-bull-green/30', text: 'text-bull-green', tint: 'bg-bull-green/10', idx: 'SPY' };
              return (
                <div key={i} className={`bg-terminal-bg rounded p-4 border ${cap_.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className={`text-xs font-bold ${cap_.text}`}>{cap.cap}</span>
                      <span className="text-[10px] text-terminal-muted ml-2">({cap.index})</span>
                    </div>
                    <span className={`text-[10px] font-mono ${cap_.text} ${cap_.tint} px-1.5 py-0.5 rounded`}>
                      {cap_.idx}
                    </span>
                  </div>
                  <div className={`text-sm font-bold ${cap_.text} mb-2`}>
                    {cap.verdict}
                  </div>
                  <p className="text-[11px] text-terminal-muted leading-relaxed mb-3">
                    {cap.thesis}
                  </p>
                  <div className="space-y-2 border-t border-terminal-border pt-2">
                    <div>
                      <span className="text-[10px] font-bold text-bear-red uppercase">Key Risk:</span>
                      <p className="text-[10px] text-terminal-muted leading-relaxed">{cap.keyRisk}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-bull-green uppercase">Key Catalyst:</span>
                      <p className="text-[10px] text-terminal-muted leading-relaxed">{cap.keyCatalyst}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoWhatSection;

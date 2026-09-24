import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { PathRow } from '../types/framework';

const TENORS = [2, 5, 10, 30];

const SCENARIO_COLOR: Record<string, string> = {
  Today: '#f59e0b',
  A: '#f59e0b',
  B: '#ef4444',
  C: '#3b82f6',
  D: '#10b981',
};

/**
 * v1 drew the curve as four CSS divs with heights proportional to yield, which
 * put the baseline at 0% and compressed the entire 2-30y structure - the part
 * anyone actually looks at - into the top 15% of the panel. A 39bp slope was
 * visually indistinguishable from a 0bp slope. Here the y-axis is scaled to the
 * data with a small pad, and the x-axis is LOG-scaled in tenor, which is how
 * curves are read: the distance from 2y to 5y matters as much as 10y to 30y.
 */
export function CurveChart({
  rows, title,
}: {
  rows: { label: string; row: PathRow; color?: string }[];
  title: string;
}) {
  const data = TENORS.map((t) => {
    const point: Record<string, number | string> = { tenor: t, tenorLabel: `${t}y` };
    for (const r of rows) {
      const key = t === 2 ? 'y2' : t === 5 ? 'y5' : t === 10 ? 'y10' : 'y30';
      point[r.label] = r.row[key as 'y2' | 'y5' | 'y10' | 'y30'];
    }
    return point;
  });

  const all = rows.flatMap((r) => [r.row.y2, r.row.y5, r.row.y10, r.row.y30]);
  const lo = Math.floor((Math.min(...all) - 0.15) * 10) / 10;
  const hi = Math.ceil((Math.max(...all) + 0.15) * 10) / 10;

  return (
    <div>
      <div className="text-[10px] text-terminal-muted mb-1 uppercase tracking-wider">{title}</div>
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" />
          <XAxis
            dataKey="tenor" scale="log" type="number" domain={[2, 30]}
            ticks={TENORS} tickFormatter={(v) => `${v}y`}
            stroke="#64748b" tick={{ fontSize: 10 }}
          />
          <YAxis
            domain={[lo, hi]} stroke="#64748b" tick={{ fontSize: 10 }}
            tickFormatter={(v) => `${Number(v).toFixed(1)}`}
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #1e293b', fontSize: 11 }}
            labelFormatter={(v) => `${v}y`}
            formatter={(v: number | string) => [`${Number(v).toFixed(2)}%`, '']}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {rows.map((r) => (
            <Line
              key={r.label} type="monotone" dataKey={r.label}
              stroke={r.color ?? SCENARIO_COLOR[r.label] ?? '#64748b'}
              strokeWidth={r.label === 'Today' ? 2.5 : 1.8}
              strokeDasharray={r.label === 'Today' ? undefined : '4 3'}
              dot={{ r: 3 }} activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CurveChart;

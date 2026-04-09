import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { BatchTimeline } from '../../utils/capacityCalculator';
import { formatDuration } from '../../utils/formatters';

interface GanttChartProps {
  batches: BatchTimeline[];
  totalDays: number;
  targetDays: number | null;
}

interface GanttDataPoint {
  name: string;
  [key: string]: number | string;
}

export default function GanttChart({ batches, totalDays, targetDays }: GanttChartProps) {
  if (batches.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500 italic">
        Configure batches and phases to see the timeline.
      </div>
    );
  }

  const data: GanttDataPoint[] = batches.map((batch) => {
    const point: GanttDataPoint = { name: `Batch ${batch.batchNumber}` };
    batch.phases.forEach((phase) => {
      point[`${phase.phase}Offset`] = phase.startDay;
      point[`${phase.phase}Duration`] = phase.endDay - phase.startDay;
    });
    return point;
  });

  const phases = batches[0]?.phases ?? [];
  const maxDay = Math.max(totalDays, targetDays ?? 0) + 2;

  return (
    <div style={{ height: Math.max(120, batches.length * 60 + 60) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <XAxis
            type="number"
            domain={[0, maxDay]}
            tickFormatter={(v: number) => `Day ${v}`}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={70}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <Tooltip
            formatter={(value, name) => {
              const nameStr = String(name);
              if (nameStr.endsWith('Offset')) return [null, null];
              const label = nameStr.replace('Duration', '');
              const phaseInfo = phases.find((p) => p.phase === label);
              return [formatDuration(Number(value)), phaseInfo?.label ?? label];
            }}
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          {targetDays !== null && targetDays > 0 && (
            <ReferenceLine
              x={targetDays}
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="6 3"
              label={{
                value: 'Target',
                position: 'top',
                fill: '#EF4444',
                fontSize: 11,
              }}
            />
          )}
          {phases.map((phase) => (
            <Bar
              key={`${phase.phase}Offset`}
              dataKey={`${phase.phase}Offset`}
              stackId="a"
              fill="transparent"
              isAnimationActive={false}
            />
          ))}
          {phases.map((phase) => (
            <Bar
              key={`${phase.phase}Duration`}
              dataKey={`${phase.phase}Duration`}
              stackId="a"
              fill={phase.color}
              radius={[3, 3, 3, 3]}
              isAnimationActive={false}
            >
              {data.map((_entry, index) => {
                const batch = batches[index];
                const batchPhase = batch.phases.find((p) => p.phase === phase.phase);
                const exceeds = batchPhase?.exceedsTarget ?? false;
                return (
                  <Cell
                    key={`${phase.phase}-${index}`}
                    fill={exceeds ? '#EF4444' : phase.color}
                  />
                );
              })}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

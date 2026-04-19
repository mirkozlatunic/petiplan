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
import { formatDuration, parseDateLocal } from '../../utils/formatters';
import { useTheme } from '@/context/ThemeContext';

function TargetLabel({ viewBox }: { viewBox?: { x?: number; y?: number } }) {
  const x = viewBox?.x ?? 0;
  const labelWidth = 100;
  const labelHeight = 20;
  const padding = 6;
  return (
    <g>
      <rect
        x={x - labelWidth / 2}
        y={-labelHeight - padding}
        width={labelWidth}
        height={labelHeight}
        rx={4}
        fill="#EF4444"
      />
      <text
        x={x}
        y={-labelHeight - padding + labelHeight / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#FFFFFF"
        fontSize={11}
        fontWeight={600}
      >
        Target Deadline
      </text>
    </g>
  );
}

interface GanttChartProps {
  batches: BatchTimeline[];
  totalDays: number;
  targetDays: number | null;
  startDate: string;
}

interface GanttDataPoint {
  name: string;
  [key: string]: number | string;
}

export default function GanttChart({ batches, totalDays, targetDays, startDate }: GanttChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div style={{ height: Math.max(140, batches.length * 60 + 80) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 28, right: 30, left: 20, bottom: 10 }}>
          <XAxis
            type="number"
            domain={[0, maxDay]}
            tickFormatter={(v: number) => {
              if (!startDate) return `Day ${v}`;
              // Parse in local time to avoid UTC midnight being yesterday in UTC- timezones
              const date = parseDateLocal(startDate);
              date.setDate(date.getDate() + v);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
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
              backgroundColor: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)',
              border: isDark ? '1px solid #475569' : '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
              color: isDark ? '#e2e8f0' : '#1e293b',
            }}
            cursor={{ fill: isDark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.05)' }}
          />
          {targetDays !== null && targetDays > 0 && (
            <ReferenceLine
              x={targetDays}
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="6 3"
              ifOverflow="extendDomain"
              label={<TargetLabel />}
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

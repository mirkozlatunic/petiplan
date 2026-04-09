import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface CostPieChartProps {
  materialsCost: number;
  machineCost: number;
  laborCost: number;
}

const COLORS = ['#1E3A5F', '#0D9488', '#F59E0B'];

interface PieEntry {
  name: string;
  value: number;
  color: string;
}

export default function CostPieChart({ materialsCost, machineCost, laborCost }: CostPieChartProps) {
  const data: PieEntry[] = [
    { name: 'Raw Materials', value: materialsCost, color: COLORS[0] },
    { name: 'Equipment', value: machineCost, color: COLORS[1] },
    { name: 'Labor', value: laborCost, color: COLORS[2] },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500 italic">
        Add costs to see the breakdown chart.
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), '']}
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            formatter={(value, entry) => {
              const payload = entry.payload as PieEntry | undefined;
              if (!payload) return value;
              const pct = total > 0 ? ((payload.value / total) * 100).toFixed(1) : '0';
              return `${value} (${pct}%)`;
            }}
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

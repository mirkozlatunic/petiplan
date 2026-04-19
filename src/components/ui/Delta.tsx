import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface DeltaProps {
  current: number;
  previous: number;
  label: string;
}

/** Displays the difference between two cost values with trend icon and percent change. */
export default function Delta({ current, previous, label }: DeltaProps) {
  const diff = current - previous;
  const pct = previous > 0 ? (diff / previous) * 100 : 0;
  const isUp = diff > 0;

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`flex items-center gap-1 font-medium ${isUp ? 'text-danger' : 'text-success'}`}>
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isUp ? '+' : ''}{formatCurrency(diff)} ({isUp ? '+' : ''}{formatPercent(pct)})
      </span>
    </div>
  );
}

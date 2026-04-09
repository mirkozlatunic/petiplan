import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  subtitle?: string;
  highlight?: boolean;
}

export default function KpiCard({ label, value, icon, subtitle, highlight = false }: KpiCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        highlight
          ? 'border-accent-300 dark:border-accent-700 bg-accent-50 dark:bg-accent-900/20'
          : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
      <p
        className={`text-2xl font-bold ${
          highlight ? 'text-accent-600 dark:text-accent-400' : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

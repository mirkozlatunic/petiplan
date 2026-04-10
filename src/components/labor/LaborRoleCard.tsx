import { Trash2 } from 'lucide-react';
import type { LaborRole } from '../../types';
import { useProjectDispatch } from '../../context/ProjectContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface LaborRoleCardProps {
  role: LaborRole;
}

const inputClass =
  'w-full px-2 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100';

const labelClass = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';

export default function LaborRoleCard({ role }: LaborRoleCardProps) {
  const dispatch = useProjectDispatch();

  const update = (updates: Partial<LaborRole>) => {
    dispatch({ type: 'UPDATE_LABOR_ROLE', payload: { id: role.id, updates } });
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
      <div className="flex items-start justify-between mb-3">
        <input
          type="text"
          className="text-sm font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100"
          value={role.name}
          onChange={(e) => update({ name: e.target.value })}
        />
        <button
          onClick={() => dispatch({ type: 'REMOVE_LABOR_ROLE', payload: role.id })}
          className="p-1 text-gray-400 hover:text-danger transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Hourly Rate ($)</label>
          <input
            type="number"
            className={inputClass}
            min={0}
            step={1}
            value={role.hourlyRate || ''}
            onChange={(e) => update({ hourlyRate: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className={labelClass}>Hours / Batch</label>
          <input
            type="number"
            className={inputClass}
            min={0}
            step={1}
            value={role.hoursPerBatch || ''}
            onChange={(e) => update({ hoursPerBatch: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className={labelClass}>Headcount</label>
          <input
            type="number"
            className={inputClass}
            min={1}
            step={1}
            value={role.headcount || ''}
            onChange={(e) => update({ headcount: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          FTE: {formatNumber(role.fte, 2)}
        </span>
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Cost per batch: </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(role.costPerBatch)}
          </span>
        </div>
      </div>
    </div>
  );
}

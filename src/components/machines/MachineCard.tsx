import { Trash2, AlertTriangle, Link } from 'lucide-react';
import type { Machine, Phase } from '../../types';
import { useProjectDispatch } from '../../context/ProjectContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const PHASE_LABELS: Record<Phase, string> = {
  synthesis: 'Synthesis',
  cleavage: 'Cleavage',
  purification: 'Purification',
  lyophilization: 'Lyophilization',
  qc: 'QC/Analysis',
};

interface MachineCardProps {
  machine: Machine;
  isBottleneck: boolean;
}

const inputClass =
  'w-full px-2 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100';

const labelClass = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';

export default function MachineCard({ machine, isBottleneck }: MachineCardProps) {
  const dispatch = useProjectDispatch();

  const update = (updates: Partial<Machine>) => {
    dispatch({ type: 'UPDATE_MACHINE', payload: { id: machine.id, updates } });
  };

  const handleDelete = () => {
    if (window.confirm(`Remove "${machine.name}"? This cannot be undone.`)) {
      dispatch({ type: 'REMOVE_MACHINE', payload: machine.id });
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        isBottleneck
          ? 'border-danger bg-red-50 dark:bg-red-900/10 dark:border-red-800'
          : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            aria-label="Machine name"
            className="text-sm font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 w-full"
            value={machine.name}
            onChange={(e) => update({ name: e.target.value })}
          />
          {machine.linkedPhase && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 rounded-full whitespace-nowrap">
              <Link className="w-3 h-3" />
              {PHASE_LABELS[machine.linkedPhase]}
            </span>
          )}
          {isBottleneck && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-danger text-white rounded-full whitespace-nowrap">
              <AlertTriangle className="w-3 h-3" />
              Bottleneck
            </span>
          )}
        </div>
        <button
          onClick={handleDelete}
          aria-label={`Remove ${machine.name}`}
          className="p-1 text-gray-400 hover:text-danger transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className={labelClass}>Hourly Cost ($)</label>
          <input
            type="number"
            className={inputClass}
            min={0}
            step={1}
            value={machine.hourlyCost || ''}
            onChange={(e) => update({ hourlyCost: Math.max(0, parseFloat(e.target.value) || 0) })}
          />
        </div>
        <div>
          <label className={labelClass}>Hours / Batch</label>
          <input
            type="number"
            className={inputClass}
            min={0}
            step={1}
            value={machine.hoursPerBatch || ''}
            onChange={(e) => update({ hoursPerBatch: Math.max(0, parseFloat(e.target.value) || 0) })}
          />
        </div>
        <div>
          <label className={labelClass}>Units Available</label>
          <input
            type="number"
            className={inputClass}
            min={1}
            step={1}
            value={machine.unitsAvailable || ''}
            onChange={(e) => update({ unitsAvailable: Math.max(1, parseInt(e.target.value) || 1) })}
          />
        </div>
        <div>
          <label className={labelClass}>
            Utilization ({formatPercent(machine.utilization * 100)})
          </label>
          <input
            type="range"
            aria-label={`Utilization: ${formatPercent(machine.utilization * 100)}`}
            className="w-full accent-accent-500"
            min={0}
            max={1}
            step={0.05}
            value={machine.utilization}
            onChange={(e) => update({ utilization: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="mt-3 text-right">
        <span className="text-xs text-gray-500 dark:text-gray-400">Cost per batch: </span>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {formatCurrency(machine.costPerBatch)}
        </span>
      </div>
    </div>
  );
}

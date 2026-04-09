import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import { LABOR_PRESETS } from '../../constants/laborPresets';
import { calculateLaborCost } from '../../utils/costCalculator';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import LaborRoleCard from './LaborRoleCard';

export default function LaborCalculator() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();
  const [showPresets, setShowPresets] = useState(false);

  const costs = calculateLaborCost(state.laborRoles, state.batchCount);

  const addFromPreset = (presetIndex: number) => {
    const preset = LABOR_PRESETS[presetIndex];
    dispatch({
      type: 'ADD_LABOR_ROLE',
      payload: {
        name: preset.name,
        hourlyRate: preset.hourlyRate,
        hoursPerBatch: preset.hoursPerBatch,
        headcount: preset.headcount,
      },
    });
    setShowPresets(false);
  };

  const addCustom = () => {
    dispatch({
      type: 'ADD_LABOR_ROLE',
      payload: {
        name: 'Custom Role',
        hourlyRate: 50,
        hoursPerBatch: 8,
        headcount: 1,
      },
    });
  };

  return (
    <div className="space-y-3">
      {state.laborRoles.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
          No labor roles added yet. Add roles to calculate labor costs and FTE requirements.
        </p>
      )}

      {state.laborRoles.map((r) => (
        <LaborRoleCard key={r.id} role={r} />
      ))}

      <div className="relative">
        <div className="flex gap-2">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </button>
          <button
            onClick={addCustom}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            Custom
          </button>
        </div>

        {showPresets && (
          <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-1">
            {LABOR_PRESETS.map((preset, i) => (
              <button
                key={preset.name}
                onClick={() => addFromPreset(i)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                {preset.name}
                <span className="text-xs text-gray-400 ml-2">${preset.hourlyRate}/hr</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {state.laborRoles.length > 0 && (
        <div className="pt-4 border-t-2 border-gray-200 dark:border-slate-700 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Total Labor Cost per Batch
            </span>
            <span className="text-lg font-bold text-primary-500">
              {formatCurrency(state.laborRoles.reduce((sum, r) => sum + r.costPerBatch, 0))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total for {state.batchCount} batch{state.batchCount !== 1 ? 'es' : ''}
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {formatCurrency(costs.totalLaborCost)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Person-Hours</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formatNumber(costs.totalPersonHours, 0)} hrs
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">FTE Equivalent</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formatNumber(costs.totalFte, 2)} FTE
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

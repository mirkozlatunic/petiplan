import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import { MACHINE_PRESETS } from '../../constants/machinePresets';
import { calculateMachineCost } from '../../utils/costCalculator';
import { detectBottleneck } from '../../utils/capacityCalculator';
import { formatCurrency } from '../../utils/formatters';
import MachineCard from './MachineCard';

export default function MachineCalculator() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();
  const [showPresets, setShowPresets] = useState(false);

  const bottleneck = detectBottleneck(state.machines);
  const costs = calculateMachineCost(state.machines, state.batchCount);

  const addFromPreset = (presetIndex: number) => {
    const preset = MACHINE_PRESETS[presetIndex];
    dispatch({
      type: 'ADD_MACHINE',
      payload: {
        name: preset.name,
        hourlyCost: preset.hourlyCost,
        hoursPerBatch: preset.hoursPerBatch,
        unitsAvailable: preset.unitsAvailable,
        utilization: preset.utilization,
        linkedPhase: preset.linkedPhase,
      },
    });
    setShowPresets(false);
  };

  const addCustom = () => {
    dispatch({
      type: 'ADD_MACHINE',
      payload: {
        name: 'Custom Machine',
        hourlyCost: 25,
        hoursPerBatch: 8,
        unitsAvailable: 1,
        utilization: 0.85,
      },
    });
  };

  return (
    <div className="space-y-3">
      {state.machines.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
          No machines added yet. Add equipment to calculate machine costs and identify bottlenecks.
        </p>
      )}

      {state.machines.map((m) => (
        <MachineCard
          key={m.id}
          machine={m}
          isBottleneck={bottleneck?.machineId === m.id}
        />
      ))}

      <div className="relative">
        <div className="flex gap-2">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Machine
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
            {MACHINE_PRESETS.map((preset, i) => (
              <button
                key={preset.name}
                onClick={() => addFromPreset(i)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                {preset.name}
                <span className="text-xs text-gray-400 ml-2">${preset.hourlyCost}/hr</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {state.machines.length > 0 && (
        <div className="pt-4 border-t-2 border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Total Equipment Cost per Batch
            </span>
            <span className="text-lg font-bold text-primary-500">
              {formatCurrency(state.machines.reduce((sum, m) => sum + m.costPerBatch, 0))}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total for {state.batchCount} batch{state.batchCount !== 1 ? 'es' : ''}
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {formatCurrency(costs.totalMachineCost)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

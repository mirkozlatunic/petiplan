import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import { formatCurrency } from '../../utils/formatters';

const PRESETS = [
  { name: 'DMF (Dimethylformamide)', quantity: 1, unit: 'L', costPerUnit: 45 },
  { name: 'DCM (Dichloromethane)', quantity: 1, unit: 'L', costPerUnit: 35 },
  { name: 'TFA (Trifluoroacetic acid)', quantity: 0.5, unit: 'L', costPerUnit: 120 },
  { name: 'Piperidine (20%)', quantity: 0.5, unit: 'L', costPerUnit: 55 },
  { name: 'Diethyl Ether', quantity: 1, unit: 'L', costPerUnit: 40 },
  { name: 'Acetonitrile (HPLC grade)', quantity: 1, unit: 'L', costPerUnit: 65 },
  { name: 'Silica Gel (60 \u00C5)', quantity: 500, unit: 'g', costPerUnit: 0.15 },
  { name: 'HPLC Column (C18)', quantity: 1, unit: 'pc', costPerUnit: 350 },
  { name: 'Lyophilization Vials', quantity: 50, unit: 'pc', costPerUnit: 2.5 },
  { name: 'Scintillation Vials', quantity: 100, unit: 'pc', costPerUnit: 0.8 },
  { name: 'Filter Membranes (0.45 \u00B5m)', quantity: 25, unit: 'pc', costPerUnit: 3.5 },
  { name: 'Nitrogen Gas (High Purity)', quantity: 1, unit: 'cylinder', costPerUnit: 85 },
];

const inputClass =
  'w-full px-2 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100';

export default function OtherMaterialsCalculator() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();
  const [adding, setAdding] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'g', costPerUnit: 0 });

  const handleAdd = () => {
    if (!newItem.name) return;
    dispatch({ type: 'ADD_OTHER_MATERIAL', payload: newItem });
    setNewItem({ name: '', quantity: 1, unit: 'g', costPerUnit: 0 });
    setAdding(false);
  };

  const handleAddPreset = (preset: typeof PRESETS[number]) => {
    dispatch({ type: 'ADD_OTHER_MATERIAL', payload: preset });
    setShowPresets(false);
  };

  const totalCost = state.otherMaterials.reduce((sum, m) => sum + m.subtotal, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add solvents, reagents, consumables, and technical items used in production.
        </p>
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              From Preset
            </button>
            {showPresets && (
              <div className="absolute right-0 top-full mt-1 z-50 w-72 max-h-64 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-xl">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleAddPreset(preset)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-slate-700 last:border-0 transition-colors"
                  >
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                      {preset.quantity} {preset.unit} @ {formatCurrency(preset.costPerUnit)}/{preset.unit}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Custom Item
          </button>
        </div>
      </div>

      {state.otherMaterials.length > 0 && (
        <div className="space-y-1.5">
          {state.otherMaterials.map((m) => (
            <div
              key={m.id}
              className="py-2 px-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
            >
              {/* Mobile: name + trash on top row */}
              <div className="flex items-center justify-between mb-1.5 sm:hidden">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">{m.name}</span>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_OTHER_MATERIAL', payload: m.id })}
                  className="p-1 text-gray-400 hover:text-danger transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Inputs row */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:block flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{m.name}</span>
                <input
                  type="number"
                  className="w-16 px-2 py-1 text-right text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100"
                  value={m.quantity || ''}
                  min={0}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_OTHER_MATERIAL',
                      payload: { id: m.id, updates: { quantity: parseFloat(e.target.value) || 0 } },
                    })
                  }
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8 shrink-0">{m.unit}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">@</span>
                <input
                  type="number"
                  className="w-20 px-2 py-1 text-right text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100"
                  value={m.costPerUnit || ''}
                  min={0}
                  step={0.01}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_OTHER_MATERIAL',
                      payload: { id: m.id, updates: { costPerUnit: parseFloat(e.target.value) || 0 } },
                    })
                  }
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-auto sm:w-24 text-right shrink-0">
                  {formatCurrency(m.subtotal)}
                </span>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_OTHER_MATERIAL', payload: m.id })}
                  className="hidden sm:flex p-1 text-gray-400 hover:text-danger transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="p-3 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input
              type="text"
              className={inputClass}
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              autoFocus
            />
            <input
              type="number"
              className={inputClass}
              placeholder="Qty"
              min={0}
              value={newItem.quantity || ''}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
            />
            <input
              type="text"
              className={inputClass}
              placeholder="Unit (g, mL, pc, etc.)"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            />
            <input
              type="number"
              className={inputClass}
              placeholder="Cost per unit"
              min={0}
              step={0.01}
              value={newItem.costPerUnit || ''}
              onChange={(e) =>
                setNewItem({ ...newItem, costPerUnit: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 text-sm font-medium text-white bg-accent-500 rounded-lg hover:bg-accent-600 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {state.otherMaterials.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Other Materials Cost per Batch
            </span>
            <span className="text-base font-bold text-primary-500">
              {formatCurrency(totalCost)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Total for {state.batchCount} batch{state.batchCount !== 1 ? 'es' : ''}
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {formatCurrency(totalCost * state.batchCount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

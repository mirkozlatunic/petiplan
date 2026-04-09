import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import { formatCurrency } from '../../utils/formatters';

const inputClass =
  'w-full px-2 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100';

export default function CustomLineItem() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'g', costPerUnit: 0 });

  const handleAdd = () => {
    if (!newItem.name) return;
    dispatch({ type: 'ADD_CUSTOM_MATERIAL', payload: newItem });
    setNewItem({ name: '', quantity: 1, unit: 'g', costPerUnit: 0 });
    setAdding(false);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Custom Starting Materials
        </h4>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      {state.customMaterials.length > 0 && (
        <div className="space-y-1.5">
          {state.customMaterials.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 py-1.5 px-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
            >
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{m.name}</span>
              <input
                type="number"
                className="w-16 px-2 py-1 text-right text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100"
                value={m.quantity}
                min={0}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_CUSTOM_MATERIAL',
                    payload: { id: m.id, updates: { quantity: parseFloat(e.target.value) || 0 } },
                  })
                }
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 w-6">{m.unit}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">@</span>
              <input
                type="number"
                className="w-20 px-2 py-1 text-right text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100"
                value={m.costPerUnit}
                min={0}
                step={0.01}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_CUSTOM_MATERIAL',
                    payload: { id: m.id, updates: { costPerUnit: parseFloat(e.target.value) || 0 } },
                  })
                }
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-24 text-right">
                {formatCurrency(m.subtotal)}
              </span>
              <button
                onClick={() => dispatch({ type: 'REMOVE_CUSTOM_MATERIAL', payload: m.id })}
                className="p-1 text-gray-400 hover:text-danger transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="mt-2 p-3 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input
              type="text"
              className={inputClass}
              placeholder="Material name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              autoFocus
            />
            <input
              type="number"
              className={inputClass}
              placeholder="Qty"
              min={0}
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
            />
            <input
              type="text"
              className={inputClass}
              placeholder="Unit (g, mL, etc.)"
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
    </div>
  );
}

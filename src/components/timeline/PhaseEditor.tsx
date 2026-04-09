import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import type { Phase } from '../../types';

const inputClass =
  'w-20 px-2 py-1.5 text-sm text-right bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100';

export default function PhaseEditor() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {state.phases.map((phase) => (
        <div
          key={phase.phase}
          className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-700/30"
        >
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: phase.color }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              {phase.label}
            </p>
          </div>
          <input
            type="number"
            className={inputClass}
            min={0.5}
            step={0.5}
            value={phase.daysPerBatch}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_PHASE',
                payload: {
                  phase: phase.phase as Phase,
                  daysPerBatch: parseFloat(e.target.value) || 1,
                },
              })
            }
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">days</span>
        </div>
      ))}
    </div>
  );
}

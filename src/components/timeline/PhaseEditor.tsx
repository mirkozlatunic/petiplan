import { AlertTriangle } from 'lucide-react';
import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import type { Phase } from '../../types';

const inputClass =
  'w-16 px-2 py-1.5 text-sm text-right bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100';

export default function PhaseEditor() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();

  // Build a map of phase → linked machine hours for inconsistency detection
  const machineHoursByPhase = new Map<Phase, number>();
  for (const m of state.machines) {
    if (m.linkedPhase) {
      const existing = machineHoursByPhase.get(m.linkedPhase) ?? 0;
      machineHoursByPhase.set(m.linkedPhase, Math.max(existing, m.hoursPerBatch));
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {state.phases.map((phase) => {
          const machineHours = machineHoursByPhase.get(phase.phase as Phase);
          const minDaysNeeded = machineHours ? machineHours / 8 : null;
          const hasConflict = minDaysNeeded !== null && phase.daysPerBatch < minDaysNeeded;

          return (
            <div
              key={phase.phase}
              className={`p-3 rounded-lg ${hasConflict ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700' : 'bg-gray-50 dark:bg-slate-700/30'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: phase.color }} />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
                  {phase.label}
                </p>
                {hasConflict && (
                  <span title={`Linked machine needs ≥${minDaysNeeded!.toFixed(1)} days (8 h/day)`}>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <input
                  type="number"
                  aria-label={`${phase.label} duration in days`}
                  className={inputClass}
                  min={0.5}
                  step={0.5}
                  value={phase.daysPerBatch || ''}
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
                <span className="text-xs text-gray-500 dark:text-gray-400">days</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  aria-label={`${phase.label} yield percent`}
                  className={inputClass}
                  min={0}
                  max={100}
                  step={1}
                  value={phase.yieldPercent ?? ''}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_PHASE_YIELD',
                      payload: {
                        phase: phase.phase as Phase,
                        yieldPercent: parseFloat(e.target.value) || 100,
                      },
                    })
                  }
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">% yield</span>
              </div>

              {hasConflict && (
                <p className="mt-1.5 text-[10px] text-amber-700 dark:text-amber-400">
                  Linked machine needs ≥{minDaysNeeded!.toFixed(1)} days
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

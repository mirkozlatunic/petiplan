import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useProjectState } from '../../context/ProjectContext';
import { generateTimeline, estimatedCompletionDays } from '../../utils/capacityCalculator';
import { formatDuration, formatDate } from '../../utils/formatters';
import GanttChart from './GanttChart';
import PhaseEditor from './PhaseEditor';

export default function CapacityTimeline() {
  const state = useProjectState();

  const timeline = generateTimeline(
    state.phases,
    state.batchCount,
    state.startDate,
    state.targetEndDate,
  );

  const estDays = estimatedCompletionDays(state.phases, state.batchCount);
  const targetDays =
    state.startDate && state.targetEndDate
      ? Math.ceil(
          (new Date(state.targetEndDate).getTime() - new Date(state.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Phase Durations (days per batch)
        </h4>
        <PhaseEditor />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400">Estimated Duration:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatDuration(estDays)}
          </span>
        </div>
        {state.startDate && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Est. Completion:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatDate(
                new Date(
                  new Date(state.startDate).getTime() + estDays * 24 * 60 * 60 * 1000,
                ).toISOString(),
              )}
            </span>
          </div>
        )}
        {targetDays !== null && (
          <div className="flex items-center gap-2">
            {timeline.exceedsTarget ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Exceeds target by {formatDuration(estDays - targetDays)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                <CheckCircle className="w-3 h-3" />
                Within target ({formatDuration(targetDays - estDays)} buffer)
              </span>
            )}
          </div>
        )}
      </div>

      <GanttChart
        batches={timeline.batches}
        totalDays={timeline.totalDays}
        targetDays={targetDays}
      />

      <div className="flex flex-wrap gap-4">
        {state.phases.map((phase) => (
          <div key={phase.phase} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: phase.color }} />
            {phase.label}
          </div>
        ))}
        {targetDays !== null && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-3 h-0.5 bg-danger" style={{ borderTop: '2px dashed #EF4444' }} />
            Target Deadline
          </div>
        )}
      </div>
    </div>
  );
}

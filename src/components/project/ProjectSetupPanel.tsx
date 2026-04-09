import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import type { ScaleOption } from '../../types';

const SCALE_OPTIONS: { value: ScaleOption; label: string }[] = [
  { value: '1g', label: '1 g' },
  { value: '5g', label: '5 g' },
  { value: '10g', label: '10 g' },
  { value: '50g', label: '50 g' },
  { value: '100g', label: '100 g' },
  { value: '500g', label: '500 g' },
  { value: '1kg', label: '1 kg' },
  { value: 'custom', label: 'Custom' },
];

const inputClass =
  'w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors';

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

export default function ProjectSetupPanel() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Project Name</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g., GLP-1 Analog Batch"
            value={state.projectName}
            onChange={(e) => dispatch({ type: 'SET_PROJECT_NAME', payload: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Number of Batches</label>
            <input
              type="number"
              className={inputClass}
              min={1}
              value={state.batchCount}
              onChange={(e) =>
                dispatch({ type: 'SET_BATCH_COUNT', payload: parseInt(e.target.value) || 1 })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Scale per Batch</label>
            <select
              className={inputClass}
              value={state.scale}
              onChange={(e) =>
                dispatch({ type: 'SET_SCALE', payload: e.target.value as ScaleOption })
              }
            >
              {SCALE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {state.scale === 'custom' && (
        <div className="max-w-xs">
          <label className={labelClass}>Custom Scale (grams)</label>
          <input
            type="number"
            className={inputClass}
            min={0.1}
            step={0.1}
            value={state.customScaleGrams}
            onChange={(e) =>
              dispatch({ type: 'SET_CUSTOM_SCALE', payload: parseFloat(e.target.value) || 1 })
            }
          />
        </div>
      )}

      <div>
        <label className={labelClass}>Peptide Sequence</label>
        <textarea
          className={`${inputClass} font-mono tracking-wider resize-none`}
          rows={3}
          placeholder="Enter amino acid sequence, e.g., HAEGTFTSDVSSYLEGQAAKEFIAWLVKGR"
          value={state.sequence}
          onChange={(e) => dispatch({ type: 'SET_SEQUENCE', payload: e.target.value })}
        />
        {state.sequence && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {state.parsedAminoAcids.reduce((sum, aa) => sum + aa.count, 0)} residues detected &middot;{' '}
            {state.parsedAminoAcids.length} unique amino acids
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start Date</label>
          <input
            type="date"
            className={inputClass}
            value={state.startDate}
            onChange={(e) => dispatch({ type: 'SET_START_DATE', payload: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Target End Date</label>
          <input
            type="date"
            className={inputClass}
            value={state.targetEndDate}
            onChange={(e) => dispatch({ type: 'SET_TARGET_END_DATE', payload: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

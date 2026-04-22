import { useCallback, useEffect, useRef, useState } from 'react';
import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import type { ScaleOption, GmpStatus } from '../../types';
import { PTM_PRESETS } from '../../constants/ptmPresets';

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

const inputErrorClass =
  'w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-danger rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-danger focus:border-transparent transition-colors';

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

export default function ProjectSetupPanel() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();

  // Local state for debounced sequence input
  const [localSequence, setLocalSequence] = useState(state.sequence);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Sync local sequence if state changes externally (e.g. project load)
  useEffect(() => {
    setLocalSequence(state.sequence);
  }, [state.sequence]);

  const handleSequenceChange = useCallback(
    (value: string) => {
      setLocalSequence(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatch({ type: 'SET_SEQUENCE', payload: value });
      }, 300);
    },
    [dispatch],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const dateError =
    state.startDate && state.targetEndDate && state.startDate >= state.targetEndDate
      ? 'Target end date must be after start date.'
      : null;

  // PTM toggle
  const activePtmNames = new Set(state.ptmModifications.map((p) => p.name));
  const handlePtmToggle = (presetName: string) => {
    const existing = state.ptmModifications.find((p) => p.name === presetName);
    if (existing) {
      dispatch({ type: 'REMOVE_PTM', payload: existing.id });
    } else {
      const preset = PTM_PRESETS.find((p) => p.name === presetName);
      if (preset) {
        dispatch({ type: 'ADD_PTM', payload: preset });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="sm:col-span-2 md:col-span-1">
          <label className={labelClass}>Project Name</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g., GLP-1 Analog Batch"
            value={state.projectName}
            onChange={(e) => dispatch({ type: 'SET_PROJECT_NAME', payload: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2 md:col-span-1">
          <label className={labelClass}>Customer <span className="font-normal text-gray-400">(optional)</span></label>
          <input
            type="text"
            className={inputClass}
            placeholder="Customer or company name"
            value={state.customer ?? ''}
            onChange={(e) => dispatch({ type: 'SET_CUSTOMER', payload: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>GMP Classification</label>
          <div
            role="group"
            aria-label="GMP Classification"
            className="flex rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden h-9.5"
          >
            {([{ value: 'non-gmp', label: 'Non-GMP' }, { value: 'gmp', label: 'GMP' }] as { value: GmpStatus; label: string }[]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={state.gmpStatus === opt.value}
                onClick={() => dispatch({ type: 'SET_GMP_STATUS', payload: opt.value })}
                className={`flex-1 px-3 text-sm font-medium transition-colors ${
                  state.gmpStatus === opt.value
                    ? 'bg-accent-500 text-white'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {state.gmpStatus === 'gmp' && (
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              GMP adds 15% labor overhead for QA/documentation.
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Number of Batches</label>
          <input
            type="number"
            className={inputClass}
            min={1}
            step={1}
            value={state.batchCount || ''}
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

      {state.scale === 'custom' && (
        <div className="max-w-xs">
          <label className={labelClass}>Custom Scale (grams)</label>
          <input
            type="number"
            className={inputClass}
            min={0.1}
            step={0.1}
            value={state.customScaleGrams || ''}
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
          placeholder="Enter amino acid sequence, e.g., HAEGTFTSDVSSYLEGQAAKEFIAWLVKGR — or paste FASTA format"
          value={localSequence}
          onChange={(e) => handleSequenceChange(e.target.value)}
        />
        {localSequence && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {state.parsedAminoAcids.reduce((sum, aa) => sum + aa.count, 0)} residues detected &middot;{' '}
            {state.parsedAminoAcids.length} unique amino acids
          </p>
        )}
        {!localSequence && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Single-letter codes (e.g. ACDEFGH…) or FASTA format accepted. Lowercase, spaces and numbers are stripped automatically.
          </p>
        )}
      </div>

      {/* Post-Translational Modifications */}
      <div>
        <label className={labelClass}>Post-Translational Modifications</label>
        <div className="flex flex-wrap gap-2">
          {PTM_PRESETS.map((ptm) => {
            const active = activePtmNames.has(ptm.name);
            return (
              <button
                key={ptm.name}
                type="button"
                aria-pressed={active}
                onClick={() => handlePtmToggle(ptm.name)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  active
                    ? 'bg-accent-500 text-white border-accent-500'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:border-accent-400'
                }`}
                title={`+$${ptm.costDelta}/batch, +${ptm.timeDeltaHours}h synthesis`}
              >
                {ptm.name}
                {active && <span className="opacity-75">✓</span>}
              </button>
            );
          })}
        </div>
        {state.ptmModifications.length > 0 && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            PTM overhead: +${state.ptmModifications.reduce((s, p) => s + p.costDelta, 0).toLocaleString()}/batch &middot;{' '}
            +{state.ptmModifications.reduce((s, p) => s + p.timeDeltaHours, 0)}h synthesis time
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
            className={dateError ? inputErrorClass : inputClass}
            value={state.targetEndDate}
            aria-describedby={dateError ? 'date-error' : undefined}
            onChange={(e) => dispatch({ type: 'SET_TARGET_END_DATE', payload: e.target.value })}
          />
          {dateError && (
            <p id="date-error" role="alert" className="mt-1 text-xs text-danger">
              {dateError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

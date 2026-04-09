import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import { scaleToGrams } from '../../utils/costCalculator';
import { formatCurrency } from '../../utils/formatters';

export default function CouplingResinSummary() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();

  const totalAaCost = state.parsedAminoAcids.reduce((sum, aa) => sum + aa.subtotal, 0);
  const couplingCost = totalAaCost * 0.3;
  const grams = scaleToGrams(state.scale, state.customScaleGrams);
  const resinCost = state.resinCostPerGram * grams;

  if (state.parsedAminoAcids.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Coupling Reagents
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(30% of AA cost)</span>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {formatCurrency(couplingCost)}
        </span>
      </div>

      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resin</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              (${state.resinCostPerGram}/g &times; {grams}g)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            className="w-20 px-2 py-1 text-right text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100"
            min={0}
            step={1}
            value={state.resinCostPerGram}
            onChange={(e) =>
              dispatch({ type: 'SET_RESIN_COST', payload: parseFloat(e.target.value) || 0 })
            }
          />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-24 text-right">
            {formatCurrency(resinCost)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between py-2 px-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Coupling Excess Factor
          </span>
        </div>
        <input
          type="number"
          className="w-16 px-2 py-1 text-right text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100"
          min={1}
          step={0.5}
          value={state.couplingExcessFactor}
          onChange={(e) =>
            dispatch({
              type: 'SET_COUPLING_EXCESS_FACTOR',
              payload: parseFloat(e.target.value) || 3,
            })
          }
        />
      </div>
    </div>
  );
}

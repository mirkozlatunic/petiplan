import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import { scaleToGrams, calculateMargin } from '../../utils/costCalculator';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface MarginCalculatorProps {
  totalCost: number;
}

export default function MarginCalculator({ totalCost }: MarginCalculatorProps) {
  const state = useProjectState();
  const dispatch = useProjectDispatch();
  const grams = scaleToGrams(state.scale, state.customScaleGrams);
  const margin = calculateMargin(totalCost, state.sellingPricePerGram, grams, state.batchCount);

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Margin Calculator
      </h4>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Sell Price ($/g)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            min={0}
            step={1}
            value={state.sellingPricePerGram || ''}
            placeholder="0.00"
            onChange={(e) =>
              dispatch({ type: 'SET_SELLING_PRICE', payload: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        {state.sellingPricePerGram > 0 && (
          <>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(margin.revenue)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Gross Profit</p>
              <p
                className={`text-sm font-semibold ${
                  margin.grossProfit >= 0 ? 'text-success' : 'text-danger'
                }`}
              >
                {formatCurrency(margin.grossProfit)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Margin</p>
              <p
                className={`text-sm font-bold ${
                  margin.marginPercent >= 0 ? 'text-success' : 'text-danger'
                }`}
              >
                {formatPercent(margin.marginPercent)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { DollarSign, Package, Scale } from 'lucide-react';
import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import { useProjectCosts } from '../../hooks/useProjectCosts';
import { formatCurrency } from '../../utils/formatters';
import KpiCard from './KpiCard';
import CostPieChart from './CostPieChart';
import MarginCalculator from './MarginCalculator';
import ComparisonPanel from './ComparisonPanel';

export default function CostSummaryDashboard() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();
  const { machineCost, laborCost, totalMaterials, totals } = useProjectCosts();

  const handleSaveSnapshot = () => {
    dispatch({
      type: 'SAVE_SNAPSHOT',
      payload: {
        timestamp: Date.now(),
        totalCost: totals.totalCost,
        materialsCost: totalMaterials,
        machineCost: machineCost.totalMachineCost,
        laborCost: laborCost.totalLaborCost,
        costPerBatch: totals.costPerBatch,
        costPerGram: totals.costPerGram,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard
          label="Total Project Cost"
          value={formatCurrency(totals.totalCost)}
          icon={<DollarSign className="w-4 h-4" />}
          subtitle={`${state.batchCount} batch${state.batchCount !== 1 ? 'es' : ''} at ${state.scale}`}
          highlight
        />
        <KpiCard
          label="Cost per Batch"
          value={formatCurrency(totals.costPerBatch)}
          icon={<Package className="w-4 h-4" />}
        />
        <KpiCard
          label="Cost per Gram (delivered)"
          value={formatCurrency(totals.costPerGram)}
          icon={<Scale className="w-4 h-4" />}
          subtitle={`${(totals.deliverableGrams * state.batchCount).toFixed(1)}g deliverable · ${Math.round(totals.cumulativeYield * 100)}% yield`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CostPieChart
          materialsCost={totalMaterials}
          machineCost={machineCost.totalMachineCost}
          laborCost={laborCost.totalLaborCost}
        />
        <div className="space-y-4">
          <MarginCalculator totalCost={totals.totalCost} deliverableGrams={totals.deliverableGrams} />
          <ComparisonPanel
            currentCost={totals.totalCost}
            currentMaterials={totalMaterials}
            currentMachine={machineCost.totalMachineCost}
            currentLabor={laborCost.totalLaborCost}
            costPerBatch={totals.costPerBatch}
            costPerGram={totals.costPerGram}
            previousSnapshot={state.previousSnapshot}
            onSaveSnapshot={handleSaveSnapshot}
          />
        </div>
      </div>

      {state.gmpStatus === 'gmp' && laborCost.gmpOverheadCost > 0 && (
        <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300">
          GMP mode: labor costs include a 15% overhead (+{formatCurrency(laborCost.gmpOverheadCost)}) for documentation and quality assurance.
        </div>
      )}

      {totals.cumulativeYield < 1 && (
        <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-xs text-amber-800 dark:text-amber-300">
          Cumulative yield: {(totals.cumulativeYield * 100).toFixed(1)}% — cost/gram is calculated on {(totals.deliverableGrams * state.batchCount).toFixed(1)}g deliverable product (not input grams).
          Adjust phase yields in the Capacity Timeline section.
        </div>
      )}
    </div>
  );
}

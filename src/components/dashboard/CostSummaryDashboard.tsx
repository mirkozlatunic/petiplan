import { DollarSign, Package, Scale } from 'lucide-react';
import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import {
  scaleToGrams,
  calculateMaterialsCost,
  calculateMachineCost,
  calculateLaborCost,
  calculateTotalCost,
} from '../../utils/costCalculator';
import { formatCurrency } from '../../utils/formatters';
import KpiCard from './KpiCard';
import CostPieChart from './CostPieChart';
import MarginCalculator from './MarginCalculator';
import ComparisonPanel from './ComparisonPanel';

export default function CostSummaryDashboard() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();

  const grams = scaleToGrams(state.scale, state.customScaleGrams);
  const materialsCost = calculateMaterialsCost(
    state.parsedAminoAcids,
    state.resinCostPerGram,
    grams,
    state.customMaterials,
    state.otherMaterials,
  );
  const machineCost = calculateMachineCost(state.machines, state.batchCount);
  const laborCost = calculateLaborCost(state.laborRoles, state.batchCount);

  const totalMaterials = materialsCost.totalMaterialsCost * state.batchCount;
  const totals = calculateTotalCost(
    totalMaterials,
    machineCost.totalMachineCost,
    laborCost.totalLaborCost,
    state.batchCount,
    grams,
  );

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
          label="Cost per Gram"
          value={formatCurrency(totals.costPerGram)}
          icon={<Scale className="w-4 h-4" />}
          subtitle={`${grams * state.batchCount}g total output`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CostPieChart
          materialsCost={totalMaterials}
          machineCost={machineCost.totalMachineCost}
          laborCost={laborCost.totalLaborCost}
        />
        <div className="space-y-4">
          <MarginCalculator totalCost={totals.totalCost} />
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
    </div>
  );
}

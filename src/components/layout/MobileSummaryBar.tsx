import { useProjectState } from '../../context/ProjectContext';
import {
  scaleToGrams,
  calculateMaterialsCost,
  calculateMachineCost,
  calculateLaborCost,
  calculateTotalCost,
} from '../../utils/costCalculator';
import { formatCurrencyCompact } from '../../utils/formatters';

export default function MobileSummaryBar() {
  const state = useProjectState();
  const grams = scaleToGrams(state.scale, state.customScaleGrams);
  const materials = calculateMaterialsCost(
    state.parsedAminoAcids,
    state.resinCostPerGram,
    grams,
    state.customMaterials,
    state.otherMaterials,
  );
  const totalMaterials = materials.totalMaterialsCost * state.batchCount;
  const machines = calculateMachineCost(state.machines, state.batchCount);
  const labor = calculateLaborCost(state.laborRoles, state.batchCount);
  const totals = calculateTotalCost(
    totalMaterials,
    machines.totalMachineCost,
    labor.totalLaborCost,
    state.batchCount,
    grams,
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-primary-500 text-white border-t border-primary-400 shadow-lg">
      <div className="flex items-center justify-around py-2.5 px-4">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-primary-200">Total</p>
          <p className="text-sm font-bold">{formatCurrencyCompact(totals.totalCost)}</p>
        </div>
        <div className="w-px h-8 bg-primary-400" />
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-primary-200">Per Batch</p>
          <p className="text-sm font-bold">{formatCurrencyCompact(totals.costPerBatch)}</p>
        </div>
        <div className="w-px h-8 bg-primary-400" />
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-primary-200">Per Gram</p>
          <p className="text-sm font-bold">{formatCurrencyCompact(totals.costPerGram)}</p>
        </div>
      </div>
    </div>
  );
}

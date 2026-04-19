import { useMemo } from 'react';
import { useProjectState } from '../context/ProjectContext';
import {
  scaleToGrams,
  calculateCumulativeYield,
  calculateMaterialsCost,
  calculateMachineCost,
  calculateLaborCost,
  calculateTotalCost,
} from '../utils/costCalculator';

/**
 * Shared hook that computes all project costs in one place with full memoization.
 * Use this in any component that needs cost data — avoids duplicated calculations
 * and prevents unnecessary re-renders when unrelated state changes.
 */
export function useProjectCosts() {
  const state = useProjectState();

  const grams = useMemo(
    () => scaleToGrams(state.scale, state.customScaleGrams),
    [state.scale, state.customScaleGrams],
  );

  const cumulativeYield = useMemo(
    () => calculateCumulativeYield(state.phases),
    [state.phases],
  );

  const ptmCostPerBatch = useMemo(
    () => state.ptmModifications.reduce((sum, ptm) => sum + ptm.costDelta, 0),
    [state.ptmModifications],
  );

  const materialsCost = useMemo(
    () =>
      calculateMaterialsCost(
        state.parsedAminoAcids,
        state.resinCostPerGram,
        grams,
        state.customMaterials,
        state.otherMaterials,
        ptmCostPerBatch,
      ),
    [state.parsedAminoAcids, state.resinCostPerGram, grams, state.customMaterials, state.otherMaterials, ptmCostPerBatch],
  );

  const machineCost = useMemo(
    () => calculateMachineCost(state.machines, state.batchCount),
    [state.machines, state.batchCount],
  );

  const laborCost = useMemo(
    () => calculateLaborCost(state.laborRoles, state.batchCount, state.gmpStatus),
    [state.laborRoles, state.batchCount, state.gmpStatus],
  );

  const totalMaterials = useMemo(
    () => materialsCost.totalMaterialsCost * state.batchCount,
    [materialsCost.totalMaterialsCost, state.batchCount],
  );

  const totals = useMemo(
    () =>
      calculateTotalCost(
        totalMaterials,
        machineCost.totalMachineCost,
        laborCost.totalLaborCost,
        state.batchCount,
        grams,
        cumulativeYield,
      ),
    [totalMaterials, machineCost.totalMachineCost, laborCost.totalLaborCost, state.batchCount, grams, cumulativeYield],
  );

  return {
    grams,
    cumulativeYield,
    ptmCostPerBatch,
    materialsCost,
    machineCost,
    laborCost,
    totalMaterials,
    totals,
  };
}

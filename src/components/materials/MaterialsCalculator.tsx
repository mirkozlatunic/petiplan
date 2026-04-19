import { useProjectState } from '../../context/ProjectContext';
import { useProjectCosts } from '../../hooks/useProjectCosts';
import { formatCurrency } from '../../utils/formatters';
import AminoAcidTable from './AminoAcidTable';
import CouplingResinSummary from './CouplingResinSummary';
import CustomLineItem from './CustomLineItem';

export default function MaterialsCalculator() {
  const state = useProjectState();
  const { materialsCost } = useProjectCosts();

  return (
    <div className="space-y-4">
      <AminoAcidTable />
      <CouplingResinSummary />
      <CustomLineItem />

      {state.parsedAminoAcids.length > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Total Materials Cost per Batch
            </span>
            <span className="text-lg font-bold text-primary-500">
              {formatCurrency(materialsCost.totalMaterialsCost)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total for {state.batchCount} batch{state.batchCount !== 1 ? 'es' : ''}
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {formatCurrency(materialsCost.totalMaterialsCost * state.batchCount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

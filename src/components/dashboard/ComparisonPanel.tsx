import { Camera } from 'lucide-react';
import type { CostSnapshot } from '../../types';
import Delta from '../ui/Delta';

interface ComparisonPanelProps {
  currentCost: number;
  currentMaterials: number;
  currentMachine: number;
  currentLabor: number;
  costPerBatch: number;
  costPerGram: number;
  previousSnapshot: CostSnapshot | null;
  onSaveSnapshot: () => void;
}

export default function ComparisonPanel({
  currentCost,
  currentMaterials,
  currentMachine,
  currentLabor,
  costPerBatch,
  costPerGram,
  previousSnapshot,
  onSaveSnapshot,
}: ComparisonPanelProps) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Comparison
        </h4>
        <button
          onClick={onSaveSnapshot}
          aria-label="Save cost snapshot for comparison"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
          Save Snapshot
        </button>
      </div>

      {previousSnapshot ? (
        <div className="space-y-1.5">
          <Delta current={currentCost}    previous={previousSnapshot.totalCost}    label="Total Cost" />
          <Delta current={currentMaterials} previous={previousSnapshot.materialsCost} label="Materials" />
          <Delta current={currentMachine}  previous={previousSnapshot.machineCost}  label="Equipment" />
          <Delta current={currentLabor}    previous={previousSnapshot.laborCost}    label="Labor" />
          <Delta current={costPerBatch}    previous={previousSnapshot.costPerBatch}  label="Cost / Batch" />
          <Delta current={costPerGram}     previous={previousSnapshot.costPerGram}   label="Cost / Gram" />
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
          Save a snapshot to compare against future changes.
        </p>
      )}
    </div>
  );
}

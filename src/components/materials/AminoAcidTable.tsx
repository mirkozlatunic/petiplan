import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const tierColors: Record<string, string> = {
  common: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  moderate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  expensive: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function AminoAcidTable() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();
  const { parsedAminoAcids } = state;

  if (parsedAminoAcids.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        Enter a peptide sequence above to see the amino acid breakdown.
      </p>
    );
  }

  const totalAaCost = parsedAminoAcids.reduce((sum, aa) => sum + aa.subtotal, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-slate-700">
            <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-gray-400">AA</th>
            <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Name</th>
            <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Tier</th>
            <th className="text-right py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Count</th>
            <th className="text-right py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Grams</th>
            <th className="text-right py-2 px-2 font-medium text-gray-500 dark:text-gray-400 min-w-[90px]">$/g</th>
            <th className="text-right py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {parsedAminoAcids.map((aa) => (
            <tr
              key={aa.code}
              className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <td className="py-2 px-2 font-mono font-bold text-primary-500">{aa.code}</td>
              <td className="py-2 px-2 text-gray-700 dark:text-gray-300">{aa.name}</td>
              <td className="py-2 px-2 text-center">
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${tierColors[aa.tier]}`}
                >
                  {aa.tier}
                </span>
              </td>
              <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">{aa.count}</td>
              <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                {formatNumber(aa.gramsNeeded, 1)}
              </td>
              <td className="py-2 px-2 text-right">
                <input
                  type="number"
                  className="w-20 px-2 py-1 text-right text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 text-gray-900 dark:text-gray-100"
                  min={0}
                  step={0.1}
                  value={aa.costPerGram || ''}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_AA_COST',
                      payload: { code: aa.code, costPerGram: Math.max(0, parseFloat(e.target.value) || 0) },
                    })
                  }
                />
              </td>
              <td className="py-2 px-2 text-right font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(aa.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-300 dark:border-slate-600">
            <td colSpan={6} className="py-2 px-2 text-right font-semibold text-gray-700 dark:text-gray-300">
              Total Amino Acid Cost
            </td>
            <td className="py-2 px-2 text-right font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(totalAaCost)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

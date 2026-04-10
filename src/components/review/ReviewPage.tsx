import { ArrowLeft, Pencil, DollarSign, Package, Scale, Download, Copy, Save, FolderOpen, Trash2, Check, Camera, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import {
  scaleToGrams,
  calculateMaterialsCost,
  calculateMachineCost,
  calculateLaborCost,
  calculateTotalCost,
  calculateMargin,
} from '../../utils/costCalculator';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { copySummaryToClipboard } from '../../utils/clipboard';
import { saveProject, listSavedProjects, loadProject, deleteProject } from '../../utils/storage';
import { usePdfExport } from '../../hooks/usePdfExport';
import CostPieChart from '../dashboard/CostPieChart';
import Header from '../layout/Header';
import Card from '../ui/Card';
import type { SectionKey } from '../../App';
import type { SavedProject } from '../../types';

interface ReviewPageProps {
  onBack: () => void;
  onEditSection: (section: SectionKey) => void;
}

function SectionHeader({ title, sectionKey, onEdit }: { title: string; sectionKey: SectionKey; onEdit: (s: SectionKey) => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{title}</h3>
      <button
        onClick={() => onEdit(sectionKey)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
      >
        <Pencil className="w-3 h-3" />
        Edit
      </button>
    </div>
  );
}

function LineItem({ label, value, indent = false }: { label: string; value: string; indent?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${indent ? 'pl-4' : ''}`}>
      <span className={`text-sm ${indent ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{label}</span>
      <span className={`text-sm font-medium ${indent ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>{value}</span>
    </div>
  );
}

function Delta({ current, previous, label }: { current: number; previous: number; label: string }) {
  const diff = current - previous;
  const pct = previous > 0 ? (diff / previous) * 100 : 0;
  const isUp = diff > 0;

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`flex items-center gap-1 font-medium ${isUp ? 'text-danger' : 'text-success'}`}>
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isUp ? '+' : ''}{formatCurrency(diff)} ({isUp ? '+' : ''}{formatPercent(pct)})
      </span>
    </div>
  );
}

export default function ReviewPage({ onBack, onEditSection }: ReviewPageProps) {
  const state = useProjectState();
  const dispatch = useProjectDispatch();
  const { contentRef, exportPdf } = usePdfExport();

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [projects, setProjects] = useState<SavedProject[]>([]);

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
  const margin = calculateMargin(totals.totalCost, state.sellingPricePerGram, grams, state.batchCount);

  const handleCopy = async () => {
    await copySummaryToClipboard(state);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveProject(state);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleOpenLoad = () => {
    setProjects(listSavedProjects());
    setShowLoadDialog(true);
  };

  const handleLoad = (name: string) => {
    const loaded = loadProject(name);
    if (loaded) dispatch({ type: 'LOAD_PROJECT', payload: loaded });
    setShowLoadDialog(false);
  };

  const handleDelete = (name: string) => {
    deleteProject(name);
    setProjects(listSavedProjects());
  };

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

  const btnClass =
    'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors';

  return (
    <>
      <Header />

      <main ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Back button + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Cost Review</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {state.projectName} &mdash; {state.batchCount} batch{state.batchCount !== 1 ? 'es' : ''} at {state.scale === 'custom' ? `${state.customScaleGrams}g` : state.scale} &middot; {state.gmpStatus === 'gmp' ? 'GMP' : 'Non-GMP'}
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-lg border border-accent-300 dark:border-accent-700 bg-accent-50 dark:bg-accent-900/20">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Project Cost</span>
            </div>
            <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">{formatCurrency(totals.totalCost)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{state.batchCount} batch{state.batchCount !== 1 ? 'es' : ''} at {state.scale}</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cost per Batch</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totals.costPerBatch)}</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cost per Gram</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totals.costPerGram)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{grams * state.batchCount}g total output</p>
          </div>
        </div>

        {/* Pie chart + margin/comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cost Distribution</h3>
              <CostPieChart
                materialsCost={totalMaterials}
                machineCost={machineCost.totalMachineCost}
                laborCost={laborCost.totalLaborCost}
              />
            </div>
          </Card>
          <div className="space-y-4">
            {/* Margin Calculator */}
            <Card>
              <div className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Margin Calculator</h3>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sell Price ($/g)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      min={0}
                      step={1}
                      value={state.sellingPricePerGram || ''}
                      placeholder="0.00"
                      onChange={(e) => dispatch({ type: 'SET_SELLING_PRICE', payload: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  {state.sellingPricePerGram > 0 && (
                    <>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(margin.revenue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gross Profit</p>
                        <p className={`text-sm font-semibold ${margin.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(margin.grossProfit)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Margin</p>
                        <p className={`text-sm font-bold ${margin.marginPercent >= 0 ? 'text-success' : 'text-danger'}`}>{formatPercent(margin.marginPercent)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
            {/* Comparison Panel */}
            <Card>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Comparison</h3>
                  <button
                    onClick={handleSaveSnapshot}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Save Snapshot
                  </button>
                </div>
                {state.previousSnapshot ? (
                  <div className="space-y-1.5">
                    <Delta current={totals.totalCost} previous={state.previousSnapshot.totalCost} label="Total Cost" />
                    <Delta current={totalMaterials} previous={state.previousSnapshot.materialsCost} label="Materials" />
                    <Delta current={machineCost.totalMachineCost} previous={state.previousSnapshot.machineCost} label="Equipment" />
                    <Delta current={laborCost.totalLaborCost} previous={state.previousSnapshot.laborCost} label="Labor" />
                    <Delta current={totals.costPerBatch} previous={state.previousSnapshot.costPerBatch} label="Cost / Batch" />
                    <Delta current={totals.costPerGram} previous={state.previousSnapshot.costPerGram} label="Cost / Gram" />
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">Save a snapshot to compare against future changes.</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <Card>
          <div className="px-5 py-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Detailed Cost Breakdown</h3>
          </div>
          <div className="px-5 pb-5 space-y-1">
            {/* Project Info */}
            <div className="py-3">
              <SectionHeader title="Project Setup" sectionKey="projectSetup" onEdit={onEditSection} />
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                <LineItem label="Project Name" value={state.projectName} />
                <LineItem label="GMP Classification" value={state.gmpStatus === 'gmp' ? 'GMP' : 'Non-GMP'} />
                <LineItem label="Sequence" value={`${state.sequence.substring(0, 30)}${state.sequence.length > 30 ? '...' : ''} (${state.parsedAminoAcids.reduce((s, a) => s + a.count, 0)} residues)`} />
                <LineItem label="Batches" value={`${state.batchCount}`} />
                <LineItem label="Scale" value={state.scale === 'custom' ? `${state.customScaleGrams}g` : state.scale} />
                <LineItem label="Start Date" value={formatDate(state.startDate)} />
                <LineItem label="Target End Date" value={formatDate(state.targetEndDate)} />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700" />

            {/* Amino Acid Materials */}
            <div className="py-3">
              <SectionHeader title="Amino Acid & Starting Materials" sectionKey="materials" onEdit={onEditSection} />
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {state.parsedAminoAcids.map((aa) => (
                  <LineItem key={aa.code} label={`${aa.name} (${aa.code}) — ${aa.count} residues, ${aa.gramsNeeded.toFixed(2)}g`} value={formatCurrency(aa.subtotal)} indent />
                ))}
                <LineItem label="Amino Acids Subtotal" value={formatCurrency(materialsCost.aaCost)} />
                <LineItem label="Coupling Reagents (30%)" value={formatCurrency(materialsCost.couplingCost)} indent />
                <LineItem label={`Resin @ ${formatCurrency(state.resinCostPerGram)}/g`} value={formatCurrency(materialsCost.resinCost)} indent />
                {state.customMaterials.map((m) => (
                  <LineItem key={m.id} label={`${m.name} — ${m.quantity} ${m.unit}`} value={formatCurrency(m.subtotal)} indent />
                ))}
                <div className="flex items-center justify-between py-2 font-semibold">
                  <span className="text-sm text-gray-900 dark:text-gray-100">Materials Total (per batch)</span>
                  <span className="text-sm text-primary-500">{formatCurrency(materialsCost.aaCost + materialsCost.couplingCost + materialsCost.resinCost + materialsCost.customCost)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700" />

            {/* Other Materials */}
            <div className="py-3">
              <SectionHeader title="Other Materials & Consumables" sectionKey="otherMaterials" onEdit={onEditSection} />
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {state.otherMaterials.map((m) => (
                  <LineItem key={m.id} label={`${m.name} — ${m.quantity} ${m.unit} @ ${formatCurrency(m.costPerUnit)}/${m.unit}`} value={formatCurrency(m.subtotal)} indent />
                ))}
                <div className="flex items-center justify-between py-2 font-semibold">
                  <span className="text-sm text-gray-900 dark:text-gray-100">Other Materials Total (per batch)</span>
                  <span className="text-sm text-primary-500">{formatCurrency(materialsCost.otherMaterialsCost)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700" />

            {/* Machines */}
            <div className="py-3">
              <SectionHeader title="Machine / Equipment" sectionKey="machines" onEdit={onEditSection} />
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {state.machines.map((m) => (
                  <LineItem key={m.id} label={`${m.name} — ${m.hoursPerBatch}h/batch @ ${formatCurrency(m.hourlyCost)}/h × ${m.unitsAvailable} unit${m.unitsAvailable !== 1 ? 's' : ''}`} value={formatCurrency(m.costPerBatch)} indent />
                ))}
                <div className="flex items-center justify-between py-2 font-semibold">
                  <span className="text-sm text-gray-900 dark:text-gray-100">Equipment Total ({state.batchCount} batches)</span>
                  <span className="text-sm text-primary-500">{formatCurrency(machineCost.totalMachineCost)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700" />

            {/* Labor */}
            <div className="py-3">
              <SectionHeader title="Labor" sectionKey="labor" onEdit={onEditSection} />
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {state.laborRoles.map((r) => (
                  <LineItem key={r.id} label={`${r.name} — ${r.hoursPerBatch}h/batch × ${r.headcount} @ ${formatCurrency(r.hourlyRate)}/h (${r.fte.toFixed(2)} FTE)`} value={formatCurrency(r.costPerBatch)} indent />
                ))}
                <div className="flex items-center justify-between py-2 font-semibold">
                  <span className="text-sm text-gray-900 dark:text-gray-100">Labor Total ({state.batchCount} batches)</span>
                  <span className="text-sm text-primary-500">{formatCurrency(laborCost.totalLaborCost)}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 dark:border-slate-600" />

            {/* Grand Total */}
            <div className="flex items-center justify-between py-3">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Grand Total</span>
              <span className="text-lg font-bold text-accent-600 dark:text-accent-400">{formatCurrency(totals.totalCost)}</span>
            </div>
          </div>
        </Card>

        {/* Export & Share */}
        <Card data-pdf-hide>
          <div className="px-5 py-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Export & Share</h3>
          </div>
          <div className="px-5 pb-5 space-y-4">
            <div className="flex flex-wrap gap-3">
              <button onClick={() => exportPdf(state.projectName, state.scale === 'custom' ? `${state.customScaleGrams}g` : state.scale, state.gmpStatus)} className={`${btnClass} text-white bg-accent-500 hover:bg-accent-600`}>
                <Download className="w-4 h-4" />
                Export as PDF
              </button>
              <button onClick={handleCopy} className={`${btnClass} text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600`}>
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Summary'}
              </button>
              <button onClick={handleSave} className={`${btnClass} text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600`}>
                {saved ? <Check className="w-4 h-4 text-success" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Project'}
              </button>
              <button onClick={handleOpenLoad} className={`${btnClass} text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600`}>
                <FolderOpen className="w-4 h-4" />
                Load Project
              </button>
            </div>

            {showLoadDialog && (
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Saved Projects</h4>
                  <button onClick={() => setShowLoadDialog(false)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Close</button>
                </div>
                {projects.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-gray-400 dark:text-gray-500 italic text-center">No saved projects found.</p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {projects.map((p) => (
                      <div key={p.name} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Saved {formatDate(p.savedAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleLoad(p.name)} className="px-3 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 rounded hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors">Load</button>
                          <button onClick={() => handleDelete(p.name)} className="p-1 text-gray-400 hover:text-danger transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </main>
    </>
  );
}

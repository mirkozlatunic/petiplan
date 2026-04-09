import { useState } from 'react';
import { Download, Copy, Save, FolderOpen, Trash2, Check } from 'lucide-react';
import { useProjectState, useProjectDispatch } from '../../context/ProjectContext';
import { saveProject, listSavedProjects, loadProject, deleteProject } from '../../utils/storage';
import { copySummaryToClipboard } from '../../utils/clipboard';
import { formatDate } from '../../utils/formatters';
import type { SavedProject } from '../../types';

interface ExportPanelProps {
  onExportPdf: () => void;
}

export default function ExportPanel({ onExportPdf }: ExportPanelProps) {
  const state = useProjectState();
  const dispatch = useProjectDispatch();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [projects, setProjects] = useState<SavedProject[]>([]);

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
    if (loaded) {
      dispatch({ type: 'LOAD_PROJECT', payload: loaded });
    }
    setShowLoadDialog(false);
  };

  const handleDelete = (name: string) => {
    deleteProject(name);
    setProjects(listSavedProjects());
  };

  const btnClass =
    'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button onClick={onExportPdf} className={`${btnClass} text-white bg-accent-500 hover:bg-accent-600`}>
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
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Saved Projects
            </h4>
            <button
              onClick={() => setShowLoadDialog(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Close
            </button>
          </div>
          {projects.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 dark:text-gray-500 italic text-center">
              No saved projects found.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {projects.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/30"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Saved {formatDate(p.savedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoad(p.name)}
                      className="px-3 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 rounded hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(p.name)}
                      className="p-1 text-gray-400 hover:text-danger transition-colors"
                    >
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
  );
}

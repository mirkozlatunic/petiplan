import { useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import type { SavedProject } from '@/types';
import type { UseProjectsReturn } from '@/hooks/useProjects';

interface MigrateLocalModalProps {
  localProjects: SavedProject[];
  migrateLocalProjects: UseProjectsReturn['migrateLocalProjects'];
  onComplete: (imported: number) => void;
  onDismiss: () => void;
}

export default function MigrateLocalModal({ localProjects, migrateLocalProjects, onComplete, onDismiss }: MigrateLocalModalProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(localProjects.map((p) => p.name)));
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; failed: string[] } | null>(null);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  async function handleImport() {
    const toImport = localProjects.filter((p) => selected.has(p.name));
    setImporting(true);
    try {
      const res = await migrateLocalProjects(toImport);
      setResult(res);
      if (res.failed.length === 0) {
        localStorage.setItem('peptiplan-migration-offered', 'true');
        onComplete(res.imported);
      }
    } finally {
      setImporting(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem('peptiplan-migration-offered', 'true');
    onDismiss();
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleDismiss} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Import local projects</h2>
          </div>
          <button onClick={handleDismiss} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4">
          {result ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="w-5 h-5" />
                <p className="font-medium">{result.imported} project{result.imported !== 1 ? 's' : ''} imported</p>
              </div>
              {result.failed.length > 0 && (
                <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>Failed: {result.failed.join(', ')}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                We found {localProjects.length} project{localProjects.length !== 1 ? 's' : ''} saved locally. Select which ones to import to your cloud account.
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {localProjects.map((p) => (
                  <label
                    key={p.name}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(p.name)}
                      onChange={() => toggle(p.name)}
                      className="w-4 h-4 rounded accent-primary-500"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">Saved {formatDate(p.savedAt)}</p>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-2">
          {result ? (
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleImport}
                disabled={importing || selected.size === 0}
                className="flex-1 py-2.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                {importing ? 'Importing…' : `Import ${selected.size} project${selected.size !== 1 ? 's' : ''}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

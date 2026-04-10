import { FlaskConical } from 'lucide-react';
import { ToggleTheme } from '@/components/ui/toggle-theme';

interface HeaderProps {
  onSave?: () => void;
  onLoad?: () => void;
  onExportPdf?: () => void;
}

export default function Header({ onSave, onLoad, onExportPdf }: HeaderProps = {}) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              PeptiPlan
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5 hidden sm:block">
              Peptide Manufacturing Planner
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={onSave}
              className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              Save
            </button>
          )}
          {onLoad && (
            <button
              onClick={onLoad}
              className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              Load
            </button>
          )}
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-accent-500 rounded-lg hover:bg-accent-600 transition-colors"
            >
              Export PDF
            </button>
          )}
          <ToggleTheme />
        </div>
      </div>
    </header>
  );
}

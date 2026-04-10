import { useState, type ReactNode } from 'react';
import { ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';

export type SectionStatus = 'incomplete' | 'complete' | 'none';

interface SectionWrapperProps {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  badge?: ReactNode;
  status?: SectionStatus;
}

export default function SectionWrapper({
  title,
  icon,
  defaultOpen = true,
  children,
  badge,
  status = 'none',
}: SectionWrapperProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-accent-500">{icon}</span>}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          {badge}
        </div>
        <div className="flex items-center gap-2">
          {status === 'incomplete' && (
            <AlertCircle className="w-5 h-5 text-warning" />
          )}
          {status === 'complete' && (
            <CheckCircle2 className="w-5 h-5 text-success" />
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>
      <div
        className={`transition-all duration-200 ${
          open ? 'max-h-[5000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-5 pb-5">{children}</div>
      </div>
    </Card>
  );
}

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FlaskConical, LogOut, Settings, ChevronLeft, ChevronDown, Building2, Check } from 'lucide-react';
import { ToggleTheme } from '@/components/ui/toggle-theme';
import { useAuthState, useAuthActions } from '@/context/AuthContext';
import SettingsModal from '@/components/auth/SettingsModal';

interface HeaderProps {
  onSave?: () => void;
  onLoad?: () => void;
  onExportPdf?: () => void;
  onNavigateToLogin?: () => void;
  onBackToProjects?: () => void;
}

const AVATAR_COLORS = ['#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#D97706', '#059669', '#0891B2', '#0284C7'];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export function UserAvatar({ name, size = 32 }: { name: string; size?: number }) {
  const color = getAvatarColor(name);
  const initials = getInitials(name);
  return (
    <div
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.375 }}
      className="rounded-full flex items-center justify-center text-white font-semibold select-none shrink-0"
    >
      {initials}
    </div>
  );
}

function OrgBadge() {
  const { currentOrg, orgs } = useAuthState();
  const { switchOrg } = useAuthActions();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!currentOrg) return null;

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button
        onClick={() => orgs.length > 1 && setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 transition-colors ${orgs.length > 1 ? 'hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer' : 'cursor-default'}`}
      >
        <Building2 className="w-3.5 h-3.5 text-gray-400" />
        <span className="max-w-28 truncate">{currentOrg.name}</span>
        {orgs.length > 1 && <ChevronDown className="w-3 h-3 text-gray-400" />}
      </button>

      {open && orgs.length > 1 && (
        <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-[200]">
          <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Switch organization</p>
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => { switchOrg(org.id); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="flex-1 truncate text-left">{org.name}</span>
              {org.id === currentOrg.id && <Check className="w-3.5 h-3.5 text-primary-500 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UserMenu({ onNavigateToLogin }: { onNavigateToLogin?: () => void }) {
  const { user } = useAuthState();
  const { signOut } = useAuthActions();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!user) {
    return (
      <button
        onClick={onNavigateToLogin}
        className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
      >
        Sign in
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-full ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-slate-500 transition-all"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <UserAvatar name={user.displayName} size={34} />
      </button>

      {open && createPortal(
        <>
          {/* invisible backdrop — catches clicks outside the panel */}
          <div className="fixed inset-0 z-[499]" onClick={() => setOpen(false)} />

          {/* dropdown panel anchored below the avatar button */}
          <div className="fixed top-[68px] right-4 sm:right-6 lg:right-8 w-72 z-[500] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* profile card — large centered avatar + name + email */}
            <div className="flex flex-col items-center px-5 pt-6 pb-5 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
              <UserAvatar name={user.displayName} size={60} />
              <p className="mt-3 text-base font-semibold text-gray-900 dark:text-white">{user.displayName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-full">{user.email}</p>
            </div>

            <div className="py-1.5">
              <button
                onClick={() => { setOpen(false); setShowSettings(true); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Settings
              </button>
            </div>

            <div className="border-t border-gray-100 dark:border-slate-700 py-1.5">
              <button
                onClick={async () => { setOpen(false); await signOut(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
                Sign out
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* SettingsModal via portal so it escapes the header's backdrop-filter stacking context */}
      {showSettings && createPortal(
        <SettingsModal onClose={() => setShowSettings(false)} />,
        document.body
      )}
    </>
  );
}

export default function Header({ onSave, onLoad, onExportPdf, onNavigateToLogin, onBackToProjects }: HeaderProps = {}) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackToProjects && (
            <button
              onClick={onBackToProjects}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mr-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Projects</span>
            </button>
          )}
          <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">PeptiPlan</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5 hidden sm:block">Peptide Manufacturing Planner</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSave && (
            <button onClick={onSave} className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
              Save
            </button>
          )}
          {onLoad && (
            <button onClick={onLoad} className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
              Load
            </button>
          )}
          {onExportPdf && (
            <button onClick={onExportPdf} className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-accent-500 rounded-lg hover:bg-accent-600 transition-colors">
              Export PDF
            </button>
          )}
          <OrgBadge />
          <ToggleTheme />
          <UserMenu onNavigateToLogin={onNavigateToLogin} />
        </div>
      </div>
    </header>
  );
}

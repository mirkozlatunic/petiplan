import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, ChevronDown, Check, AlertCircle, Eye, Pencil } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import type { ProjectRecord, ProjectShare, SharePermission } from '@/types';

interface ShareModalProps {
  project: ProjectRecord;
  onClose: () => void;
}

const PERMISSION_LABELS: Record<SharePermission, { label: string; icon: React.ElementType }> = {
  read: { label: 'Can view', icon: Eye },
  edit: { label: 'Can edit', icon: Pencil },
};

function PermissionSelect({
  value,
  onChange,
}: {
  value: SharePermission;
  onChange: (p: SharePermission) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = PERMISSION_LABELS[value];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
      >
        <current.icon className="w-3 h-3" />
        {current.label}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-10">
          {(Object.entries(PERMISSION_LABELS) as [SharePermission, typeof PERMISSION_LABELS[SharePermission]][]).map(([p, { label, icon: Icon }]) => (
            <button
              key={p}
              type="button"
              onClick={() => { onChange(p); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Icon className="w-3 h-3" />
              {label}
              {p === value && <Check className="w-3 h-3 ml-auto text-primary-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShareModal({ project, onClose }: ShareModalProps) {
  const { shareProject, getShares, removeShare, updateSharePermission } = useProjects();

  const [shares, setShares] = useState<ProjectShare[]>([]);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<SharePermission>('read');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
    getShares(project.id).then(setShares).catch(console.error);
  }, [project.id, getShares]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setInviteError(null);
    setInviting(true);
    try {
      await shareProject(project.id, email.trim(), permission);
      const updated = await getShares(project.id);
      setShares(updated);
      setEmail('');
      setInviteSent(true);
      setTimeout(() => setInviteSent(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to share';
      setInviteError(msg.includes('unique') ? 'Already shared with this person' : msg);
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(shareId: string) {
    await removeShare(shareId);
    setShares((prev) => prev.filter((s) => s.id !== shareId));
  }

  async function handleUpdatePermission(shareId: string, perm: SharePermission) {
    await updateSharePermission(shareId, perm);
    setShares((prev) => prev.map((s) => (s.id === shareId ? { ...s, permission: perm } : s)));
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Share project</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-64">{project.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invite form */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setInviteError(null); }}
              placeholder="colleague@company.com"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <PermissionSelect value={permission} onChange={setPermission} />
            <button
              type="submit"
              disabled={inviting}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg transition-colors shrink-0"
            >
              {inviteSent ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </button>
          </form>

          {inviteError && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {inviteError}
            </div>
          )}
          {inviteSent && (
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">Invite sent successfully.</p>
          )}
        </div>

        {/* Current shares */}
        <div className="px-6 py-3 max-h-64 overflow-y-auto">
          {shares.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic py-3 text-center">Not shared with anyone yet.</p>
          ) : (
            <div className="space-y-1">
              {shares.map((share) => (
                <div key={share.id} className="flex items-center gap-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shrink-0">
                    {(share.profile?.email ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">{share.profile?.email}</p>
                  </div>
                  <PermissionSelect
                    value={share.permission}
                    onChange={(p) => handleUpdatePermission(share.id, p)}
                  />
                  <button
                    onClick={() => handleRemove(share.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove access"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 pb-4 pt-2">
          <button onClick={onClose} className="w-full py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, FolderOpen, Trash2, Clock, Layers, FlaskConical, AlertCircle, Share2, Eye, Pencil, Building2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import MigrateLocalModal from '@/components/projects/MigrateLocalModal';
import ShareModal from '@/components/projects/ShareModal';
import { useProjects } from '@/hooks/useProjects';
import { useAuthState } from '@/context/AuthContext';
import { listSavedProjects } from '@/utils/storage';
import { formatDate } from '@/utils/formatters';
import type { ProjectRecord, ProjectState, SharePermission } from '@/types';

interface ProjectsPageProps {
  onOpenProject: (record: ProjectRecord) => void;
  onNewProject: () => void;
}

const AVATAR_COLORS = ['#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#D97706', '#059669', '#0891B2', '#0284C7'];
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function PermissionBadge({ permission }: { permission: SharePermission | 'owner' }) {
  if (permission === 'owner') return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      permission === 'edit'
        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
        : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
    }`}>
      {permission === 'edit' ? <Pencil className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      {permission === 'edit' ? 'Can edit' : 'View only'}
    </span>
  );
}

function ProjectCard({
  record,
  onOpen,
  onDelete,
  onShare,
  isOwner,
}: {
  record: ProjectRecord;
  onOpen: () => void;
  onDelete: () => void;
  onShare: () => void;
  isOwner: boolean;
}) {
  const state = record.state as ProjectState;
  const color = getAvatarColor(record.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-md transition-all overflow-hidden flex flex-col">
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 flex-1">
            {record.name}
          </h3>
          {isOwner && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onShare(); }}
                className="p-1 rounded-md text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                aria-label="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400">
            <Layers className="w-3 h-3" />
            {state.batchCount} batch{state.batchCount !== 1 ? 'es' : ''}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400">
            <FlaskConical className="w-3 h-3" />
            {state.scale === 'custom' ? `${state.customScaleGrams}g` : state.scale}
          </span>
          {state.gmpStatus === 'gmp' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              GMP
            </span>
          )}
          {record.myPermission && record.myPermission !== 'owner' && (
            <PermissionBadge permission={record.myPermission} />
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-auto">
          <Clock className="w-3 h-3" />
          {formatDate(record.updatedAt)}
        </div>
      </div>

      {confirmDelete ? (
        <div className="px-4 pb-4 flex gap-2">
          <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onDelete(); setConfirmDelete(false); }} className="flex-1 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
            Delete
          </button>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <button onClick={onOpen} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-white rounded-lg transition-colors" style={{ backgroundColor: color }}>
            <FolderOpen className="w-4 h-4" />
            Open
          </button>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  projects,
  onOpen,
  onDelete,
  onShare,
  userId,
}: {
  title: string;
  icon: React.ReactNode;
  projects: ProjectRecord[];
  onOpen: (r: ProjectRecord) => void;
  onDelete: (id: string) => void;
  onShare: (r: ProjectRecord) => void;
  userId: string;
}) {
  if (projects.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">({projects.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map((record) => (
          <ProjectCard
            key={record.id}
            record={record}
            onOpen={() => onOpen(record)}
            onDelete={() => onDelete(record.id)}
            onShare={() => onShare(record)}
            isOwner={record.ownerUserId === userId || record.myPermission === 'owner'}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onNewProject }: { onNewProject: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mb-4">
        <FlaskConical className="w-8 h-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No projects yet</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        Create your first peptide manufacturing plan to get started.
      </p>
      <button onClick={onNewProject} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-colors shadow-lg shadow-primary-500/25">
        <Plus className="w-4 h-4" />
        New Project
      </button>
    </div>
  );
}

export default function ProjectsPage({ onOpenProject, onNewProject }: ProjectsPageProps) {
  const { user, currentOrg } = useAuthState();
  const { projects, loading, error, fetchProjects, deleteProject, migrateLocalProjects } = useProjects();
  const [showMigrate, setShowMigrate] = useState(false);
  const [localProjects, setLocalProjects] = useState(() => listSavedProjects());
  const [shareTarget, setShareTarget] = useState<ProjectRecord | null>(null);

  useEffect(() => {
    fetchProjects();
    const offered = localStorage.getItem('peptiplan-migration-offered');
    if (!offered) {
      const locals = listSavedProjects();
      if (locals.length > 0) {
        setLocalProjects(locals);
        setShowMigrate(true);
      } else {
        localStorage.setItem('peptiplan-migration-offered', 'true');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myProjects = projects.filter((p) => p.ownerUserId === user?.id);
  const orgProjects = projects.filter((p) => p.ownerType === 'org' && p.ownerOrgId === currentOrg?.id);
  const sharedProjects = projects.filter((p) => p.myPermission !== 'owner' && p.ownerUserId !== user?.id && p.ownerType !== 'org');
  const totalCount = projects.length;

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {totalCount > 0 ? `${totalCount} project${totalCount !== 1 ? 's' : ''}` : 'Your manufacturing plans'}
            </p>
          </div>
          <button onClick={onNewProject} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {loading && projects.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : totalCount === 0 ? (
          <EmptyState onNewProject={onNewProject} />
        ) : (
          <div className="space-y-10">
            <Section
              title="My Projects"
              icon={<FolderOpen className="w-4 h-4" />}
              projects={myProjects}
              onOpen={onOpenProject}
              onDelete={deleteProject}
              onShare={setShareTarget}
              userId={user?.id ?? ''}
            />
            {orgProjects.length > 0 && (
              <Section
                title={currentOrg?.name ?? 'Organization'}
                icon={<Building2 className="w-4 h-4" />}
                projects={orgProjects}
                onOpen={onOpenProject}
                onDelete={deleteProject}
                onShare={setShareTarget}
                userId={user?.id ?? ''}
              />
            )}
            {sharedProjects.length > 0 && (
              <Section
                title="Shared with me"
                icon={<Share2 className="w-4 h-4" />}
                projects={sharedProjects}
                onOpen={onOpenProject}
                onDelete={deleteProject}
                onShare={setShareTarget}
                userId={user?.id ?? ''}
              />
            )}
          </div>
        )}
      </main>

      {showMigrate && (
        <MigrateLocalModal
          localProjects={localProjects}
          migrateLocalProjects={migrateLocalProjects}
          onComplete={(imported) => { setShowMigrate(false); if (imported > 0) fetchProjects(); }}
          onDismiss={() => setShowMigrate(false)}
        />
      )}

      {shareTarget && (
        <ShareModal project={shareTarget} onClose={() => setShareTarget(null)} />
      )}
    </>
  );
}

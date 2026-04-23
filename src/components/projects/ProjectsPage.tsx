import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, FolderOpen, Trash2, Clock, Layers, FlaskConical, AlertCircle, Share2, Eye, Pencil, Building2, Folder, ChevronDown, Copy, TriangleAlert } from 'lucide-react';
import Header from '@/components/layout/Header';
import MigrateLocalModal from '@/components/projects/MigrateLocalModal';
import ShareModal from '@/components/projects/ShareModal';
import { useAuthState } from '@/context/AuthContext';
import { listSavedProjects } from '@/utils/storage';
import { formatDate } from '@/utils/formatters';
import type { ProjectRecord, ProjectState, SavedProject, SharePermission } from '@/types';

interface ProjectsPageProps {
  onOpenProject: (record: ProjectRecord) => void;
  onNewProject: () => void;
  onUseAsTemplate: (record: ProjectRecord) => void;
  projects: ProjectRecord[];
  loading: boolean;
  error: string | null;
  onDeleteProject: (id: string) => Promise<void>;
  onFetchProjects: () => Promise<void>;
  onMigrateLocalProjects: (locals: SavedProject[]) => Promise<{ imported: number; failed: string[] }>;
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

function DeleteConfirmModal({
  projectName,
  onConfirm,
  onCancel,
}: {
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Delete project?</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You're about to delete <span className="font-medium text-gray-700 dark:text-gray-200">"{projectName}"</span>.
          </p>
        </div>
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg">
          <TriangleAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-400">
            This action cannot be reversed. All project data will be permanently lost.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  record,
  onOpen,
  onDelete,
  onShare,
  onUseAsTemplate,
  isOwner,
}: {
  record: ProjectRecord;
  onOpen: () => void;
  onDelete: () => void;
  onShare: () => void;
  onUseAsTemplate: () => void;
  isOwner: boolean;
}) {
  const state = record.state as ProjectState;
  const color = getAvatarColor(record.name);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
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
                  onClick={(e) => { e.stopPropagation(); onUseAsTemplate(); }}
                  className="p-1 rounded-md text-gray-400 hover:text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors"
                  aria-label="Use as template"
                  title="Use as template"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onShare(); }}
                  className="p-1 rounded-md text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
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

        <div className="px-4 pb-4">
          <button onClick={onOpen} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-white rounded-lg transition-colors" style={{ backgroundColor: color }}>
            <FolderOpen className="w-4 h-4" />
            Open
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          projectName={record.name}
          onConfirm={() => { onDelete(); setShowDeleteModal(false); }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

function Section({
  title,
  icon,
  projects,
  onOpen,
  onDelete,
  onShare,
  onUseAsTemplate,
  userId,
}: {
  title: string;
  icon: React.ReactNode;
  projects: ProjectRecord[];
  onOpen: (r: ProjectRecord) => void;
  onDelete: (id: string) => void;
  onShare: (r: ProjectRecord) => void;
  onUseAsTemplate: (r: ProjectRecord) => void;
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
            onUseAsTemplate={() => onUseAsTemplate(record)}
            isOwner={record.ownerUserId === userId || record.myPermission === 'owner'}
          />
        ))}
      </div>
    </div>
  );
}

function FolderSection({
  name,
  projects,
  onOpen,
  onDelete,
  onShare,
  onUseAsTemplate,
  userId,
}: {
  name: string;
  projects: ProjectRecord[];
  onOpen: (r: ProjectRecord) => void;
  onDelete: (id: string) => void;
  onShare: (r: ProjectRecord) => void;
  onUseAsTemplate: (r: ProjectRecord) => void;
  userId: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 mb-3 group"
      >
        <Folder className="w-4 h-4 text-primary-400" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">({projects.length})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {projects.map((record) => (
                <ProjectCard
                  key={record.id}
                  record={record}
                  onOpen={() => onOpen(record)}
                  onDelete={() => onDelete(record.id)}
                  onShare={() => onShare(record)}
                  onUseAsTemplate={() => onUseAsTemplate(record)}
                  isOwner={record.ownerUserId === userId || record.myPermission === 'owner'}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

export default function ProjectsPage({
  onOpenProject, onNewProject, onUseAsTemplate,
  projects, loading, error,
  onDeleteProject, onFetchProjects, onMigrateLocalProjects,
}: ProjectsPageProps) {
  const { user, currentOrg } = useAuthState();
  const [showMigrate, setShowMigrate] = useState(false);
  const [localProjects, setLocalProjects] = useState(() => listSavedProjects());
  const [shareTarget, setShareTarget] = useState<ProjectRecord | null>(null);

  useEffect(() => {
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
            {(() => {
              const ungrouped = myProjects.filter((p) => !p.folder);
              const folderNames = [...new Set(myProjects.filter((p) => p.folder).map((p) => p.folder as string))].sort();
              return (
                <div className="space-y-8">
                  {ungrouped.length > 0 && (
                    <Section
                      title="My Projects"
                      icon={<FolderOpen className="w-4 h-4" />}
                      projects={ungrouped}
                      onOpen={onOpenProject}
                      onDelete={onDeleteProject}
                      onShare={setShareTarget}
                      onUseAsTemplate={onUseAsTemplate}
                      userId={user?.id ?? ''}
                    />
                  )}
                  {folderNames.map((folder) => (
                    <FolderSection
                      key={folder}
                      name={folder}
                      projects={myProjects.filter((p) => p.folder === folder)}
                      onOpen={onOpenProject}
                      onDelete={onDeleteProject}
                      onShare={setShareTarget}
                      onUseAsTemplate={onUseAsTemplate}
                      userId={user?.id ?? ''}
                    />
                  ))}
                </div>
              );
            })()}
            {orgProjects.length > 0 && (
              <Section
                title={currentOrg?.name ?? 'Organization'}
                icon={<Building2 className="w-4 h-4" />}
                projects={orgProjects}
                onOpen={onOpenProject}
                onDelete={onDeleteProject}
                onShare={setShareTarget}
                onUseAsTemplate={onUseAsTemplate}
                userId={user?.id ?? ''}
              />
            )}
            {sharedProjects.length > 0 && (
              <Section
                title="Shared with me"
                icon={<Share2 className="w-4 h-4" />}
                projects={sharedProjects}
                onOpen={onOpenProject}
                onDelete={onDeleteProject}
                onShare={setShareTarget}
                onUseAsTemplate={onUseAsTemplate}
                userId={user?.id ?? ''}
              />
            )}
          </div>
        )}
      </main>

      {showMigrate && (
        <MigrateLocalModal
          localProjects={localProjects}
          migrateLocalProjects={onMigrateLocalProjects}
          onComplete={(imported) => { setShowMigrate(false); if (imported > 0) onFetchProjects(); }}
          onDismiss={() => setShowMigrate(false)}
        />
      )}

      {shareTarget && (
        <ShareModal project={shareTarget} onClose={() => setShareTarget(null)} />
      )}
    </>
  );
}

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthState } from '@/context/AuthContext';
import type { ProjectRecord, ProjectShare, ProjectState, SavedProject, OwnerType, SharePermission } from '@/types';

interface ProjectRow {
  id: string;
  name: string;
  owner_type: OwnerType;
  owner_user_id: string | null;
  owner_org_id: string | null;
  state: unknown;
  created_at: string;
  updated_at: string;
}

interface ShareRow {
  id: string;
  project_id: string;
  shared_with: string;
  permission: SharePermission;
  granted_by: string;
  invited_email: string;
  created_at: string;
}

function mapRow(row: ProjectRow, permission: SharePermission | 'owner' = 'owner'): ProjectRecord {
  return {
    id: row.id,
    name: row.name,
    ownerType: row.owner_type,
    ownerUserId: row.owner_user_id,
    ownerOrgId: row.owner_org_id,
    state: row.state as ProjectState,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    myPermission: permission,
  };
}

function mapShare(row: ShareRow): ProjectShare {
  return {
    id: row.id,
    projectId: row.project_id,
    sharedWith: row.shared_with,
    permission: row.permission,
    grantedBy: row.granted_by,
    createdAt: row.created_at,
    profile: { displayName: row.invited_email.split('@')[0], email: row.invited_email, avatarUrl: null },
  };
}

export interface UseProjectsReturn {
  projects: ProjectRecord[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  saveProject: (state: ProjectState, projectId?: string) => Promise<ProjectRecord>;
  deleteProject: (projectId: string) => Promise<void>;
  migrateLocalProjects: (locals: SavedProject[]) => Promise<{ imported: number; failed: string[] }>;
  shareProject: (projectId: string, email: string, permission: SharePermission) => Promise<void>;
  getShares: (projectId: string) => Promise<ProjectShare[]>;
  removeShare: (shareId: string) => Promise<void>;
  updateSharePermission: (shareId: string, permission: SharePermission) => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const { user, orgs } = useAuthState();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [projectsResult, sharesResult] = await Promise.all([
        supabase.from('projects').select('*').order('updated_at', { ascending: false }),
        supabase.from('project_shares').select('project_id, permission').eq('shared_with', user.id),
      ]);
      if (projectsResult.error) throw projectsResult.error;

      const myOrgIds = new Set(orgs.map((o) => o.id));
      const shareMap = new Map<string, SharePermission>(
        ((sharesResult.data ?? []) as { project_id: string; permission: SharePermission }[])
          .map((s) => [s.project_id, s.permission])
      );

      const records = (projectsResult.data as ProjectRow[]).map((row) => {
        if (row.owner_user_id === user.id) return mapRow(row, 'owner');
        if (row.owner_org_id && myOrgIds.has(row.owner_org_id)) return mapRow(row, 'owner');
        const perm = shareMap.get(row.id);
        return mapRow(row, perm ?? 'read');
      });

      setProjects(records);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [user, orgs]);

  const saveProject = useCallback(async (state: ProjectState, projectId?: string): Promise<ProjectRecord> => {
    if (!user) throw new Error('Not authenticated');

    if (projectId) {
      const { data, error: err } = await supabase
        .from('projects')
        .update({ name: state.projectName || 'Untitled Project', state, updated_at: new Date().toISOString() })
        .eq('id', projectId)
        .select()
        .single();
      if (err) throw err;
      const record = mapRow(data as ProjectRow);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? record : p)));
      return record;
    } else {
      const { data, error: err } = await supabase
        .from('projects')
        .insert({ name: state.projectName || 'Untitled Project', owner_type: 'user', owner_user_id: user.id, state })
        .select()
        .single();
      if (err) throw err;
      const record = mapRow(data as ProjectRow);
      setProjects((prev) => [record, ...prev]);
      return record;
    }
  }, [user]);

  const deleteProject = useCallback(async (projectId: string) => {
    const { error: err } = await supabase.from('projects').delete().eq('id', projectId);
    if (err) throw err;
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  }, []);

  const migrateLocalProjects = useCallback(async (locals: SavedProject[]): Promise<{ imported: number; failed: string[] }> => {
    if (!user) throw new Error('Not authenticated');
    let imported = 0;
    const failed: string[] = [];
    for (const local of locals) {
      try {
        await saveProject(local.state);
        imported++;
      } catch {
        failed.push(local.name);
      }
    }
    return { imported, failed };
  }, [user, saveProject]);

  const shareProject = useCallback(async (projectId: string, email: string, permission: SharePermission) => {
    if (!user) throw new Error('Not authenticated');

    const { data: targetUserId } = await supabase.rpc('find_user_by_email', { p_email: email });

    if (targetUserId) {
      const { error: err } = await supabase.from('project_shares').insert({
        project_id: projectId,
        shared_with: targetUserId,
        permission,
        granted_by: user.id,
        invited_email: email,
      });
      if (err) throw err;
    } else {
      const { error: err } = await supabase.from('invitations').insert({
        project_id: projectId,
        email,
        invited_by: user.id,
        permission,
      });
      if (err) throw err;
    }
  }, [user]);

  const getShares = useCallback(async (projectId: string): Promise<ProjectShare[]> => {
    const { data, error: err } = await supabase
      .from('project_shares')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    if (err) throw err;
    return (data as ShareRow[]).map(mapShare);
  }, []);

  const removeShare = useCallback(async (shareId: string) => {
    const { error: err } = await supabase.from('project_shares').delete().eq('id', shareId);
    if (err) throw err;
  }, []);

  const updateSharePermission = useCallback(async (shareId: string, permission: SharePermission) => {
    const { error: err } = await supabase.from('project_shares').update({ permission }).eq('id', shareId);
    if (err) throw err;
  }, []);

  return {
    projects, loading, error,
    fetchProjects, saveProject, deleteProject, migrateLocalProjects,
    shareProject, getShares, removeShare, updateSharePermission,
  };
}

import type { ProjectState, SavedProject } from '../types';

const STORAGE_KEY = 'peptiplan-projects';

export function saveProject(state: ProjectState): void {
  const projects = listSavedProjects();
  const existing = projects.findIndex((p) => p.name === state.projectName);
  const entry: SavedProject = {
    name: state.projectName || 'Untitled Project',
    savedAt: new Date().toISOString(),
    state,
  };

  if (existing >= 0) {
    projects[existing] = entry;
  } else {
    projects.push(entry);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function listSavedProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedProject[];
  } catch {
    return [];
  }
}

export function loadProject(name: string): ProjectState | null {
  const projects = listSavedProjects();
  const found = projects.find((p) => p.name === name);
  return found?.state ?? null;
}

export function deleteProject(name: string): void {
  const projects = listSavedProjects().filter((p) => p.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

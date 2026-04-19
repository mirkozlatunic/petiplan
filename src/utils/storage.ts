import type { ProjectState, SavedProject } from '../types';

const STORAGE_KEY = 'peptiplan-projects';
const SCHEMA_VERSION = 2;

interface StorageContainer {
  version: number;
  projects: SavedProject[];
}

function readContainer(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as StorageContainer | SavedProject[];

    // Version 1: raw array (no version field)
    if (Array.isArray(parsed)) {
      return parsed;
    }

    // Version 2+: versioned container
    if (parsed && typeof parsed === 'object' && 'projects' in parsed) {
      return (parsed as StorageContainer).projects ?? [];
    }

    return [];
  } catch {
    return [];
  }
}

function writeContainer(projects: SavedProject[]): void {
  const container: StorageContainer = { version: SCHEMA_VERSION, projects };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(container));
  } catch (e) {
    // Storage quota exceeded or unavailable
    console.warn('PeptiPlan: failed to save projects to localStorage', e);
  }
}

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

  writeContainer(projects);
}

export function listSavedProjects(): SavedProject[] {
  return readContainer();
}

export function loadProject(name: string): ProjectState | null {
  const projects = listSavedProjects();
  const found = projects.find((p) => p.name === name);
  return found?.state ?? null;
}

export function deleteProject(name: string): void {
  const projects = listSavedProjects().filter((p) => p.name !== name);
  writeContainer(projects);
}

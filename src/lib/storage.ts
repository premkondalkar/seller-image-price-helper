import type { ProjectState } from '../types';

const KEY = 'seller-image-price-helper:v1';

export function loadProject(): ProjectState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProjectState;
  } catch {
    return null;
  }
}

export function saveProject(project: ProjectState): void {
  try { localStorage.setItem(KEY, JSON.stringify({ ...project, updatedAt: Date.now() })); } catch {
    // Storage quota errors are handled by the caller via toast; app state remains usable.
    throw new Error('Unable to save this project. Your browser storage may be full.');
  }
}

export function clearProject(): void { localStorage.removeItem(KEY); }

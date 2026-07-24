import type { PersistedState } from './urlHash';

const KEY = 'wlpr-state-v1';

export function saveToStorage(s: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // storage unavailable (private mode, quota) — persistence degrades silently
  }
}

export function loadFromStorage(): Partial<PersistedState> | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

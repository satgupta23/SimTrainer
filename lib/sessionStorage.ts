// lib/sessionStorage.ts
export interface StoredMessage {
  role: 'user' | 'ai';
  content: string;
}

export interface StoredEvaluation {
  scenarioId: string;
  scenarioTitle: string | null;
  scores: {
    empathy: number;
    curiosity: number;
    structure: number;
  };
  notes: string[];
}

export interface StoredSession {
  id: string;
  scenarioId: string;
  createdAt: string; // ISO string
  messages: StoredMessage[];
  evaluation: StoredEvaluation;
}

const STORAGE_KEY = 'simtrainer-sessions-v1';

export function saveSession(session: StoredSession) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: StoredSession[] = raw ? JSON.parse(raw) : [];
    const updated = [session, ...list].slice(0, 20); // keep last 20
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save session', err);
  }
}

export function loadSessions(): StoredSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession[]) : [];
  } catch {
    return [];
  }
}

export function clearSessions() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear sessions', err);
  }
}

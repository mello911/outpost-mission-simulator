import { MissionState } from '../types';

const STORAGE_KEY = 'OUTPOST_MISSION_STATE_V1';
const HIGH_SCORES_KEY = 'OUTPOST_HIGH_SCORES_V1';

export interface SavedScore {
  id: string;
  destination: string;
  solsCompleted: number;
  totalScore: number;
  rankTitle: string;
  date: string;
  outcome: 'success' | 'failure';
}

export function saveMissionToStorage(state: MissionState): boolean {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save mission state to localStorage', err);
    return false;
  }
}

export function loadMissionFromStorage(): MissionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MissionState;
  } catch (err) {
    console.error('Failed to parse mission state from localStorage', err);
    return null;
  }
}

export function clearSavedMission(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function recordHighScore(score: SavedScore): void {
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY);
    const scores: SavedScore[] = raw ? JSON.parse(raw) : [];
    scores.unshift(score);
    // keep top 10
    scores.sort((a, b) => b.totalScore - a.totalScore);
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores.slice(0, 10)));
  } catch {
    // ignore
  }
}

export function getHighScores(): SavedScore[] {
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

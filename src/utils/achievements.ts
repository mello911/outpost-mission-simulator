/**
 * OUTPOST Achievement System & Persistence Utilities
 * Handles achievement state management, LocalStorage persistence, audio fanfare,
 * and unlock notification toasts.
 */

import { Achievement, INITIAL_ACHIEVEMENTS } from '../data/achievements';
import { soundEngine } from './audio';
import confetti from 'canvas-confetti';

export const ACHIEVEMENTS_STORAGE_KEY = 'outpost_achievements_v1';
export const ACHIEVEMENT_UNLOCKED_EVENT = 'outpost_achievement_unlocked';

type AchievementListener = (achievement: Achievement) => void;
const listeners: Set<AchievementListener> = new Set();

/**
 * Retrieve the current achievements list from LocalStorage,
 * merging with INITIAL_ACHIEVEMENTS so new achievements are always present.
 */
export function getAchievementsList(): Achievement[] {
  if (typeof window === 'undefined') {
    return INITIAL_ACHIEVEMENTS.map(a => ({ ...a }));
  }

  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!raw) {
      saveAchievementsList(INITIAL_ACHIEVEMENTS);
      return INITIAL_ACHIEVEMENTS.map(a => ({ ...a }));
    }

    const saved: Achievement[] = JSON.parse(raw);
    const savedMap = new Map<string, Achievement>();
    saved.forEach(item => savedMap.set(item.id, item));

    // Merge to preserve newly defined achievements while keeping unlocked status
    const merged: Achievement[] = INITIAL_ACHIEVEMENTS.map(initial => {
      const match = savedMap.get(initial.id);
      if (match) {
        return {
          ...initial,
          unlocked: Boolean(match.unlocked),
          unlockedAt: match.unlockedAt,
        };
      }
      return { ...initial };
    });

    return merged;
  } catch (err) {
    console.warn('Failed to load achievements from LocalStorage:', err);
    return INITIAL_ACHIEVEMENTS.map(a => ({ ...a }));
  }
}

/**
 * Persist achievements list to LocalStorage
 */
export function saveAchievementsList(list: Achievement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save achievements to LocalStorage:', err);
  }
}

/**
 * Subscribe to achievement unlock events
 */
export function subscribeToAchievements(callback: AchievementListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Trigger an unlock notification toast in the DOM
 */
function renderUnlockToastDOM(achievement: Achievement) {
  if (typeof document === 'undefined') return;

  const containerId = 'outpost-achievement-toast-container';
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.top = '24px';
    container.style.right = '24px';
    container.style.zIndex = '999999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.pointerEvents = 'auto';
  toast.style.minWidth = '320px';
  toast.style.maxWidth = '420px';
  toast.style.backgroundColor = 'rgba(11, 15, 25, 0.96)';
  toast.style.border = '1px solid rgba(6, 182, 212, 0.8)';
  toast.style.boxShadow = '0 10px 25px -5px rgba(6, 182, 212, 0.4), 0 0 15px rgba(6, 182, 212, 0.3)';
  toast.style.borderRadius = '16px';
  toast.style.padding = '14px 18px';
  toast.style.color = '#ffffff';
  toast.style.fontFamily = 'monospace, sans-serif';
  toast.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
  toast.style.transform = 'translateY(-20px) scale(0.95)';
  toast.style.opacity = '0';

  toast.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 14px;">
      <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(245, 158, 11, 0.25)); border: 1px solid #06b6d4; border-radius: 12px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
        🏆
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px;">
          <span style="font-size: 10px; font-weight: 800; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.1em;">
            ACHIEVEMENT UNLOCKED // NASA
          </span>
          <span style="background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.5); color: #fbbf24; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 6px;">
            +${achievement.xpReward} XP
          </span>
        </div>
        <div style="font-size: 14px; font-weight: 800; color: #ffffff; margin-bottom: 3px; letter-spacing: -0.01em;">
          ${achievement.title}
        </div>
        <div style="font-size: 11px; color: #94a3b8; line-height: 1.35;">
          ${achievement.description}
        </div>
      </div>
    </div>
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0) scale(1)';
    toast.style.opacity = '1';
  });

  // Remove after 4.5 seconds
  setTimeout(() => {
    toast.style.transform = 'translateY(-15px) scale(0.95)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4500);
}

/**
 * Check and unlock an achievement by ID.
 * If not already unlocked:
 * - Updates LocalStorage
 * - Plays audio fanfare
 * - Displays unlock notification toast
 * - Triggers celebratory confetti
 * - Notifies subscribers and dispatches window event
 */
export function checkAndUnlockAchievement(achievementId: string): {
  unlocked: boolean;
  achievement: Achievement | null;
} {
  const currentList = getAchievementsList();
  const target = currentList.find(a => a.id === achievementId);

  if (!target) {
    console.warn(`Achievement id '${achievementId}' not recognized.`);
    return { unlocked: false, achievement: null };
  }

  // Already unlocked
  if (target.unlocked) {
    return { unlocked: false, achievement: target };
  }

  // Mark unlocked
  target.unlocked = true;
  target.unlockedAt = new Date().toISOString();

  // Save back to storage
  saveAchievementsList(currentList);

  // Play audio fanfare
  try {
    soundEngine.playAchievementFanfare();
  } catch {
    // ignore
  }

  // Trigger confetti burst
  if (typeof window !== 'undefined') {
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00e5ff', '#fc3d21', '#fbbf24', '#34d399', '#a855f7'],
        zIndex: 999999,
      });
    } catch {
      // ignore
    }

    // Render toast in DOM
    renderUnlockToastDOM(target);

    // Dispatch window CustomEvent
    try {
      window.dispatchEvent(
        new CustomEvent(ACHIEVEMENT_UNLOCKED_EVENT, { detail: target })
      );
    } catch {
      // ignore
    }
  }

  // Notify registered listeners
  listeners.forEach(cb => {
    try {
      cb(target);
    } catch (err) {
      console.error('Error notifying achievement listener:', err);
    }
  });

  return { unlocked: true, achievement: target };
}

/**
 * Reset all achievements to locked state (useful for testing or profile resets)
 */
export function resetAchievements(): void {
  const resetList = INITIAL_ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: false,
    unlockedAt: undefined,
  }));
  saveAchievementsList(resetList);
}

/**
 * Returns summary statistics of player's achievement progress
 */
export function getAchievementStats(): {
  total: number;
  unlocked: number;
  totalXP: number;
  earnedXP: number;
  percentComplete: number;
} {
  const list = getAchievementsList();
  const total = list.length;
  const unlocked = list.filter(a => a.unlocked).length;
  const totalXP = list.reduce((sum, a) => sum + a.xpReward, 0);
  const earnedXP = list.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);
  const percentComplete = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return { total, unlocked, totalXP, earnedXP, percentComplete };
}

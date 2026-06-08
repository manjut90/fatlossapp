// src/gamification/hooks/useGamification.ts

import { useGamificationStore } from '../store/useGamificationStore';
import { calculateXpForLevel } from '../utils/calculations';

/**
 * A comprehensive hook to access the user's complete gamification state.
 * It provides both the raw state from the Zustand store and derived values
 * needed for UI rendering, such as progress percentage.
 *
 * @returns An object with the user's gamification profile and derived data.
 */
export function useGamification() {
  // Select all state from the store.
  const level = useGamificationStore((state) => state.level);
  const xp = useGamificationStore((state) => state.xp);
  const prestigeTier = useGamificationStore((state) => state.prestigeTier);
  const currentStreak = useGamificationStore((state) => state.currentStreak);
  const achievements = useGamificationStore((state) => state.achievements);

  // Calculate derived values for UI convenience.
  const xpForCurrentLevel = calculateXpForLevel(level);
  const xpForNextLevel = calculateXpForLevel(level + 1);
  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;

  // Calculate progress, ensuring no division by zero and clamping between 0 and 1.
  const progress = xpNeededForNextLevel > 0
    ? Math.max(0, Math.min(1, xpInCurrentLevel / xpNeededForNextLevel))
    : 0;

  return {
    level,
    xp,
    prestigeTier,
    currentStreak,
    achievements,
    
    // Derived values for UI
    xpForNextLevel,
    progress, // A value between 0 and 1, perfect for a progress bar
  };
}
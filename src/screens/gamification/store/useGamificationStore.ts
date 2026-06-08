// src/gamification/store/useGamificationStore.ts

import { create } from 'zustand';
import { GamificationState } from '../types';
import { PRESTIGE_TIERS } from '../engine/constants';

/**
 * Actions available to mutate the gamification store.
 */
interface GamificationActions {
  setState: (newState: Partial<GamificationState>) => void;
  // This will be expanded with actions for optimistic updates, etc.
}

/**
 * The global Zustand store for managing the user's gamification state.
 *
 * It's initialized with a default state and provides actions to update it.
 * The UI will reactively update whenever this state changes.
 */
export const useGamificationStore = create<GamificationState & GamificationActions>((set) => ({
  // Default Initial State
  level: 1,
  xp: 0,
  xpForNextLevel: 100, // Initial value, will be calculated
  prestigeTier: PRESTIGE_TIERS[0], // 'White' tier
  currentStreak: 0,
  achievements: [],

  // Actions
  setState: (newState) => set((state) => ({ ...state, ...newState })),
}));
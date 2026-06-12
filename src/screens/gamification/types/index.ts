// src/gamification/types/index.ts

import { AchievementDefinition } from '../engine/achievements';

/**
 * Represents a single tier of prestige, unlocked at a certain level.
 */
export interface PrestigeTier {
  level: number;
  name: string;
  color: string;
}

/**
 * Represents a user's unlocked achievement.
 */
export interface Achievement {
  id: string; // e.g., 'FIRST_POST'
  unlockedAt: string; // ISO 8601 date string
  metadata?: Record<string, any>;
}

/**
 * The core state for the gamification engine managed by Zustand.
 * This represents the user's current gamification profile.
 */
export interface GamificationState {
  level: number;
  xp: number;
  xpForNextLevel: number;
  prestigeTier: PrestigeTier;
  currentStreak: number;
  achievements: Achievement[];
  pendingAchievement: AchievementDefinition | null;
}
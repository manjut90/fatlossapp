// src/gamification/engine/constants.ts

import { PrestigeTier } from '../types';

/**
 * Configuration for the level progression curve.
 * Formula: XP_for_level(L) = LEVEL_CURVE_BASE * (L ^ LEVEL_CURVE_EXPONENT)
 */
export const LEVEL_CURVE_BASE = 100;
export const LEVEL_CURVE_EXPONENT = 1.5;

/**
 * Defines the prestige tiers unlocked at different levels.
 * This is the single source of truth for prestige progression.
 */
export const PRESTIGE_TIERS: PrestigeTier[] = [
  { level: 0, name: 'White', color: '#E0E0E0' },
  { level: 100, name: 'Bronze', color: '#CD7F32' },
  { level: 200, name: 'Silver', color: '#C0C0C0' },
  { level: 300, name: 'Gold', color: '#FFD700' },
  { level: 500, name: 'Platinum', color: '#E5E4E2' },
  { level: 750, name: 'Diamond', color: '#B9F2FF' },
  { level: 1000, name: 'Cosmic', color: '#8B7CFF' },
];

/**
 * Base XP values for all trackable events.
 * The final XP awarded will be calculated using these base values
 * and various multipliers (streak, rarity, etc.).
 */
export const BASE_XP_VALUES = {
  // Content Creation
  POST_CREATED: 50,
  REEL_CREATED: 75,

  // Social Interaction
  LIKE_GIVEN: 5,
  COMMENT_GIVEN: 10,
  SHARE_GIVEN: 15,
  SAVE_GIVEN: 20,

  // Health & Fitness
  HEALTH_CHECKIN: 25,
  WORKOUT_COMPLETED_EASY: 30,
  WORKOUT_COMPLETED_MEDIUM: 50,
  WORKOUT_COMPLETED_HARD: 80,

  // Community Engagement
  STREAK_PARTICIPATION: 10, // e.g., for each day in a streak
  CHALLENGE_COMPLETED: 100,
};
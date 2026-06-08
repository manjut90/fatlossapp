// src/gamification/engine/events.ts

/**
 * Defines all possible events that can be tracked by the gamification engine.
 * Using an enum provides type safety and autocompletion.
 */
export enum GamificationEvent {
  // Content Creation
  POST_CREATED = 'POST_CREATED',
  REEL_CREATED = 'REEL_CREATED',

  // Social Interaction
  LIKE_GIVEN = 'LIKE_GIVEN',
  COMMENT_GIVEN = 'COMMENT_GIVEN',
  SHARE_GIVEN = 'SHARE_GIVEN',
  SAVE_GIVEN = 'SAVE_GIVEN',

  // Health & Fitness
  HEALTH_CHECKIN = 'HEALTH_CHECKIN',
  WORKOUT_COMPLETED_EASY = 'WORKOUT_COMPLETED_EASY',
  WORKOUT_COMPLETED_MEDIUM = 'WORKOUT_COMPLETED_MEDIUM',
  WORKOUT_COMPLETED_HARD = 'WORKOUT_COMPLETED_HARD',

  // Community Engagement
  STREAK_PARTICIPATION = 'STREAK_PARTICIPATION',
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED',
}
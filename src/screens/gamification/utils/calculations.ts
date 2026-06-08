// src/gamification/utils/calculations.ts

import { LEVEL_CURVE_BASE, LEVEL_CURVE_EXPONENT } from '../engine/constants';

/**
 * Calculates the total XP required to *reach* a specific level.
 * This is based on the exponential curve defined in constants.
 * @param level The level to calculate the XP requirement for.
 * @returns The total XP needed to have achieved that level.
 */
export function calculateXpForLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }
  // Using Math.floor to ensure we have integer values for XP.
  return Math.floor(LEVEL_CURVE_BASE * Math.pow(level - 1, LEVEL_CURVE_EXPONENT));
}
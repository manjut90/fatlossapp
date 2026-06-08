// src/theme/radii.ts

/**
 * ======================================================
 * RADII TOKENS
 * ======================================================
 *
 * Defines the border-radius values used throughout the app.
 * Using a consistent scale for radii creates a more
 * harmonious and professional visual design.
 */

export const radii = {
  /** 4px */
  sm: 4,
  /** 8px */
  md: 8,
  /** 12px */
  lg: 12,
  /** 16px */
  xl: 16,
  /** 24px */
  xxl: 24,
  /** 9999px (for creating pills/circles) */
  full: 9999,
};

export type Radii = keyof typeof radii;
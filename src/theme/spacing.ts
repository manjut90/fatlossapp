// src/theme/spacing.ts

/**
 * ======================================================
 * SPACING TOKENS
 * ======================================================
 *
 * This file defines the spacing scale for the entire app.
 * These values should be used for all margins, padding,
 * and other layout-related spacing to ensure visual
 * consistency.
 *
 * The scale is based on a 4px grid system, which is a
 * common and effective practice in modern UI design.
 */

export const spacing = {
  /** 2px */
  xxs: 2,
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 24px */
  xl: 24,
  /** 32px */
  xxl: 32,
  /** 48px */
  '3xl': 48,
  /** 64px */
  '4xl': 64,
};

export type Spacing = keyof typeof spacing;
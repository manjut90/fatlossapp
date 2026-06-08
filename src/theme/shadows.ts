// src/theme/shadows.ts

/**
 * ======================================================
 * SHADOW TOKENS
 * ======================================================
 *
 * Defines a standardized set of shadow styles for creating
 * depth and elevation in the UI. Using a consistent shadow
 * system is crucial for a polished look and feel.
 *
 * These styles are designed to be subtle and elegant.
 */

import { colors } from './colors';

export const shadows = {
  sm: {
    shadowColor: colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
};
// src/theme/index.ts

import { colors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// In a real-world scenario, we would define typography and shadow tokens here as well.

export const lightTheme = {
  colors: colors.light,
  spacing,
  radii,
};

export const darkTheme = {
  colors: colors.dark,
  spacing,
  radii,
};

export type AppTheme = typeof lightTheme;
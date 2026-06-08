import { LIGHT_COLORS, DARK_COLORS } from './colors';
import { spacing } from './spacing';
import { radii } from './radii';
import { typography } from './typography';
import { shadows } from './shadows';

export type AppTheme = {
  darkMode: boolean;
  colors: typeof DARK_COLORS;
  surface: string;
  background: string;
  text: string;
  primary: string;
  border: string;
};

const baseTheme = {
  spacing,
  radii,
  typography,
  shadows,
  textVariants: {
    header: {
      fontSize: 24,
      fontWeight: 'bold',
    },
  },
};

export const darkTheme = {
  ...baseTheme,
  darkMode: true,
  colors: DARK_COLORS,
  surface: DARK_COLORS.card,
  background: DARK_COLORS.background,
  text: DARK_COLORS.text,
  primary: DARK_COLORS.primary,
  border: DARK_COLORS.border,
};

export const lightTheme = {
  ...baseTheme,
  darkMode: false,
  colors: LIGHT_COLORS,
  surface: LIGHT_COLORS.card,
  background: LIGHT_COLORS.background,
  text: LIGHT_COLORS.text,
  primary: LIGHT_COLORS.primary,
  border: LIGHT_COLORS.border,
};

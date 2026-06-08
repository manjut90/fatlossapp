import {
  DARK_COLORS,
  LIGHT_COLORS,
} from './colors';

export const darkTheme = {
  darkMode: true,
  colors: DARK_COLORS,
};

export const lightTheme = {
  darkMode: false,
  colors: LIGHT_COLORS,
};

export let theme = darkTheme;

export const setTheme = (
  mode: 'dark' | 'light'
) => {
  theme =
    mode === 'dark'
      ? darkTheme
      : lightTheme;
};
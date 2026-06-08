// src/context/ThemeProvider.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, AppTheme } from '../theme/theme';

interface ThemeContextType extends AppTheme {
  isDarkMode: boolean;
  setColorScheme: (scheme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme || 'light');

  useEffect(() => {
    if (systemColorScheme) {
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme]);

  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleSetColorScheme = useCallback((scheme: 'light' | 'dark') => {
    setColorScheme(scheme);
  }, []);

  const value = useMemo(
    () => ({
      ...theme,
      isDarkMode,
      setColorScheme: handleSetColorScheme,
    }),
    [theme, isDarkMode, handleSetColorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useTheme } from '../context/ThemeProvider';
import RootNavigation from './RootNavigation';

const Navigation = () => {
  const { isDarkMode, colors } = useTheme();
  
  const navigationTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigation />
    </NavigationContainer>
  );
};

export default Navigation;
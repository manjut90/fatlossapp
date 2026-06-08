
import React from 'react';
import 'react-native-reanimated';

import {
  View,
  ActivityIndicator,
} from 'react-native';

import Navigation from './src/navigation';

import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import AuthStack from './src/navigation/AuthStack';
import OnboardingStack from './src/navigation/OnboardingStack';
import AppStack from './src/navigation/AppStack';

import {
  AuthProvider,
  useAuth,
} from './src/context/AuthContext';

import {
  OnboardingProvider,
} from './src/context/OnboardingContext';

import {
  HealthProvider,
} from './src/context/HealthContext';

import {
  ThemeProvider,
} from './src/context/ThemeProvider';

export default function App() {
  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
    >
      <AuthProvider>
        <OnboardingProvider>
          <HealthProvider>
            <ThemeProvider>
              <Navigation />
            </ThemeProvider>
          </HealthProvider>
        </OnboardingProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
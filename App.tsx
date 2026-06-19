import { useEffect } from 'react';

//import {
  //registerForPushNotificationsAsync,
  //scheduleDailyReminder,
  //scheduleNoonReminder,
//} from './src/utils/notifications';
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
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://78e50ccac6ad04a8a884c27b4304051a@o4511592683929600.ingest.us.sentry.io/4511592684126208',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: false,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

function NotificationInitializer() {
  useEffect(() => {
    console.log('🚀 NotificationInitializer mounted');

    async function setup() {
      try {
        await registerForPushNotificationsAsync();
        await scheduleDailyReminder();
        await scheduleNoonReminder();
        console.log('✅ Daily reminder scheduled');
      } catch (err) {
        console.error(
          '❌ Notification setup failed:',
          err
        );
      }
    }

    setup();
  }, []);

  return null;
}
export default Sentry.wrap(function App() {
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
});
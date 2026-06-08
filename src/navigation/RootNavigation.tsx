import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
import AppStack from './AppStack';

const RootNavigation = () => {
  const { user, profile, loading, profileLoading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || profileLoading) {
        setTimedOut(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [loading, profileLoading]);

  if ((loading || profileLoading) && !timedOut) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#8B7CFF" />
      </View>
    );
  }

  if (!user) {
    return <AuthStack />;
  }

  if (!profile || !profile.onboarding_completed) {
    return <OnboardingStack />;
  }

  return <AppStack />;
};

export default RootNavigation;
import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import GoalsScreen from '../screens/onboarding/GoalsScreen';

import PersonalInfoScreen from '../screens/onboarding/PersonalInfoScreen';

import LifestyleScreen from '../screens/onboarding/LifestyleScreen';

import MedicalScreen from '../screens/onboarding/MedicalScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import LoginScreen from '../screens/auth/LoginScreen';

const Stack =
  createNativeStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      initialRouteName="Goals"
      screenOptions={{
        headerShown: false,

        animation:
          'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
      />

      <Stack.Screen
        name="PersonalInfo"
        component={
          PersonalInfoScreen
        }
      />

      <Stack.Screen
        name="Lifestyle"
        component={
          LifestyleScreen
        }
      />

      <Stack.Screen
        name="Medical"
        component={
          MedicalScreen
        }
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
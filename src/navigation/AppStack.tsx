import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainTabs from './MainTabs';
import NotificationsScreen from '../screens/NotificationsScreen';
import CheckInScreen from '../screens/CheckInScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FitnessGoalsScreen from '../screens/FitnessGoalsScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="CheckIn"
            component={CheckInScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="EditProfile" component={EditProfileScreen}/>
          <Stack.Screen name="FitnessGoals" component={FitnessGoalsScreen}/>
        </Stack.Navigator>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});
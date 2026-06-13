// ======================================================
// MAIN TABS — COMPLETE REPLACEMENT
// PREMIUM FLOATING TAB SYSTEM
// ======================================================

import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, TrendingUp, Newspaper, Bot, User } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import ProgressScreen from '../screens/ProgressScreen';
import AICoachScreen from '../screens/AICoachScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import MessagesScreen from '../screens/MessagesScreen';
import CommentsScreen from '../screens/CommentsScreen';
import NeoMiniChat from '../components/NeoMiniChat';
import FloatingActionButton from '../components/FloatingActionButton';

const Tab = createBottomTabNavigator();
const FeedStack = createNativeStackNavigator();

const screenIcons = {
  Home: Home,
  Progress: TrendingUp,
  Feed: Newspaper,
  Coach: Bot,
  Profile: User,
};

function FeedStackScreen() {
  return (
    <FeedStack.Navigator screenOptions={{ headerShown: false }}>
      <FeedStack.Group>
        <FeedStack.Screen name="FeedHome" component={FeedScreen} />
        <FeedStack.Screen name="Search" component={SearchScreen} />
        <FeedStack.Screen name="Messages" component={MessagesScreen} />
      </FeedStack.Group>
      <FeedStack.Group screenOptions={{ presentation: 'transparentModal' }}>
        <FeedStack.Screen name="Comments" component={CommentsScreen} />
      </FeedStack.Group>
    </FeedStack.Navigator>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 30 }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = route.name;
          const isFocused = state.index === index;
          const Icon = screenIcons[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityStates={isFocused ? ['selected'] : []}
            >
              <Icon
                size={24}
                color={isFocused ? '#8B7CFF' : '#6B7280'}
                strokeWidth={isFocused ? 2.5 : 2}
              />
              <Text style={[styles.tabLabel, { color: isFocused ? '#8B7CFF' : '#6B7280' }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function MainTabs() {
  const navigation = useNavigation();
  const [neoVisible, setNeoVisible] = useState(false);

  const handleMediaPress = () => {
    navigation.navigate('CreatePost');
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        sceneContainerStyle={{ paddingBottom: 65 }}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
        <Tab.Screen name="Feed" component={FeedStackScreen} />
        <Tab.Screen name="Coach" component={AICoachScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <FloatingActionButton
        onNeoPress={() => setNeoVisible(true)}
        onMediaPress={handleMediaPress}
      />
      <NeoMiniChat visible={neoVisible} onClose={() => setNeoVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1020',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139,124,255,0.2)',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
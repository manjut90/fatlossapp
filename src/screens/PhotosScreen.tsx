import React, {
  useRef,
  useState,
} from 'react';

import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';

import ProfileHeader from '../components/profile/ProfileHeader';

import WorkoutPosts from '../components/profile/WorkoutPosts';

import SettingsSheet from '../components/profile/SettingsSheet';

import RivalsSection from '../components/profile/RivalsSection';

const HEADER_MAX_HEIGHT = 440;

const HEADER_MIN_HEIGHT = 120;

const SCROLL_DISTANCE =
  HEADER_MAX_HEIGHT -
  HEADER_MIN_HEIGHT;

export default function ProfileScreen() {
  const [
    settingsVisible,
    setSettingsVisible,
  ] = useState(false);

  const scrollY =
    useRef(
      new Animated.Value(0)
    ).current;

  const headerTranslate =
    scrollY.interpolate({
      inputRange: [
        0,
        SCROLL_DISTANCE,
      ],

      outputRange: [0, -90],

      extrapolate: 'clamp',
    });

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <Animated.View
        style={[
          styles.headerWrap,

          {
            transform: [
              {
                translateY:
                  headerTranslate,
              },
            ],
          },
        ]}
      >
        <ProfileHeader
          name="MJ"
          followers="12.8K"
          following="412"
          posts="87"
          onSettingsPress={() =>
            setSettingsVisible(
              true
            )
          }
        />
      </Animated.View>

      {/* CONTENT */}

      <Animated.ScrollView
        showsVerticalScrollIndicator={
          false
        }
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: 455,

          paddingBottom: 180,
        }}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: scrollY,
                },
              },
            },
          ],
          {
            useNativeDriver: false,
          }
        )}
      >
        <View style={styles.content}>
          <RivalsSection />

          <WorkoutPosts />
        </View>
      </Animated.ScrollView>

      <SettingsSheet
        visible={settingsVisible}
        onClose={() =>
          setSettingsVisible(
            false
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#050505',
  },

  headerWrap: {
    position: 'absolute',

    top: 0,

    left: 0,

    right: 0,

    zIndex: 20,
  },

  content: {
    paddingHorizontal: 18,
  },
});
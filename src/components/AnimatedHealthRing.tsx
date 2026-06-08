import React, {
  useEffect,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {
  Canvas,
  Path,
  Skia,
  SweepGradient,
  BlurMask,
} from '@shopify/react-native-skia';

import Animated, {
  useSharedValue,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';

type Props = {
  score: number;
};

export default function AnimatedHealthRing({
  score,
}: Props) {
  const size = 110;

  const strokeWidth = 10;

  const radius =
    (size - strokeWidth) / 2;

  const center = size / 2;

  const animatedProgress =
    useSharedValue(0);

  useEffect(() => {
    animatedProgress.value =
      withTiming(score / 100, {
        duration: 1800,
      });
  }, []);

  const path =
    Skia.Path.Make();

  path.addArc(
    {
      x: strokeWidth / 2,
      y: strokeWidth / 2,
      width:
        size - strokeWidth,
      height:
        size - strokeWidth,
    },
    -220,
    260
  );

  const animatedPath =
    useDerivedValue(() => {
      return path;
    });

  return (
    <View
      style={styles.container}
    >
      <Canvas
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Background Ring */}

        <Path
          path={path}
          style="stroke"
          strokeWidth={strokeWidth}
          color="#1f1f1f"
          strokeCap="round"
        />

        {/* Animated Ring */}

        <Path
          path={animatedPath}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          start={0}
          end={animatedProgress}
        >
          <SweepGradient
            c={{
              x: center,
              y: center,
            }}
            colors={[
              '#ff3b30',
              '#ff9500',
              '#22c55e',
            ]}
          />

          <BlurMask
            blur={4}
            style="solid"
          />
        </Path>
      </Canvas>

      {/* CENTER TEXT */}

      <View
        style={styles.center}
      >
        <Text
          style={styles.score}
        >
          {score}
        </Text>

        <Text
          style={styles.label}
        >
          Score
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },

  center: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  score: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },

  label: {
    color: '#777',
    fontSize: 11,
    marginTop: 2,
  },
});
import React, {
  useEffect,
  useRef,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

import Svg, {
  Circle,
} from 'react-native-svg';

const AnimatedCircle =
  Animated.createAnimatedComponent(
    Circle
  );

const SIZE = 120;

const STROKE_WIDTH = 10;

const RADIUS =
  (SIZE - STROKE_WIDTH) / 2;

const CIRCUMFERENCE =
  2 * Math.PI * RADIUS;

export default function AnimatedScoreRing({
  score = 84,
}: any) {
  const progress =
    useRef(
      new Animated.Value(0)
    ).current;

  const glow =
    useRef(
      new Animated.Value(0.7)
    ).current;

  const animatedScore =
    useRef(0);

  const [displayScore,
    setDisplayScore] =
    React.useState(0);

  useEffect(() => {
    Animated.timing(
      progress,
      {
        toValue: score,
        duration: 1800,
        easing:
          Easing.out(
            Easing.exp
          ),
        useNativeDriver: false,
      }
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(
          glow,
          {
            toValue: 1,
            duration: 1400,
            useNativeDriver: false,
          }
        ),

        Animated.timing(
          glow,
          {
            toValue: 0.7,
            duration: 1400,
            useNativeDriver: false,
          }
        ),
      ])
    ).start();

    const interval =
      setInterval(() => {
        if (
          animatedScore.current <
          score
        ) {
          animatedScore.current += 1;

          setDisplayScore(
            animatedScore.current
          );
        }
      }, 18);

    return () =>
      clearInterval(interval);
  }, []);

  const strokeDashoffset =
    progress.interpolate({
      inputRange: [0, 100],

      outputRange: [
        CIRCUMFERENCE,
        0,
      ],
    });

  return (
    <Animated.View
      style={[
        styles.container,

        {
          opacity: glow,

          transform: [
            {
              scale: glow.interpolate(
                {
                  inputRange: [
                    0.7,
                    1,
                  ],

                  outputRange: [
                    1,
                    1.04,
                  ],
                }
              ),
            },
          ],
        },
      ]}
    >
      <Svg
        width={SIZE}
        height={SIZE}
      >
        {/* BACKGROUND */}

        <Circle
          stroke="#1f1f1f"
          fill="none"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={
            STROKE_WIDTH
          }
        />

        {/* PROGRESS */}

        <AnimatedCircle
          stroke="#F7C873"
          fill="none"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={
            STROKE_WIDTH
          }
          strokeLinecap="round"
          strokeDasharray={
            CIRCUMFERENCE
          }
          strokeDashoffset={
            strokeDashoffset
          }
          rotation="-90"
          origin={`${SIZE / 2}, ${
            SIZE / 2
          }`}
        />
      </Svg>

      <View style={styles.center}>
        <Text style={styles.score}>
          {displayScore}
        </Text>

        <Text style={styles.label}>
          Score
        </Text>
      </View>
    </Animated.View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      width: SIZE,

      height: SIZE,

      justifyContent:
        'center',

      alignItems: 'center',
    },

    center: {
      position: 'absolute',

      justifyContent:
        'center',

      alignItems: 'center',
    },

    score: {
      color: '#fff',

      fontSize: 28,

      fontWeight: '900',
    },

    label: {
      color: '#777',

      marginTop: 4,

      fontSize: 12,
    },
  });
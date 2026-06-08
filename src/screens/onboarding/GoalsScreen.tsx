import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import {
  Flame,
  Dumbbell,
  Heart,
  Zap,
  Crown,
  ChevronRight,
} from 'lucide-react-native';

import {
  useOnboarding,
} from '../../context/OnboardingContext';

const goals = [
  {
    id: 'fat_loss',

    title: 'Lose Fat',

    description:
      'Burn stubborn fat, get leaner, and unlock a sharper physique.',

    icon: Flame,

    color: '#FF7B7B',
  },

  {
    id: 'muscle_gain',

    title: 'Build Muscle',

    description:
      'Gain strength, size, and create a stronger athletic body.',

    icon: Dumbbell,

    color: '#8B7CFF',
  },

  {
    id: 'fitness',

    title: 'Improve Fitness',

    description:
      'Boost stamina, endurance, mobility, and daily performance.',

    icon: Zap,

    color: '#73F7C8',
  },

  {
    id: 'healthy_lifestyle',

    title: 'Healthy Lifestyle',

    description:
      'Build sustainable habits and feel healthier every single day.',

    icon: Heart,

    color: '#FF8FA3',
  },
];

export default function GoalsScreen({
  navigation,
}: any) {
  const {
    onboardingData,
    setOnboardingData,
  } = useOnboarding();

  const handleSelect = (
    goal: string
  ) => {
    setOnboardingData({
      ...onboardingData,

      goals: [goal],
    });

    navigation.navigate(
      'PersonalInfo'
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View style={{flex:1}}>
        {/* TOP */}

        <View style={styles.hero}>
          <View
            style={styles.logoWrap}
          >
            <Crown
              size={20}
              color="#F7C873"
            />
          </View>

          <Text
            style={styles.title}
          >
            Define Your
            Transformation
          </Text>

          <Text
            style={styles.subtitle}
          >
            Your body adapts to
            the mission you give
            it. Choose the outcome
            you want to build.
          </Text>
        </View>

        {/* GOALS */}

        <View
          style={styles.cardsWrap}
        >
          {goals.map(
            (goal) => {
              const Icon =
                goal.icon;

              return (
                <TouchableOpacity
                  key={goal.id}
                  activeOpacity={
                    0.9
                  }
                  style={
                    styles.card
                  }
                  onPress={() =>
                    handleSelect(
                      goal.id
                    )
                  }
                >
                  {/* ICON */}

                  <View
                    style={[
                      styles.iconWrap,

                      {
                        backgroundColor:
                          `${goal.color}18`,
                      },
                    ]}
                  >
                    <Icon
                      size={20}
                      color={
                        goal.color
                      }
                    />
                  </View>

                  {/* CONTENT */}

                  <View
                    style={
                      styles.cardContent
                    }
                  >
                    <Text
                      style={
                        styles.cardTitle
                      }
                    >
                      {
                        goal.title
                      }
                    </Text>

                    <Text
                      style={
                        styles.cardDescription
                      }
                    >
                      {
                        goal.description
                      }
                    </Text>
                  </View>

                  {/* ARROW */}

                  <View
                    style={
                      styles.arrowWrap
                    }
                  >
                    <ChevronRight
                      size={16}
                      color="#9E9E9E"
                    />
                  </View>
                </TouchableOpacity>
              );
            }
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#0B1020',
    },

    hero: {
      alignItems: 'center',
      paddingHorizontal: 28,
      paddingTop: 24,
    },

    logoWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor:
        'rgba(247, 200, 115, 0.12)',
      justifyContent:
        'center',
      alignItems: 'center',
      marginBottom: 14,
      borderWidth: 1,
      borderColor:
        'rgba(247, 200, 115, 0.2)',
    },

    title: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '900',
      textAlign: 'center',
      lineHeight: 30,
    },

    subtitle: {
      color: '#9E9E9E',
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
      marginTop: 8,
    },

    cardsWrap: {
      marginTop: 16,
      paddingHorizontal: 20,
    },

    card: {
      backgroundColor:
        '#131929',
      borderRadius: 20,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor:
        'rgba(255, 255, 255, 0.05)',
    },

    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent:
        'center',
      alignItems: 'center',
      marginRight: 12,
    },

    cardContent: {
      flex: 1,
      paddingRight: 10,
    },

    cardTitle: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 4,
    },

    cardDescription: {
      color: '#9E9E9E',
      fontSize: 12,
      lineHeight: 18,
    },

    arrowWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        'rgba(255, 255, 255, 0.05)',
      justifyContent:
        'center',
      alignItems: 'center',
    },
  });
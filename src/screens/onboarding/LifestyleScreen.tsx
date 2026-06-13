import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import {
  ChevronLeft,
  Moon,
  Dumbbell,
  Briefcase,
  Activity,
} from 'lucide-react-native';

import {
  useOnboarding,
} from '../../context/OnboardingContext';

export default function LifestyleScreen({
  navigation,
}: any) {
  const {
    onboardingData,
    setOnboardingData,
  } = useOnboarding();

  const [
    activityLevel,
    setActivityLevel,
  ] = useState(
    onboardingData.activityLevel ||
      ''
  );

  const [
    sleepHours,
    setSleepHours,
  ] = useState(
    onboardingData.sleepHours ||
      ''
  );

  const [
    trainingExperience,
    setTrainingExperience,
  ] = useState(
    onboardingData.trainingExperience ||
      ''
  );

  const [
    workStyle,
    setWorkStyle,
  ] = useState(
    onboardingData.workStyle ||
      ''
  );

  const activityOptions = [
    'Sedentary',
    'Moderate',
    'Active',
    'Athletic'
  ];

  const sleepOptions = [
    'Under 5h',

    '6h',

    '7-8h',

    '8h+',
  ];

  const trainingOptions = [
    'Beginner',

    'Intermediate',

    'Advanced',
  ];

  const workOptions = [
    'Desk Job',

    'Mixed Movement',

    'Physical Work',
  ];

  const handleContinue =
    () => {
      setOnboardingData({
        ...onboardingData,

        activityLevel,

        sleepHours,

        trainingExperience,

        workStyle,
      });

      navigation.navigate(
        'Medical'
      );
    };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 16,
        }}
      >
        {/* TOP */}

        <View style={styles.topBar}>
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <ChevronLeft
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text
            style={styles.topTitle}
          >
            Your Lifestyle
          </Text>

          <View
            style={{ width: 40 }}
          />
        </View>

        <Text
          style={styles.subtitle}
        >
          This helps Neo create missions that fit your life.
        </Text>

        {/* ACTIVITY */}

        <View style={styles.card}>
          <View
            style={styles.sectionTop}
          >
            <Activity
              size={18}
              color="#F7C873"
            />

            <Text
              style={styles.sectionTitle}
            >
              Activity Level
            </Text>
          </View>
          <View style={styles.row}>
            {activityOptions.map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.pill,
                    activityLevel ===
                      item &&
                      styles.activePill,
                  ]}
                  onPress={() =>
                    setActivityLevel(
                      item
                    )
                  }
                >
                  <Text
                    style={[
                      styles.pillText,
                      activityLevel ===
                        item &&
                        styles.activePillText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* SLEEP */}

        <View style={styles.card}>
          <View
            style={styles.sectionTop}
          >
            <Moon
              size={18}
              color="#B1A2FF"
            />

            <Text
              style={styles.sectionTitle}
            >
              Sleep
            </Text>
          </View>

          <View style={styles.row}>
            {sleepOptions.map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.pill,

                    sleepHours ===
                      item &&
                      styles.activePill,
                  ]}
                  onPress={() =>
                    setSleepHours(
                      item
                    )
                  }
                >
                  <Text
                    style={[
                      styles.pillText,

                      sleepHours ===
                        item &&
                        styles.activePillText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* EXPERIENCE */}

        <View style={styles.card}>
          <View
            style={styles.sectionTop}
          >
            <Dumbbell
              size={18}
              color="#8B7CFF"
            />

            <Text
              style={styles.sectionTitle}
            >
              Training Experience
            </Text>
          </View>

          <View style={styles.row}>
            {trainingOptions.map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.pill,

                    trainingExperience ===
                      item &&
                      styles.activePill,
                  ]}
                  onPress={() =>
                    setTrainingExperience(
                      item
                    )
                  }
                >
                  <Text
                    style={[
                      styles.pillText,

                      trainingExperience ===
                        item &&
                        styles.activePillText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* WORK */}

        <View style={styles.card}>
          <View
            style={styles.sectionTop}
          >
            <Briefcase
              size={18}
              color="#73F7C8"
            />

            <Text
              style={styles.sectionTitle}
            >
              Daily Routine
            </Text>
          </View>

          <View style={styles.row}>
            {workOptions.map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.pill,

                    workStyle ===
                      item &&
                      styles.activePill,
                  ]}
                  onPress={() =>
                    setWorkStyle(
                      item
                    )
                  }
                >
                  <Text
                    style={[
                      styles.pillText,

                      workStyle ===
                        item &&
                        styles.activePillText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* BUTTON */}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={
            handleContinue
          }
        >
          <Text
            style={styles.nextText}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
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

    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 16,
      marginTop: 8,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        'rgba(255, 255, 255, 0.05)',
      justifyContent:
        'center',
      alignItems: 'center',
    },

    topTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '900',
    },

    subtitle: {
      color: '#9E9E9E',
      lineHeight: 22,
      marginTop: 4,
      marginBottom: 8,
      paddingHorizontal: 28,
      textAlign: 'center',
      fontSize: 12,
    },

    card: {
      marginHorizontal: 20,
      marginBottom: 8,
      borderRadius: 16,
      padding: 10,
      backgroundColor:
        '#131929',
    },

    sectionTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },

    sectionTitle: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 12,
      marginLeft: 10,
    },

    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    pill: {
      backgroundColor:
        '#1A2235',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 7,
      marginRight: 6,
      marginBottom: 6,
    },

    activePill: {
      backgroundColor:
        '#8B7CFF',
    },

    pillText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 12,
    },

    activePillText: {
      color: '#F7F8FC',
    },

    nextButton: {
      height: 46,
      borderRadius: 16,
      backgroundColor:
        '#8B7CFF',
      justifyContent:
        'center',
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 8,
    },

    nextText: {
      color: '#F7F8FC',
      fontSize: 15,
      fontWeight: '900',
    },
  });
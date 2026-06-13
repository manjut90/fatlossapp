import React, {
  useMemo,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {
  ChevronLeft,
  User,
  VenusAndMars,
  Ruler,
  Weight,
  Sparkles,
  Star,
  Trophy,
  Dumbbell,
} from 'lucide-react-native';

import {
  useOnboarding,
} from '../../context/OnboardingContext';

export default function PersonalInfoScreen({
  navigation,
}: any) {
  const {
    onboardingData,
    setOnboardingData,
  } = useOnboarding();

  const [name, setName] =
    useState(
      onboardingData.name || ''
    );

  const [sex, setSex] =
    useState(
      onboardingData.sex || ''
    );

  const [height, setHeight] =
    useState(
      onboardingData.height || ''
    );

  const [
    currentWeight,
    setCurrentWeight,
  ] = useState(
    onboardingData.currentWeight ||
      ''
  );

  const [
    targetWeight,
    setTargetWeight,
  ] = useState(
    onboardingData.targetWeight ||
      ''
  );

  /* ANIMATION */

  const glowAnim =
    useRef(
      new Animated.Value(0.4)
    ).current;

  const starAnim =
    useRef(
      new Animated.Value(0)
    ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(
          glowAnim,
          {
            toValue: 0.65,
            duration: 1800,
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          glowAnim,
          {
            toValue: 0.4,
            duration: 1800,
            useNativeDriver: true,
          }
        ),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(
          starAnim,
          {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          starAnim,
          {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }
        ),
      ])
    ).start();
  }, []);

  /* CALCULATIONS */

  const idealWeight =
    useMemo(() => {
      const h =
        Number(height);

      if (!h) return 0;

      return Math.max(
        48,
        h - 100
      );
    }, [height]);

  const current =
    Number(currentWeight);

  const hasMetrics =
    height.length > 0 &&
    currentWeight.length > 0;

  const bmi =
    hasMetrics
      ? (
          current /
          Math.pow(
            Number(height) / 100,
            2
          )
        ).toFixed(1)
      : null;

  const difference =
    hasMetrics
      ? current - idealWeight
      : 0;

  /* BODY FAT */
  let currentBodyFat = '--';
  if (bmi) {
    const bmiValue = Number(bmi);
    const age = 25; // Default age
    let bodyFat;
    if (sex === 'Female') {
      bodyFat = (1.20 * bmiValue) + (0.23 * age) - 5.4;
    } else { // Male or other
      bodyFat = (1.20 * bmiValue) + (0.23 * age) - 16.2;
    }
    currentBodyFat = `${Math.max(5, Math.min(bodyFat, 45)).toFixed(0)}%`;
  }
  const primeBodyFat = sex === 'Female' ? '20%' : '14%';

  /* RECOVERY */
  let recoveryScore = '--';
  if (bmi) {
    const bmiValue = Number(bmi);
    recoveryScore = bmiValue < 18.5 ? 65
      : bmiValue < 22 ? 92
      : bmiValue < 25 ? 85
      : bmiValue < 30 ? 68
      : bmiValue < 35 ? 50
      : 35;
  }

  /* FITNESS */
  let currentTier = 'Starting';
  if (bmi) {
    const bmiValue = Number(bmi);
    if (bmiValue < 18.5) currentTier = 'Underweight';
    else if (bmiValue < 22) currentTier = 'Athletic';
    else if (bmiValue < 25) currentTier = 'Fit';
    else if (bmiValue < 30) currentTier = 'Active';
    else if (bmiValue < 35) currentTier = 'Building';
  }

  /* MESSAGE */
  let aiMessage = 'Enter your metrics to unlock your transformation insights.';
  let aiColor = '#8a8a8a';
  let closeToIdeal = false;
  if (hasMetrics) {
    if (difference <= 0) {
      aiMessage = "You're at or below ideal weight. Focus on body composition and strength.";
      aiColor = '#22C55E';
      closeToIdeal = true;
    } else if (difference <= 5) {
      aiMessage = `Just ${difference}kg from your ideal. A 8-week cut will get you there.`;
      aiColor = '#F7C873';
    } else if (difference <= 15) {
      aiMessage = `${difference}kg above ideal. Sustainable 0.5kg/week loss = ${Math.ceil(difference / 0.5)} weeks to goal.`;
      aiColor = '#ff9f43';
    } else {
      aiMessage = `${difference}kg journey ahead. Break it into 3-month phases. Your first milestone: ${Math.round(difference / 3)}kg down.`;
      aiColor = '#ff9f43';
    }
  }

  const sexOptions = [
    'Male',
    'Female',
    'LGBTQ+',
  ];

  /* CONTINUE */

  const handleContinue =
    () => {
      setOnboardingData({
        ...onboardingData,

        name,

        sex,

        height,

        currentWeight,

        targetWeight,
      });

      navigation.navigate(
        'Lifestyle'
      );
    };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
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
                color="#fff"
              />
            </TouchableOpacity>

            <Text
              style={
                styles.topTitle
              }
            >
              Build Your Profile
            </Text>

            <View
              style={{
                width: 40,
              }}
            />
          </View>

          <Text
            style={styles.subtitle}
          >
            Neo will use this to create your missions.
          </Text>

          {/* NAME */}

          <View style={styles.card}>
            <View
              style={
                styles.labelRow
              }
            >
              <User
                size={16}
                color="#8B7CFF"
              />

              <Text
                style={
                  styles.label
                }
              >
                Your Name
              </Text>
            </View>

            <TextInput
              value={name}
              onChangeText={
                setName
              }
              placeholder="Enter your name"
              placeholderTextColor="#666"
              style={styles.input}
            />
          </View>

          {/* SEX */}

          <View style={styles.card}>
            <View
              style={
                styles.labelRow
              }
            >
              <VenusAndMars
                size={16}
                color="#9f7aea"
              />

              <Text
                style={
                  styles.label
                }
              >
                Sex
              </Text>
            </View>

            <View style={styles.row}>
              {sexOptions.map(
                (item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.option,

                      sex === item &&
                        styles.optionActive,
                    ]}
                    onPress={() =>
                      setSex(item)
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,

                        sex === item &&
                          styles.optionTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* HEIGHT + WEIGHT */}

          <View
            style={styles.doubleRow}
          >
            <View
              style={[
                styles.metricCard,
                {
                  marginRight: 6,
                },
              ]}
            >
              <View
                style={
                  styles.labelRow
                }
              >
                <Ruler
                  size={15}
                  color="#3aa6ff"
                />

                <Text
                  style={
                    styles.label
                  }
                >
                  Height
                </Text>
              </View>

              <TextInput
                value={height}
                onChangeText={
                  setHeight
                }
                placeholder="cm"
                placeholderTextColor="#666"
                keyboardType="numeric"
                style={
                  styles.metricInput
                }
              />
            </View>

            <View
              style={[
                styles.metricCard,
                {
                  marginLeft: 6,
                },
              ]}
            >
              <View
                style={
                  styles.labelRow
                }
              >
                <Weight
                  size={15}
                  color="#00d26a"
                />

                <Text
                  style={
                    styles.label
                  }
                >
                  Weight
                </Text>
              </View>

              <TextInput
                value={
                  currentWeight
                }
                onChangeText={
                  setCurrentWeight
                }
                placeholder="kg"
                placeholderTextColor="#666"
                keyboardType="numeric"
                style={
                  styles.metricInput
                }
              />
            </View>
          </View>

          {/* HERO */}

          <Animated.View
            style={[
              styles.heroCard,

              {
                shadowOpacity:
                  glowAnim,
              },
            ]}
          >
            {closeToIdeal && (
              <>
                <Animated.View
                  style={[
                    styles.star1,
                    {
                      opacity:
                        starAnim,
                    },
                  ]}
                >
                  <Star
                    size={12}
                    color="#ffd700"
                    fill="#ffd700"
                  />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.star2,
                    {
                      opacity:
                        starAnim,
                    },
                  ]}
                >
                  <Star
                    size={8}
                    color="#fff"
                    fill="#fff"
                  />
                </Animated.View>
              </>
            )}

            <View
              style={
                styles.heroHeader
              }
            >
              <View
                style={
                  styles.heroTitleWrap
                }
              >
                <Sparkles
                  size={16}
                  color="#8B7CFF"
                />

                <Text
                  style={
                    styles.heroLabel
                  }
                >
                  YOUR BASELINE
                </Text>
              </View>

              <View
                style={
                  styles.bodyIcon
                }
              >
                <Dumbbell
                  size={20}
                  color="#8B7CFF"
                />
              </View>
            </View>

            {hasMetrics && (
              <View
                style={
                  styles.compareWrap
                }
              >
                <View
                  style={
                    styles.compareHeader
                  }
                >
                  <Text
                    style={
                      styles.compareLeft
                    }
                  >
                    NOW
                  </Text>

                  <Text
                    style={
                      styles.compareRight
                    }
                  >
                    PRIME
                  </Text>
                </View>

                {[
                  [
                    'Weight',
                    `${current}kg`,
                    `${idealWeight}kg`,
                  ],

                  [
                    'Body Fat',
                    currentBodyFat,
                    primeBodyFat,
                  ],

                  [
                    'Recovery',
                    `${recoveryScore}/100`,
                    `90+/100`,
                  ],

                  [
                    'Fitness',
                    currentTier,
                    'Athletic',
                  ],
                ].map(
                  (
                    [
                      label,
                      now,
                      prime,
                    ],
                    index
                  ) => (
                    <View
                      key={index}
                      style={
                        styles.compareRow
                      }
                    >
                      <Text
                        style={
                          styles.compareLabel
                        }
                      >
                        {label}
                      </Text>

                      <Text
                        style={
                          styles.compareNow
                        }
                      >
                        {now}
                      </Text>

                      <Text
                        style={
                          styles.comparePrime
                        }
                      >
                        {prime}
                      </Text>
                    </View>
                  )
                )}
              </View>
            )}

            <Animated.Text
              style={[
                styles.aiMessage,

                {
                  color: aiColor,

                  opacity:
                    glowAnim,
                },
              ]}
            >
              {aiMessage}
            </Animated.Text>

            {hasMetrics && (
              <Text
                style={
                  styles.disclaimer
                }
              >
                Estimated using
                modern body
                composition models.
              </Text>
            )}
          </Animated.View>

          {/* GOAL */}

          <View style={styles.card}>
            <View
              style={
                styles.labelRow
              }
            >
              <Trophy
                size={16}
                color="#8B7CFF"
              />

              <Text
                style={
                  styles.label
                }
              >
                Goal Weight
              </Text>
            </View>

            <TextInput
              value={targetWeight}
              onChangeText={
                setTargetWeight
              }
              placeholder="Optional goal weight"
              placeholderTextColor="#666"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          {/* BUTTON */}

          <TouchableOpacity
            style={
              styles.nextButton
            }
            activeOpacity={0.9}
            onPress={
              handleContinue
            }
          >
            <Text
              style={
                styles.nextText
              }
            >
              Continue
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
      paddingHorizontal: 20,
      paddingTop: 12,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        'rgba(255,255,255,0.05)',
      justifyContent:
        'center',
      alignItems: 'center',
    },

    topTitle: {
      color: '#fff',
      fontSize: 24,
      fontWeight: '900',
    },

    subtitle: {
      color: '#8a8a8a',
      lineHeight: 20,
      marginTop: 8,
      marginBottom: 8,
      paddingHorizontal: 28,
      textAlign: 'center',
      fontSize: 12,
    },

    card: {
      marginHorizontal: 20,
      marginBottom: 10,
      borderRadius: 22,
      padding: 12,
      backgroundColor:
        '#131929',
    },

    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },

    label: {
      color: '#fff',
      marginLeft: 8,
      fontWeight: '700',
      fontSize: 14,
    },

    input: {
      height: 44,
      borderRadius: 14,
      backgroundColor:
        '#1A2235',
      paddingHorizontal: 16,
      color: '#fff',
      fontSize: 15,
    },

    row: {
      flexDirection: 'row',
    },

    option: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor:
        '#1A2235',
      marginRight: 8,
    },

    optionActive: {
      backgroundColor:
        '#8B7CFF',
    },

    optionText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 13,
    },

    optionTextActive: {
      color: '#F7F8FC',
    },

    doubleRow: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginBottom: 10,
    },

    metricCard: {
      flex: 1,
      borderRadius: 22,
      padding: 12,
      backgroundColor:
        '#131929',
    },

    metricInput: {
      height: 44,
      borderRadius: 12,
      backgroundColor:
        '#1A2235',
      color: '#fff',
      paddingHorizontal: 12,
      fontSize: 16,
      fontWeight: '900',
    },

    heroCard: {
      marginHorizontal: 20,
      marginBottom: 10,
      borderRadius: 28,
      padding: 12,
      backgroundColor:
        'rgba(139,124,255,0.08)',
      borderWidth: 1,
      borderColor:
        'rgba(139,124,255,0.2)',
      shadowColor:
        '#8B7CFF',
      shadowRadius: 14,
      elevation: 5,
      overflow: 'hidden',
    },

    heroHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },

    heroTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    bodyIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        'rgba(255,255,255,0.05)',
      justifyContent:
        'center',
      alignItems: 'center',
    },

    heroLabel: {
      color: '#F7C873',
      marginLeft: 8,
      fontWeight: '800',
      fontSize: 14,
    },

    compareWrap: {
      marginTop: 6,
    },

    compareHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      marginBottom: 8,
      paddingHorizontal: 6,
    },

    compareLeft: {
      color: '#8a8a8a',
      fontWeight: '800',
      width: 90,
    },

    compareRight: {
      color: '#F7C873',
      fontWeight: '800',
      paddingRight: 6,
    },

    compareRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      backgroundColor:
        'rgba(255,255,255,0.04)',
      borderRadius: 14,
      padding: 10,
    },

    compareLabel: {
      color: '#8a8a8a',
      width: 90,
      fontSize: 10,
    },

    compareNow: {
      color: '#fff',
      flex: 1,
      fontWeight: '800',
      fontSize: 16,
    },

    comparePrime: {
      color: '#22C55E',
      fontWeight: '900',
      fontSize: 16,
      paddingRight: 6,
    },

    aiMessage: {
      marginTop: 8,
      lineHeight: 22,
      fontWeight: '700',
      fontSize: 13,
      textAlign: 'center',
    },

    disclaimer: {
      marginTop: 8,
      color: '#666',
      fontSize: 11,
      lineHeight: 16,
      textAlign: 'center',
    },

    nextButton: {
      height: 56,
      borderRadius: 22,
      backgroundColor:
        '#8B7CFF',
      justifyContent:
        'center',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 2,
      marginBottom: 30,
    },

    nextText: {
      color: '#F7F8FC',
      fontSize: 15,
      fontWeight: '900',
    },

    star1: {
      position: 'absolute',
      top: 18,
      left: 18,
    },

    star2: {
      position: 'absolute',
      top: 56,
      right: 76,
    },
  });
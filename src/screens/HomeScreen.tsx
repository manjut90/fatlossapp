// HomeScreen.tsx

import { MissionCard } from '../components/MissionCard';
import { useHealth } from '../context/HealthContext';
import { getWeatherTemp } from '../services/weather';
import { getLevelFromXP } from '../constants/levels';
import {
  getUserTargets,
} from '../utils/healthCalculations';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Share,
} from 'react-native';

import RefreshableScrollView from '../components/RefreshableScrollView';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

import {
  Flame,
  Droplets,
  Footprints,
  MoonStar,
  Bed,
  Leaf,
  Sparkles,
  CloudRain,
  Share2,
  Dumbbell,
  Utensils,
  TrendingUp,
  AlertTriangle,
  Zap,
} from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { LevelUpModal } from '../components/LevelUpModal';
import { updateLastCelebratedLevel } from '../services/progress';
import { AchievementUnlockedModal } from '../components/AchievementUnlockedModal';
import { useGamificationStore } from './gamification/store/useGamificationStore';

// ── Strip markdown formatting from AI responses ──
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold**
    .replace(/\*(.+?)\*/g, '$1')       // *italic*
    .replace(/__(.+?)__/g, '$1')       // __bold__
    .replace(/_(.+?)_/g, '$1')         // _italic_
    .replace(/~~(.+?)~~/g, '$1')       // ~~strikethrough~~
    .replace(/`(.+?)`/g, '$1')         // `code`
    .replace(/^#+\s+/gm, '')           // # headings
    .replace(/^[-*]\s+/gm, '• ')       // bullet lists
    .replace(/^\d+\.\s+/gm, '')        // numbered lists
    .trim();
}

// ── PROGRESS RING component ──
function ProgressRing({
  progress,
  color,
  size = 68,
  strokeWidth = 4,
  children,
  completed,
}: any) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background track */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ECECEC"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={completed ? color : color + '99'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
    const [firstName, setFirstName] = useState('');
  const [greeting, setGreeting] = useState('Hey');
  const {
    pendingAchievement,
    clearPendingAchievement,
  } = useGamificationStore();



  const { profile, refreshProfile } = useAuth();

  const handleRefresh = async () => {
    await refreshHealthData?.();
  };
  const targets = getUserTargets(profile);
  const currentWeight = parseFloat(profile?.current_weight || profile?.weight || '0') || 70;
  const userGoal = profile?.goal || profile?.goals?.[0] || 'fat_loss';
  const {
    healthData,
    refreshHealthData,
    pendingLevelUp,
    clearPendingLevelUp,
  } = useHealth();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning,');
    } else if (hour < 18) {
      setGreeting('Good afternoon,');
    } else {
      setGreeting('Good evening,');
    }
  }, []);

  useEffect(() => {
    const rawName = profile?.full_name || profile?.username || '';
    if (rawName) {
      const name = rawName.split(' ')[0];
      setFirstName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [profile?.full_name, profile?.username]);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const fetchAiSummary = async () => {
      setSummaryLoading(true);
      try {
        const prompt = `You are Neo, a world-class fitness and nutrition expert. The user's stats today: calories=${healthData.todayCalories}, protein=${healthData.todayProtein}g, water=${healthData.todayWater}ml, sleep=${healthData.todaySleep}h, workout=${healthData.todayWorkout}, goal=${userGoal}, current weight=${currentWeight}kg, target weight=${targetWeight}kg. Give ONE powerful, specific, data-driven insight in max 20 words. Be direct, specific to their numbers, no fluff. Do NOT use any markdown formatting — no bold, no italics, no asterisks, no bullet points. Plain text only.`;

        const { data, error } = await supabase.functions.invoke('coach-chat', {
          body: {
            messages: [{ role: 'user', content: prompt }],
            system: "You are Neo, a world-class fitness and nutrition expert.",
            max_tokens: 100,
          }
        });
        if (error || !data) {
          throw error || new Error('Failed to get summary from coach-chat');
        }
        const summary = stripMarkdown(data?.content?.[0]?.text?.trim() || '') || getPrimeStateSummary();
        setAiSummary(summary);

      } catch (error) {
        console.error('Failed to fetch AI summary:', error);
        setAiSummary(getPrimeStateSummary()); // Fallback on error
      } finally {
        setSummaryLoading(false);
      }
    };

    if (healthData.todayCalories > 0 || healthData.todayWorkout) {
      fetchAiSummary();
    } else {
      setAiSummary(getPrimeStateSummary());
    }
  }, [healthData]);


  useFocusEffect(
    useCallback(() => {
      refreshHealthData();
    }, [refreshHealthData])
  );

  const handleViewAllPress = () => navigation.navigate('CheckIn');
  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `I'm at ${dailyScore}% daily score on my transformation journey 🔥`,
      });
    } catch {}
  };
  const handleImprovePress = () => navigation.navigate('CheckIn');

  const dailyScore = healthData?.dailyScore || 0;
  
  const targetWeight = targets.targetWeight;
  const caloriesGoal = targets.calories;
  const proteinGoal = targets.protein;
  const carbsGoal = targets.carbs;
  const fatsGoal = targets.fats;
  const waterGoal = targets.watermL;
  const sleepGoal = targets.sleep;
  const fiberGoal = targets.fiber;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const livePulse = useRef(new Animated.Value(0)).current;
  const checkInGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(livePulse, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(checkInGlow, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(checkInGlow, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    getWeatherTemp().then(setTemperature);
  }, []);

  const liveOpacity = livePulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });



  // ── CHECK-IN items with ring progress ──
  const checkInItems = [
    {
      type: 'food',
      label: 'Food',
      icon: <Utensils size={18} color="#FF8C42" />,
      ringColor: '#FF8C42',
      dotColor: '#FF8C42',
      bubbleColor: '#FFF0DD',
      completed: healthData.todayCalories > 0,
      progress: Math.min(100, (healthData.todayCalories / caloriesGoal) * 100),
    },
    {
      type: 'water',
      label: 'Water',
      icon: <Droplets size={18} color="#4AA9FF" />,
      ringColor: '#4AA9FF',
      dotColor: '#4AA9FF',
      bubbleColor: '#E8F5FF',
      completed: healthData.todayWater >= waterGoal * 0.8,
      progress: Math.min(100, (healthData.todayWater / waterGoal) * 100),
    },
    {
      type: 'workout',
      label: 'Workout',
      icon: <Dumbbell size={18} color="#8B7CFF" />,
      ringColor: '#8B7CFF',
      dotColor: '#8B7CFF',
      bubbleColor: '#EAE6FF',
      completed: !!healthData.todayWorkout,
      progress: healthData.todayWorkout ? 100 : 0,
    },
    {
      type: 'sleep',
      label: 'Sleep',
      icon: <MoonStar size={18} color="#FFAD42" />,
      ringColor: '#FFAD42',
      dotColor: '#FFAD42',
      bubbleColor: '#FFF8EC',
      completed: healthData.todaySleep >= 7,
      progress: Math.min(100, (healthData.todaySleep / sleepGoal) * 100),
    },
  ];

  const completedCheckinsCount = checkInItems.filter(item => item.completed).length;

  // ── PRIME STATE — personal health summary ──
  const getPrimeStateTitle = () => {
    const wins = [];
    if (healthData.todayWorkout) wins.push(1);
    if (healthData.todayWater / waterGoal >= 0.8) wins.push(1);
    if (healthData.todaySleep >= 7) wins.push(1);
    if (healthData.todayCalories > 0) wins.push(1);

    if (wins.length >= 4) return 'Peak Momentum';
    if (wins.length >= 2) return 'Building Rhythm';
    if (wins.length > 0) return 'On Track';
    return 'Starting Strong';
  };

  const getPrimeStateSummary = () => {
    const { todayProtein, todayWater, todayWorkout, todaySleep, streak } = healthData;
    const waterGoal = targets.watermL;
    const proteinGoal = targets.protein;

    if (streak >= 3) {
      if (todayWater < waterGoal * 0.5) {
        return `Streak is at ${streak} days. Hydration is currently the biggest risk at ${Math.round((todayWater / waterGoal) * 100)}%.`;
      }
      if (todaySleep > 0 && todaySleep < 6.5) {
        return `Consistency is high with a ${streak}d streak. Recovery is the current bottleneck at ${todaySleep}h sleep.`;
      }
      return `Consistency is improving with a ${streak}-day streak. Keep pushing your daily score targets.`;
    }

    if (todayWorkout && todayWater < waterGoal * 0.7) {
      return "Workout is complete. Hydration is now the primary priority to support recovery.";
    }
    if (todayProtein > 0 && todayProtein < proteinGoal * 0.5) {
      return `Logged protein is currently at ${Math.round(todayProtein)}g. Hydration and protein targets remain the biggest focus.`;
    }
    if (todaySleep > 0 && todaySleep < 6) {
      return `Recovery is the limiting factor with only ${todaySleep}h sleep. Prioritize rest tonight.`;
    }
    return "Nothing to analyze yet. Complete one check-in and I'll start coaching.";
  };

  const getDailyScoreStatus = (score: number) => {
    if (score <= 10) return 'Start your first check-in';
    if (score <= 30) return 'Momentum is building';
    if (score <= 60) return 'Strong progress today';
    if (score <= 80) return 'Excellent consistency';
    return 'Elite execution';
  };

  // XP progress toward next level (1000 XP per level)
  const levelInfo = getLevelFromXP(healthData.totalXp || 0);

  const xpInCurrentLevel =
    (healthData.totalXp || 0) - levelInfo.currentLevelXp;

  const xpNeededForLevel =
    levelInfo.nextLevelXp !== null
      ? levelInfo.nextLevelXp - levelInfo.currentLevelXp
      : 0;

  const xpRemaining =
    levelInfo.nextLevelXp !== null
      ? levelInfo.nextLevelXp - (healthData.totalXp || 0)
      : 0;

  const xpProgress = levelInfo.progressPercent;

  // ── OPTIMIZE TODAY — only shows when off track ──
  const getOptimizeItems = () => {
    const items = [];
    const caloriesRemaining = caloriesGoal - healthData.todayCalories;
    const proteinRemaining = proteinGoal - healthData.todayProtein;
    const waterRemaining = waterGoal - healthData.todayWater;

    if (caloriesRemaining > caloriesGoal * 0.4) {
      items.push('Log your next meal to fuel your progress');
    }
    if (proteinRemaining > 30) {
      items.push('Add a protein source like eggs or chicken to your next meal');
    }
    if (waterRemaining > waterGoal * 0.5) {
      items.push('A glass of water right now is a great idea');
    }
    if (!healthData.todayWorkout) {
      items.push('Even a 20-min walk is a win for today');
    }
    return items;
  };

  const optimizeItems = getOptimizeItems();
  const isOffTrack = optimizeItems.length > 0;

  // ── MACROS STATUS labels ──
  const getMacroStatus = (value: number, target: number) => {
    const pct = value / target;
    if (pct < 0.3) return 'Low';
    if (pct > 1.1) return 'Over';
    if (pct >= 1) return 'Hit ✓';
    return 'On track';
  };

  // ── NEO COMMAND CENTER DECISION ENGINE ──
  const neoPriority = useMemo(() => {
    const { todayProtein, todayWater, todayWorkout, todayCalories } = healthData;
    const waterGoal = targets.watermL;
    const proteinGoal = targets.protein;

    // 1. Hydration
    if (todayWater === 0) {
      return {
        priority: `Drink 750ml water before noon.`,
        reason: `Hydration score is currently 0%.`,
        impact: `Improves recovery and energy.`
      };
    } else if (todayWater < waterGoal) {
      const remainingWater = Math.max(250, Math.round((waterGoal - todayWater) / 250) * 250);
      return {
        priority: `Drink ${remainingWater}ml water.`,
        reason: `Hydration score is currently ${Math.round((todayWater / waterGoal) * 100)}%.`,
        impact: `Improves metabolic rate and cellular recovery.`
      };
    }
    // 2. Workout
    if (!todayWorkout) {
      return {
        priority: `Log a 20-minute workout.`,
        reason: `No physical activity is tracked yet for today.`,
        impact: `Elevates metabolic rate for up to 14 hours.`
      };
    }
    // 3. Protein
    if (todayProtein === 0) {
      return {
        priority: `Log breakfast.`,
        reason: `Protein target has not started.`,
        impact: `Stay on track for ${Math.round(proteinGoal)}g protein.`
      };
    } else if (todayProtein < proteinGoal * 0.5) {
      return {
        priority: `Log a high-protein source.`,
        reason: `Protein is currently at ${Math.round((todayProtein / proteinGoal) * 100)}%.`,
        impact: `Preserves lean muscle and maintains fullness.`
      };
    }
    // 4. Calories / General food
    if (todayCalories === 0) {
      return {
        priority: `Log breakfast or next meal.`,
        reason: `Nutrient intake tracking has not started.`,
        impact: `Maintains calorie tracking goals.`
      };
    }
    // 5. Daily Completion
    return {
      priority: `Maintain streak consistency.`,
      reason: `All core metrics checked in today.`,
      impact: `Unlocks next XP progression level.`
    };
  }, [healthData, targets]);

  return (
    <View style={styles.container}>
      <AchievementUnlockedModal
        visible={!!pendingAchievement}
        name={pendingAchievement?.name || ''}
        description={pendingAchievement?.description || ''}
        onClose={clearPendingAchievement}
      />
      <LinearGradient
        colors={['#0B1020', '#0B1020', '#0B1020']}
        style={StyleSheet.absoluteFillObject}
      />

      <RefreshableScrollView
        onRefresh={handleRefresh}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ══════════════════════════════
              HEADER
          ══════════════════════════════ */}
          <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 8 }]}>
            <View style={styles.headerContent}>
              {/* Left side: Avatar + Greeting */}
              <View style={styles.headerLeft}>
                <View style={styles.avatar}>
                  <Image
                    source={require('../assets/neo_logo.png')}
                    style={{ width: 44, height: 44, resizeMode: 'contain' }}
                  />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={styles.greeting}>{greeting} </Text>
                    <Text style={styles.friendText}>{firstName || 'there'}</Text>
                  </View>
                  <Text style={styles.subtitle}>
                    <Text style={{ color: '#F7C873', fontWeight: '900', fontSize: 11, letterSpacing: 1.5 }}>EARN. </Text>
                    <Text style={{ color: '#8B7CFF', fontWeight: '900', fontSize: 11, letterSpacing: 1.5 }}>RISE. </Text>
                    <Text style={{ color: '#FF8FA3', fontWeight: '900', fontSize: 11, letterSpacing: 1.5 }}>ASCEND.</Text>
                  </Text>
                </View>
              </View>
              <View style={{ width: 28 }} />
            </View>
          </View>

          {/* ══════════════════════════════
              SECTION 1: DAILY SCORE (NEW HERO BLOCK)
          ══════════════════════════════ */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreLabel}>TODAY'S SCORE</Text>
              <Text style={styles.scoreValueText}>{dailyScore} / 100</Text>
              <Text style={styles.scoreStatus}>{getDailyScoreStatus(dailyScore)}</Text>
            </View>
            <View style={styles.scoreCircleContainer}>
              <ProgressRing
                progress={dailyScore}
                color="#8B7CFF"
                size={64}
                strokeWidth={6}
                completed={dailyScore >= 80}
              >
                {dailyScore === 0 && <Zap size={20} color="#8B7CFF" />}
              </ProgressRing>
            </View>
          </View>

          {/* ══════════════════════════════
              SECTION 2: NEO COMMAND CENTER
          ══════════════════════════════ */}
          <View style={styles.commandCard}>
            <View style={styles.commandHeader}>
              <Sparkles size={12} color="#8B7CFF" />
              <Text style={styles.commandHeaderText}>NEO COMMAND CENTER</Text>
            </View>
            <Text style={styles.commandPriorityText}>{neoPriority.priority}</Text>
            <View style={styles.commandLine}>
              <Text style={styles.commandLineLabel}>Reason:</Text>
              <Text style={styles.commandLineValue}>{neoPriority.reason}</Text>
            </View>
            <View style={styles.commandLine}>
              <Text style={styles.commandLineLabel}>Impact:</Text>
              <Text style={styles.commandLineImpact}>{neoPriority.impact}</Text>
            </View>
          </View>

          {/* ══════════════════════════════
              SECTION 3: TODAY'S MISSIONS
          ══════════════════════════════ */}
          <MissionCard />

          {/* ══════════════════════════════
              SECTION 4: TODAY'S CHECK-INS
          ══════════════════════════════ */}
          <View style={styles.checkinCard}>
            <View style={styles.checkinHeader}>
              <View style={styles.checkinTitleWrap}>
                <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                  <Animated.View style={{
                    position: 'absolute',
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#8B7CFF',
                    opacity: checkInGlow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] }),
                    transform: [{ scale: checkInGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }],
                  }} />
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#8B7CFF' }} />
                </View>
                <Text style={styles.checkinTitle}>TODAY'S CHECK-INS</Text>
              </View>
              <Text style={styles.checkinProgressText}>
                {completedCheckinsCount} / 4 Complete
              </Text>
            </View>

            {/* Simpler Horizontal grid */}
            <View style={styles.timelineWrap}>
              {checkInItems.map((item) => {
                const completed = item.completed;
                const ringColor = completed ? item.ringColor : 'rgba(247,248,252,0.08)';
                const bubbleColor = completed ? item.bubbleColor : 'rgba(247,248,252,0.03)';
                const labelColor = completed ? '#F7F8FC' : '#6B7280';
                const iconColor = completed ? item.icon.props.color : '#6B7280';

                return (
                  <View key={item.type} style={styles.timelineItem}>
                    {/* Progress ring around icon */}
                    <ProgressRing
                      progress={completed ? item.progress : 0}
                      color={ringColor}
                      size={44}
                      strokeWidth={3}
                      completed={completed}
                    >
                      <View style={[styles.timelineBubble, { backgroundColor: bubbleColor, width: 32, height: 32, borderRadius: 16 }]}>
                        {React.cloneElement(item.icon, { size: 15, color: iconColor })}
                      </View>
                    </ProgressRing>

                    <Text style={[styles.timelineLabel, { color: labelColor }]}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ══════════════════════════════
              SECTION 5: PROGRESS SNAPSHOT
          ══════════════════════════════ */}
          <TouchableOpacity
            style={styles.snapshotCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Progress')}
          >
            <View style={styles.snapshotHeader}>
              <Text style={styles.snapshotTitleText}>PROGRESS SNAPSHOT</Text>
              <Text style={styles.snapshotStreakText}>
                <Flame size={12} color="#FF8FA3" fill="#FF8FA3" /> {healthData.streak || 0} Day Streak
              </Text>
            </View>
            <View style={styles.snapshotBarRow}>
              <Text style={styles.snapshotLevelText}>LEVEL {levelInfo.level}</Text>
              <View style={styles.snapshotTrack}>
                <LinearGradient
                  colors={['#8B7CFF', '#FF8FA3']}
                  style={[styles.snapshotFill, { width: `${xpProgress}%` }]}
                />
              </View>
              <Text style={styles.snapshotXpText}>
                {xpInCurrentLevel} / {xpNeededForLevel} XP
              </Text>
            </View>
            <Text style={styles.snapshotRemainingText}>
              {xpRemaining} XP to Level {levelInfo.level + 1}
            </Text>
          </TouchableOpacity>

          {/* ══════════════════════════════
              SECTION 6: NEO INSIGHT
          ══════════════════════════════ */}
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Sparkles size={11} color="#FF8FA3" />
              <Text style={styles.insightLabelText}>NEO INSIGHT</Text>
            </View>
            <Text style={styles.insightText} numberOfLines={2}>
              {aiSummary || "Nothing to analyze yet. Complete one check-in and I'll start coaching."}
            </Text>
          </View>

        </Animated.View>
      </RefreshableScrollView>
      <LevelUpModal
        visible={!!pendingLevelUp}
        level={pendingLevelUp?.level ?? 1}
        title={pendingLevelUp?.title ?? ''}
        onClose={async () => {
          try {
            await updateLastCelebratedLevel(
              pendingLevelUp?.level ?? 0
            );
          } finally {
            clearPendingLevelUp();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0B1020',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  greeting: {
    fontFamily: 'Epilogue-Bold',
    fontSize: 18,
    color: '#F7F8FC',
    fontWeight: '700',
  },
  friendText: {
    fontFamily: 'Epilogue-Bold',
    fontSize: 20,
    color: '#8B7CFF',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '900',
  },

  // Daily Score Hero Block
  scoreCard: {
    marginHorizontal: 18,
    marginTop: 10,
    backgroundColor: '#131929',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(247,248,252,0.4)',
    letterSpacing: 1.2,
  },
  scoreValueText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F7F8FC',
    marginTop: 4,
  },
  scoreStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B7CFF',
    marginTop: 4,
  },
  scoreCircleContainer: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Neo Command Center card
  commandCard: {
    marginHorizontal: 18,
    marginTop: 12,
    backgroundColor: '#131929',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.2)',
    gap: 5,
  },
  commandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commandHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B7CFF',
    letterSpacing: 1.2,
  },
  commandPriorityText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F7F8FC',
    marginBottom: 2,
    lineHeight: 20,
  },
  commandLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commandLineLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(247,248,252,0.4)',
    width: 80,
  },
  commandLineValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#F7F8FC',
  },
  commandLineImpact: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#FF8FA3',
  },

  // Today's Checkins
  checkinCard: {
    marginHorizontal: 18,
    marginTop: 12,
    backgroundColor: '#131929',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.2)',
  },
  checkinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  checkinTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  checkinTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: '#8B7CFF' },
  checkinProgressText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B7CFF',
    letterSpacing: 0.5,
  },
  timelineWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timelineItem: { alignItems: 'center', width: 68 },
  timelineBubble: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLabel: { marginTop: 8, fontSize: 10, fontWeight: '700' },

  // Progress Snapshot card
  snapshotCard: {
    marginHorizontal: 18,
    marginTop: 12,
    backgroundColor: '#131929',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.2)',
    gap: 10,
  },
  snapshotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  snapshotTitleText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(247,248,252,0.4)',
    letterSpacing: 1.2,
  },
  snapshotLevelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B7CFF',
  },
  snapshotStreakText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF8FA3',
  },
  snapshotBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  snapshotTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A2235',
    overflow: 'hidden',
  },
  snapshotFill: {
    height: '100%',
    borderRadius: 3,
  },
  snapshotXpText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F7F8FC',
    minWidth: 70,
    textAlign: 'right',
  },
  snapshotRemainingText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(247,248,252,0.4)',
    marginTop: 2,
  },

  // Neo Insight card
  insightCard: {
    marginHorizontal: 18,
    marginTop: 12,
    backgroundColor: '#131929',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 143, 163, 0.15)',
    gap: 6,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF8FA3',
    letterSpacing: 1.2,
  },
  insightText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F7F8FC',
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
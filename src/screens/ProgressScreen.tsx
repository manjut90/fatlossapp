import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, StatusBar,
  TouchableOpacity, Animated,
} from 'react-native';

import RefreshableScrollView from '../components/RefreshableScrollView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Zap, TrendingDown, TrendingUp, Flame, RefreshCw, 
  CheckCircle2, Award, Calendar, Sparkles, Activity, 
  Target, Dumbbell, ShieldCheck, Heart, Info, Trophy,
  Leaf
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { useHealth } from '../context/HealthContext';
import { useProgressMetrics } from '../hooks/useProgressMetrics';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { getLevelFromXP } from '../constants/levels';
import { getUserTargets } from '../utils/healthCalculations';

const MOTIVATIONAL_LINES = [
  "The only bad workout is the one that didn't happen.",
  "Success isn't always about greatness. It's about consistency.",
  "The body achieves what the mind believes.",
  "Don't limit your challenges. Challenge your limits.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "You are one workout away from a good mood.",
];

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { profile, refreshProfile } = useAuth();
  const { healthData, refreshHealthData } = useHealth();
  const { dailyData, currentWeight, firstWeightEntry, refresh: refreshHistorical } = useHistoricalData();

  const handleRefresh = async () => {
    await refreshHistorical?.();
  };
  const metrics = useProgressMetrics();

  const [tagline] = useState(() => MOTIVATIONAL_LINES[new Date().getDay() % MOTIVATIONAL_LINES.length]);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'overall'>('weekly');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshHealthData();
    }, [refreshHealthData, period])
  );

  const firstName = profile?.full_name?.split(' ')[0] || 'Champ';
  const goal = profile?.goal || profile?.goals?.[0] || 'fat_loss';
  const targets = getUserTargets(profile);
  const caloriesGoal = targets.calories;
  const proteinGoal = targets.protein;
  const carbsGoal = targets.carbs;
  const fatsGoal = targets.fats;
  const fiberGoal = targets.fiber;

  // Weight setup
  const startWeight = parseFloat(profile?.initial_weight || '0')
    || (firstWeightEntry ? parseFloat(String(firstWeightEntry.weight)) : 0)
    || parseFloat(profile?.current_weight || '0')
    || parseFloat(String(currentWeight))
    || 0;
    
  const currWeight = parseFloat(String(currentWeight)) || parseFloat(profile?.current_weight || '0') || 0;
  const targetWeight = targets.targetWeight;
  const weightDiff = parseFloat((startWeight - currWeight).toFixed(1));
  const isLoss = goal === 'fat_loss' ? weightDiff >= 0 : weightDiff <= 0;
  const weightDiffAbs = Math.abs(weightDiff);
  const diffColor = isLoss ? '#22C55E' : '#EAB308';
  
  const hasReachedTarget = goal === 'fat_loss' ? currWeight <= targetWeight : currWeight >= targetWeight;

  const journeyPct = startWeight !== targetWeight
    ? Math.min(100, Math.max(0, ((startWeight - currWeight) / (startWeight - targetWeight)) * 100))
    : 100;

  const pct = hasReachedTarget ? 100 : Math.round(journeyPct);
  const kgLeft = hasReachedTarget ? 0 : Math.abs(parseFloat((currWeight - targetWeight).toFixed(1)));

  // XP & Levels
  const userXp = profile?.xp || 0;
  const levelInfo = getLevelFromXP(userXp);
  const userLevel = levelInfo.level;
  const currentLevelMinXp = levelInfo.currentLevelXp;
  const nextLevelMinXp = levelInfo.nextLevelXp || currentLevelMinXp;
  const xpInCurrentLevel = userXp - currentLevelMinXp;
  const xpToNextLevelRange = nextLevelMinXp - currentLevelMinXp;
  const xpRemaining = nextLevelMinXp - userXp;

  // Streak Information
  const currentStreak = healthData?.streak || 0;
  const longestStreak = Math.max(currentStreak, profile?.longest_streak || 7);
  const isWorkoutStreak = (metrics?.weekComparisonMetrics?.workout?.current || 0) >= 3;

  // Period-based logs and changes
  const periodDays = period === 'weekly' ? 7 : period === 'monthly' ? 30 : (dailyData?.length || 7);
  const periodData = (dailyData || []).slice(-periodDays);
  const periodLabel = period === 'weekly' ? 'This Week' : period === 'monthly' ? 'This Month' : 'All Time';

  // Check if user has logged anything in the current period
  const hasPeriodLogs = useMemo(() => {
    return periodData.some(d => (d.workout || d.workoutCount > 0 || d.water > 0 || d.calories > 0 || d.sleep > 0));
  }, [periodData]);

  const periodWeightDiff = (() => {
    if (!periodData.length) return weightDiff;
    const first = periodData.find(d => d.weight && d.weight > 0)?.weight || startWeight;
    const last = [...periodData].reverse().find(d => d.weight && d.weight > 0)?.weight || currWeight;
    return parseFloat((first - last).toFixed(1));
  })();
  const periodDiffAbs = Math.abs(periodWeightDiff);
  const periodColor = isLoss
    ? (periodWeightDiff >= 0 ? '#22C55E' : '#EF4444')
    : (periodWeightDiff <= 0 ? '#22C55E' : '#EF4444');

  // Workouts count
  const workoutDays = periodData.filter(d => d.workout || d.workoutCount > 0).length;

  // Average Daily Steps Estimation
  const avgDailySteps = useMemo(() => {
    if (!periodData.length) return 0;
    const totalSteps = periodData.reduce((sum, d) => {
      let dailySteps = 4500;
      if (d.workout || d.workoutCount > 0) {
        dailySteps += 4000;
      }
      if (d.caloriesBurned > 0) {
        dailySteps += Math.round(d.caloriesBurned * 12.5);
      }
      const dayVal = parseInt(d.date.split('-')[2] || '1');
      const seedVariance = ((dayVal * 997) % 1800) - 900;
      return sum + Math.max(2000, dailySteps + seedVariance);
    }, 0);
    return Math.round(totalSteps / periodData.length);
  }, [periodData]);

  // Total Water L
  const totalWaterL = ((periodData.reduce((sum, d) => sum + (d.water || 0), 0)) / 1000).toFixed(1);

  // Averages for Key Metrics
  const avgCalories = periodData.length ? Math.round(periodData.reduce((sum, d) => sum + (d.calories || 0), 0) / periodData.length) : 0;
  const avgProtein = periodData.length ? Math.round(periodData.reduce((sum, d) => sum + (d.protein || 0), 0) / periodData.length) : 0;
  const avgSleep = periodData.length ? parseFloat((periodData.reduce((sum, d) => sum + (d.sleep || 0), 0) / periodData.length).toFixed(1)) : 0;
  const avgWaterL = periodData.length ? parseFloat((periodData.reduce((sum, d) => sum + (d.water || 0), 0) / periodData.length / 1000).toFixed(1)) : 0;

  // Best day name based on logged metrics
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bestDayName = useMemo(() => {
    if (!periodData.length || !hasPeriodLogs) return 'None yet';
    const dayScores = periodData.map(d => {
      let score = 0;
      if (d.calories >= 1200) score += 35;
      if (d.water >= targets.watermL) score += 25;
      if (d.workout || d.workoutCount > 0) score += 25;
      if (d.sleep >= targets.sleep) score += 15;
      return { date: d.date, score };
    });
    const best = dayScores.reduce((max, d) => d.score > max.score ? d : max, { date: '', score: -1 });
    if (best.score <= 0) return 'None yet';
    const dateObj = new Date(best.date);
    return weekdays[dateObj.getDay()];
  }, [periodData, targets, hasPeriodLogs]);

  // Focus Area for next week based on metrics
  const focusNextWeek = useMemo(() => {
    if (!hasPeriodLogs) return 'Begin tracking';
    const negatives = metrics?.autoDetected?.negatives || [];
    if (negatives.length > 0) {
      return negatives[0]
        .replace(' needs improvement', '')
        .replace(' falling short', '')
        .replace(' quality needs attention', '')
        .replace(' intake inconsistent', '');
    }
    return 'Maintain consistency';
  }, [metrics, hasPeriodLogs]);

  // Section 1: Neo Performance Review Generator
  const neoReviewText = useMemo(() => {
    if (!hasPeriodLogs) {
      return `Welcome to your transformation dashboard, ${firstName}! I'm ready to analyze your progress. Log your workouts, meals, water, or sleep in the Check-In tab to activate your first personalized assessment.`;
    }

    const positives = metrics?.autoDetected?.positives || [];
    const negatives = metrics?.autoDetected?.negatives || [];
    const workoutsCurrent = metrics?.weekComparisonMetrics?.workout?.current || 0;
    const sleepCurrent = metrics?.weekComparisonMetrics?.sleep?.current || 0;
    const sleepPrevious = metrics?.weekComparisonMetrics?.sleep?.previous || 0;
    const sleepPercentChange = sleepPrevious !== 0 ? ((sleepCurrent - sleepPrevious) / sleepPrevious) * 100 : 0;
    const waterCurrent = metrics?.weekComparisonMetrics?.water?.current || 0;
    const waterPrevious = metrics?.weekComparisonMetrics?.water?.previous || 0;
    const waterPercentChange = waterPrevious !== 0 ? ((waterCurrent - waterPrevious) / waterPrevious) * 100 : 0;

    const periodWord = period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'period';

    let s1 = "";
    if (workoutsCurrent >= 4) {
      s1 = `Outstanding ${periodWord}, ${firstName}! You completed ${workoutsCurrent} workouts and maintained elite training consistency.`;
    } else if (workoutsCurrent > 0) {
      s1 = `Good job this ${periodWord}, ${firstName}. You logged ${workoutsCurrent} workouts, keeping your physical momentum going.`;
    } else {
      s1 = `Let's rebuild your training momentum, ${firstName}. We don't have any workouts logged yet for this ${periodWord}.`;
    }

    let s2 = "";
    if (sleepPercentChange < -10) {
      s2 = ` Note that your sleep averages dropped by ${Math.abs(Math.round(sleepPercentChange))}% this ${periodWord}, which can delay recovery.`;
    } else if (waterPercentChange < -10) {
      s2 = ` Your hydration consistency dropped by ${Math.abs(Math.round(waterPercentChange))}%—make sure to drink water throughout the day.`;
    } else if (weightDiffAbs > 0.2 && isLoss) {
      s2 = ` Excellent news—your body composition is moving in the right direction, down by ${weightDiffAbs}kg overall.`;
    } else if (positives.length > 0) {
      s2 = ` I noticed ${positives[0].toLowerCase()} which is a fantastic indicator of progress.`;
    } else {
      s2 = ` Ensuring your hydration and recovery targets are met will optimize your metabolism.`;
    }

    let s3 = "";
    if (negatives.length > 0) {
      const area = negatives[0].toLowerCase()
        .replace('quality needs attention', 'sleep quality')
        .replace('intake inconsistent', 'calories')
        .replace('falling short', 'protein');
      s3 = ` Focus next on improving your ${area} to boost energy and accelerate results.`;
    } else {
      s3 = ` Keep up this excellent routine, and you'll reach your next milestone right on schedule.`;
    }

    return `${s1}${s2}${s3}`;
  }, [firstName, metrics, isLoss, weightDiffAbs, hasPeriodLogs, period]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <RefreshableScrollView 
        onRefresh={handleRefresh}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* WELCOME BAR */}
          <LinearGradient colors={['#18152B', '#1D1225', '#17111D']} style={styles.welcomeCard}>
            <Text style={styles.welcomeEyebrow}>PERSONAL TRANSFORMATION</Text>
            <Text style={styles.welcomeName}>{firstName}’s Progress</Text>
            <Text style={styles.welcomeTagline}>{tagline}</Text>
          </LinearGradient>

          {/* PERIOD SELECTOR */}
          <View style={styles.selectorContainer}>
            {(['weekly', 'monthly', 'overall'] as const).map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={[
                  styles.selectorOption, 
                  period === p && styles.selectorOptionActive
                ]}
              >
                <Text style={[
                  styles.selectorText, 
                  period === p && styles.selectorTextActive
                ]}>
                  {p === 'weekly' ? 'Weekly' : p === 'monthly' ? 'Monthly' : 'Overall'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SECTION 1 — NEO PERFORMANCE REVIEW */}
          <View style={styles.neoReviewCard}>
            <LinearGradient
              colors={['rgba(139, 124, 255, 0.12)', 'rgba(255, 143, 163, 0.04)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.neoReviewHeader}>
              <View style={styles.neoAvatar}>
                <Sparkles size={16} color="#F7C873" />
              </View>
              <View>
                <Text style={styles.neoReviewTitle}>NEO'S PERFORMANCE REVIEW</Text>
                <Text style={styles.neoReviewSubtitle}>Personalized Coach Assessment</Text>
              </View>
            </View>
            <Text style={styles.neoReviewText}>{neoReviewText}</Text>
          </View>

          {/* SECTION 2 — WEEKLY STORY */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Calendar size={16} color="#8B7CFF" />
              <Text style={styles.sectionTitle}>{periodLabel} Story</Text>
            </View>
            
            {!hasPeriodLogs ? (
              <View style={styles.emptyContainer}>
                <Info size={24} color="#6B7280" />
                <Text style={styles.emptyTitle}>Your story is waiting</Text>
                <Text style={styles.emptySubtitle}>Log workouts, meals, water, or sleep to construct your story.</Text>
              </View>
            ) : (
              <View style={styles.storyContent}>
                <View style={styles.storyRow}>
                  <Text style={styles.storyBullet}>✓</Text>
                  <Text style={styles.storyText}>
                    <Text style={styles.boldText}>{workoutDays}</Text> {workoutDays === 1 ? 'workout' : 'workouts'} completed
                  </Text>
                </View>
                <View style={styles.storyRow}>
                  <Text style={styles.storyBullet}>✓</Text>
                  <Text style={styles.storyText}>
                    <Text style={styles.boldText}>{avgDailySteps.toLocaleString()}</Text> average daily steps
                  </Text>
                </View>
                <View style={styles.storyRow}>
                  <Text style={styles.storyBullet}>✓</Text>
                  <Text style={styles.storyText}>
                    <Text style={styles.boldText}>{totalWaterL}L</Text> water consumed
                  </Text>
                </View>
                {currWeight > 0 && (
                  <View style={styles.storyRow}>
                    <Text style={styles.storyBullet}>✓</Text>
                    <Text style={styles.storyText}>
                      {periodWeightDiff >= 0 ? 'Lost' : 'Gained'} <Text style={styles.boldText}>{periodDiffAbs}kg</Text> on scale weight
                    </Text>
                  </View>
                )}
                
                <View style={styles.storyFooter}>
                  <View style={styles.storyFooterItem}>
                    <Text style={styles.storyFooterLabel}>Best Day</Text>
                    <Text style={styles.storyFooterValue}>{bestDayName}</Text>
                  </View>
                  <View style={styles.storyFooterDivider} />
                  <View style={styles.storyFooterItem}>
                    <Text style={styles.storyFooterLabel}>Next Focus</Text>
                    <Text style={styles.storyFooterValue} numberOfLines={1}>{focusNextWeek}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
 
          {/* SECTION 3 — GOAL PROGRESS (WEIGHT CARD) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Target size={16} color="#FF8FA3" />
              <Text style={styles.sectionTitle}>Goal Progress</Text>
            </View>
 
            {currWeight === 0 ? (
              <View style={styles.emptyContainer}>
                <Target size={28} color="#FF8FA3" />
                <Text style={styles.emptyTitle}>No weight data yet</Text>
                <Text style={styles.emptySubtitle}>Log your weight to begin tracking your transformation timeline.</Text>
              </View>
            ) : (
              <View>
                <View style={styles.goalGrid}>
                  <View style={styles.goalStat}>
                    <Text style={styles.goalLabel}>Current Weight</Text>
                    <Text style={styles.goalValue}>{currWeight} kg</Text>
                  </View>
                  <View style={styles.goalStat}>
                    <Text style={styles.goalLabel}>Target Weight</Text>
                    <Text style={styles.goalValue}>{targetWeight} kg</Text>
                  </View>
                  <View style={styles.goalStat}>
                    <Text style={styles.goalLabel}>Remaining</Text>
                    <Text style={[styles.goalValue, { color: '#8B7CFF' }]}>
                      {hasReachedTarget ? 'Done' : `${kgLeft} kg`}
                    </Text>
                  </View>
                </View>
 
                {/* Progress bar */}
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressText}>{pct}% Complete</Text>
                  <Text style={[styles.progressText, { color: diffColor }]}>
                    {metrics?.trends?.weight === 'down' ? 'Trending Down' : metrics?.trends?.weight === 'up' ? 'Trending Up' : 'Stable'}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <LinearGradient 
                    colors={['#8B7CFF', '#FF8FA3']} 
                    style={[styles.progressBarFill, { width: `${pct}%` }]} 
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 0 }} 
                  />
                </View>
              </View>
            )}
          </View>
 
          {/* SECTION 4 — XP JOURNEY */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Award size={16} color="#F7C873" />
              <Text style={styles.sectionTitle}>XP Journey</Text>
            </View>
            <View style={styles.xpHeader}>
              <View>
                <Text style={styles.xpLevelText}>Level {userLevel}</Text>
                <Text style={styles.xpTitleText}>{levelInfo.title}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.xpValueText}>{userXp} XP</Text>
                <Text style={styles.xpRemainingText}>
                  {levelInfo.nextLevelXp !== null ? `${xpRemaining} XP to Level ${userLevel + 1}` : 'Max level achieved'}
                </Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <LinearGradient 
                colors={['#F7C873', '#FF8FA3']} 
                style={[styles.progressBarFill, { width: `${levelInfo.progressPercent}%` }]} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }} 
              />
            </View>
            
            <View style={styles.xpGrid}>
              <View style={styles.xpGridItem}>
                <Text style={styles.xpGridLabel}>Level Progress</Text>
                <Text style={styles.xpGridValue}>{Math.round(levelInfo.progressPercent)}%</Text>
              </View>
              <View style={styles.xpGridItem}>
                <Text style={styles.xpGridLabel}>Current XP</Text>
                <Text style={styles.xpGridValue}>{xpInCurrentLevel} XP</Text>
              </View>
              <View style={styles.xpGridItem}>
                <Text style={styles.xpGridLabel}>XP to Next</Text>
                <Text style={styles.xpGridValue}>{levelInfo.nextLevelXp !== null ? `${xpRemaining} XP` : '0 XP'}</Text>
              </View>
              <View style={styles.xpGridItem}>
                <Text style={styles.xpGridLabel}>Lifetime XP</Text>
                <Text style={styles.xpGridValue}>{userXp} XP</Text>
              </View>
            </View>
          </View>
 
          {/* SECTION 5 — STREAKS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Flame size={16} color="#FF8FA3" />
              <Text style={styles.sectionTitle}>Streaks & consistency</Text>
            </View>
            <View style={styles.streakGrid}>
              <View style={styles.streakColumn}>
                <Flame size={32} color={currentStreak > 0 ? "#FF8FA3" : "#6B7280"} />
                <Text style={styles.streakValue}>{currentStreak} Days</Text>
                <Text style={styles.streakLabel}>{currentStreak > 0 ? `${isWorkoutStreak ? 'Workout' : 'Check-In'} Streak` : 'Current Streak'}</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakColumn}>
                <Trophy size={30} color="#F7C873" />
                <Text style={styles.streakValue}>{longestStreak} Days</Text>
                <Text style={styles.streakLabel}>Longest Streak</Text>
              </View>
            </View>
            <View style={styles.streakBanner}>
              <ShieldCheck size={14} color={currentStreak > 0 ? "#8B7CFF" : "#6B7280"} />
              <Text style={styles.streakBannerText}>
                {currentStreak > 0 
                  ? `${isWorkoutStreak ? 'Workout' : 'Check-In'} streak active. Keep logging!`
                  : 'Check in today to start your consistency streak!'}
              </Text>
            </View>
          </View>

          {/* SECTION 6 — KEY METRICS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Activity size={16} color="#22C55E" />
              <Text style={styles.sectionTitle}>Key Metrics</Text>
            </View>

            {[
              { label: 'Calories', current: avgCalories, target: targets.calories, unit: 'kcal', color: '#8B7CFF' },
              { label: 'Protein', current: avgProtein, target: targets.protein, unit: 'g', color: '#FF8FA3' },
              { label: 'Water', current: avgWaterL, target: targets.water, unit: 'L', color: '#38BDF8' },
              { label: 'Sleep', current: avgSleep, target: targets.sleep, unit: 'h', color: '#FBBF24' },
              { label: 'Activity', current: workoutDays, target: Math.round(periodDays * 4 / 7), unit: ' workouts', color: '#34D399' },
            ].map(m => {
              const compPct = Math.min(100, Math.round((m.current / m.target) * 100)) || 0;
              return (
                <View key={m.label} style={styles.metricRow}>
                  <View style={styles.metricLabelRow}>
                    <Text style={styles.metricLabelName}>{m.label}</Text>
                    <Text style={styles.metricLabelValue}>{m.current}{m.unit} / {m.target}{m.unit}</Text>
                  </View>
                  <View style={styles.metricBarContainer}>
                    <View style={styles.metricBarBg}>
                      <View style={[styles.metricBarFill, { width: `${compPct}%`, backgroundColor: m.color }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* SECTION 7 — TREND INSIGHTS (WEIGHT TREND) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Activity size={16} color="#8B7CFF" />
              <Text style={styles.sectionTitle}>Weight Trend — {periodLabel}</Text>
            </View>

            {dailyData && dailyData.length > 0 && periodData.filter(d => d.weight && parseFloat(String(d.weight)) > 0).length >= 2 ? (
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 95, paddingBottom: 5, marginTop: 10 }}>
                {periodData.filter(d => d.weight && parseFloat(String(d.weight)) > 0).slice(-12).map((d, i) => {
                  const sliceData = periodData.filter(d => d.weight && parseFloat(String(d.weight)) > 0).slice(-12);
                  const vals = sliceData.map(x => x.weight);
                  const minW = Math.min(...vals) - 1;
                  const maxW = Math.max(...vals) + 1;
                  const barH = maxW !== minW ? Math.round(((d.weight) - minW) / (maxW - minW) * 60) + 10 : 40;
                  
                  const dateObj = new Date(d.date);
                  const dateLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
                  
                  return (
                    <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 9, color: '#6B7280' }}>{d.weight.toFixed(1)}</Text>
                      <View style={{ width: '80%', height: barH, backgroundColor: '#8B7CFF', borderRadius: 4, opacity: 0.65 + i * 0.03 }} />
                      <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>{dateLabel}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Activity size={24} color="#6B7280" />
                <Text style={styles.emptyTitle}>Keep tracking to unlock trends</Text>
                <Text style={styles.emptySubtitle}>Log your weight on multiple days in the Check-In tab to see scale changes over time.</Text>
              </View>
            )}
          </View>

          {/* SECTION 8 — NUTRITION & CALORIE ANALYSIS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Leaf size={16} color="#5EA765" strokeWidth={2.2} />
              <Text style={styles.sectionTitle}>Daily Fuel & Nutrition Analytics</Text>
            </View>
            
            {/* Calories In / Burned metrics */}
            <View style={styles.caloriesRow}>
              <View style={styles.calorieCol}>
                <Text style={styles.calorieLabel}>CALORIES IN</Text>
                <Text style={styles.calorieVal}>{healthData.todayCalories}</Text>
                <Text style={styles.calorieSub}>{healthData.todayCalories} / {caloriesGoal} kcal</Text>
              </View>
              <View style={styles.calorieDivider} />
              <View style={styles.calorieCol}>
                <Text style={styles.calorieLabel}>CALORIES BURNED</Text>
                <Text style={styles.calorieVal}>{healthData.todayCaloriesBurned || 0}</Text>
                <Text style={styles.calorieSub}>{healthData.todayWorkout ? 'From workout' : 'No workout yet'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Macro Breakdown progress bars */}
            {[
              { label: 'PROTEIN', value: healthData.todayProtein || 0, target: proteinGoal, unit: 'g', color: '#8B7CFF' },
              { label: 'CARBS', value: healthData.todayCarbs || 0, target: carbsGoal, unit: 'g', color: '#4A90FF' },
              { label: 'FATS', value: healthData.todayFats || 0, target: fatsGoal, unit: 'g', color: '#FF8C42' },
              { label: 'FIBER', value: healthData.todayFiber || 0, target: fiberGoal, unit: 'g', color: '#5EA765' },
            ].map((macro) => (
              <View key={macro.label} style={styles.macroRow}>
                <Text style={[styles.macroLabel, { color: macro.color }]}>{macro.label}</Text>
                <View style={styles.macroBarWrap}>
                  <View style={styles.macroBar}>
                    <View style={[
                      styles.macroFill,
                      {
                        width: `${Math.min(100, (macro.value / macro.target) * 100)}%`,
                        backgroundColor: macro.color,
                      },
                    ]} />
                  </View>
                </View>
                <Text style={styles.macroValue}>
                  {Math.round(macro.value)}{macro.unit}
                  <Text style={styles.macroTarget}>/{macro.target}{macro.unit}</Text>
                </Text>
              </View>
            ))}
          </View>

        </Animated.View>
      </RefreshableScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  welcomeCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  welcomeEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B7CFF',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F7F8FC',
    marginBottom: 4,
  },
  welcomeTagline: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  selectorContainer: {
    flexDirection: 'row', 
    marginHorizontal: 16, 
    marginBottom: 14, 
    backgroundColor: '#131929', 
    borderRadius: 14, 
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.08)'
  },
  selectorOption: {
    flex: 1, 
    paddingVertical: 8, 
    borderRadius: 10, 
    alignItems: 'center',
  },
  selectorOptionActive: {
    backgroundColor: '#8B7CFF',
  },
  selectorText: {
    fontSize: 12, 
    fontWeight: '700', 
    color: '#6B7280',
  },
  selectorTextActive: {
    color: '#F7F8FC',
  },
  neoReviewCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.2)',
  },
  neoReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  neoAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 124, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  neoReviewTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F7C873',
    letterSpacing: 1.2,
  },
  neoReviewSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  neoReviewText: {
    fontSize: 13,
    color: '#F7F8FC',
    lineHeight: 19,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#131929',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.04)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F7F8FC',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  storyContent: {
    gap: 10,
  },
  storyRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  storyBullet: {
    color: '#22C55E',
    fontWeight: '800',
    fontSize: 14,
  },
  storyText: {
    fontSize: 13,
    color: '#F7F8FC',
  },
  boldText: {
    fontWeight: '800',
    color: '#8B7CFF',
  },
  storyFooter: {
    flexDirection: 'row',
    backgroundColor: '#0B1020',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  storyFooterItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  storyFooterDivider: {
    width: 1,
    backgroundColor: 'rgba(139,124,255,0.1)',
  },
  storyFooterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  storyFooterValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F7F8FC',
  },
  goalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalStat: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F7F8FC',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  progressBarBg: {
    height: 10, 
    backgroundColor: '#0B1020', 
    borderRadius: 5, 
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', 
    borderRadius: 5,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  xpLevelText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F7F8FC',
  },
  xpTitleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F7C873',
  },
  xpValueText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#8B7CFF',
  },
  xpRemainingText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  streakGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  streakColumn: {
    alignItems: 'center',
    gap: 4,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(139,124,255,0.1)',
  },
  streakValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F7F8FC',
    marginTop: 4,
  },
  streakLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1020',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 10,
    gap: 6,
  },
  streakBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  metricRow: {
    marginBottom: 12,
  },
  metricLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabelName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F7F8FC',
  },
  metricLabelValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  metricBarContainer: {
    height: 8,
    justifyContent: 'center',
  },
  metricBarBg: {
    height: 6,
    backgroundColor: '#0B1020',
    borderRadius: 3,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  xpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    backgroundColor: '#0B1020',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  xpGridItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpGridLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  xpGridValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F7F8FC',
  },
  // NUTRITION & CALORIE ANALYSIS STYLES (transplanted from home)
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 8,
  },
  calorieCol: {
    flex: 1,
    alignItems: 'center',
  },
  calorieLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  calorieVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F7F8FC',
    marginTop: 6,
  },
  calorieSub: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  calorieDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(139,124,255,0.15)',
    marginHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(139,124,255,0.12)',
    marginVertical: 14,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 8,
  },
  macroLabel: {
    fontSize: 9,
    fontWeight: '800',
    width: 52,
    letterSpacing: 0.5,
  },
  macroBarWrap: {
    flex: 1,
  },
  macroBar: {
    height: 6,
    backgroundColor: '#1A2235',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F7F8FC',
    width: 58,
    textAlign: 'right',
  },
  macroTarget: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
});
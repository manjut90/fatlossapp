import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { useProgressMetrics } from '../hooks/useProgressMetrics';

export function ProgressHero({ mode, setMode }) {
  const metrics = useProgressMetrics();

  const m = metrics.overallMetrics;
  const wm = metrics.weekComparisonMetrics;

  const isOverall = mode === 'overall';
  const isWeekly = mode === 'weekly';

  // Overall progress
  const progressPercent = Math.min(100, m.percentageComplete);

  // Week comparison
  const calorieChange = wm.calories.percentChange;
  const proteinChange = wm.protein.percentChange;
  const waterChange = wm.water.percentChange;
  const activityChange = wm.workout.percentChange;


  return (
    <View style={styles.heroCard}>
      <LinearGradient
        colors={[
          'rgba(124,92,255,0.12)',
          'rgba(88,166,255,0.04)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGlow}
      />

      <LinearGradient
        colors={[
          'rgba(255,214,170,0.10)',
          'transparent',
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.warmGlow}
      />

      {/* Header with mode toggle */}
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionMini}>PROGRESS SNAPSHOT</Text>
          <Text style={styles.heroTitle}>
            {isOverall ? 'Overall' : 'This Week'}{' '}
            <Text style={styles.highlight}>Progress</Text>
          </Text>
        </View>

        {/* Toggle button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setMode(isOverall ? 'weekly' : 'overall')}
        >
          <Text style={styles.toggleText}>
            {isOverall ? 'This Week' : 'Overall'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main content - Overall mode */}
      {isOverall && (
        <>
          {/* Weight progress */}
          <View style={styles.weightRow}>
            <View style={styles.weightBlock}>
              <Text style={styles.weightLabel}>STARTED</Text>
              <Text style={styles.weightValue}>
                {m.startDate ? new Date(m.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                }) : '--'}
              </Text>
            </View>

            <View style={styles.centerBlock}>
              <Text style={styles.lossValue}>
                {m.weightLoss.toFixed(1)}kg
              </Text>
              <Text style={styles.lossLabel}>Loss</Text>
            </View>

            <View style={styles.weightBlock}>
              <Text style={styles.weightLabel}>CURRENT</Text>
              <Text style={styles.weightValue}>{(m.currentWeight || 0).toFixed(1)}kg</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Goal Progress</Text>
              <Text style={styles.progressPercent}>
                {progressPercent.toFixed(0)}%
              </Text>
            </View>

            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#8B7CFF', '#FF8FA3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>

            <View style={styles.progressFooter}>
              <Text style={styles.progressFooterText}>
                {m.weeksRemaining} weeks remaining at {m.weeklyLossRate}kg/week
              </Text>
            </View>
          </View>

          {/* Key metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {m.daysElapsed}
              </Text>
              <Text style={styles.metricLabel}>Days</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {m.percentageComplete}%
              </Text>
              <Text style={styles.metricLabel}>Complete</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {m.weeksRemaining}
              </Text>
              <Text style={styles.metricLabel}>Weeks</Text>
            </View>
          </View>
        </>
      )}

      {/* Weekly mode */}
      {isWeekly && (
        <>
          {/* Weight progress */}
          <View style={styles.weightRow}>
            <View style={styles.weightBlock}>
              <Text style={styles.weightLabel}>START OF WEEK</Text>
              <Text style={styles.weightValue}>
                {(wm.startWeight || 0).toFixed(1)}kg
              </Text>
            </View>

            <View style={styles.centerBlock}>
              <Text style={styles.lossValue}>
                {(wm.weightLoss || 0).toFixed(1)}kg
              </Text>
              <Text style={styles.lossLabel}>Loss This Week</Text>
            </View>

            <View style={styles.weightBlock}>
              <Text style={styles.weightLabel}>CURRENT</Text>
              <Text style={styles.weightValue}>{(m.currentWeight || 0).toFixed(1)}kg</Text>
            </View>
          </View>
        </>
      )}

      {/* Insight strip */}
      <View style={styles.insightStrip}>
        <Sparkles size={15} color="#8B7CFF" />
        <Text style={styles.insightText}>
          {isOverall
            ? `You're ${progressPercent.toFixed(0)}% toward your goal. Keep up the momentum!`
            : 'Track how your daily habits compound into lasting change.'}
        </Text>
      </View>
    </View>
  );
}

function MetricChange({
  label,
  value,
  change,
  trend,
  unit = '',
}: {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
}) {
  const changeColor =
    trend === 'up' ? '#FF6B6B' : trend === 'down' ? '#52C77C' : '#8A8A8A';
  const changeSign = change > 0 ? '+' : change < 0 ? '' : '±';

  return (
    <View style={styles.weeklyMetricItem}>
      <Text style={styles.weeklyMetricLabel}>{label}</Text>
      <Text style={styles.weeklyMetricValue}>
        {Math.round(value)}
        {unit && <Text style={styles.weeklyMetricUnit}>{unit}</Text>}
      </Text>
      <Text style={[styles.weeklyMetricChange, { color: changeColor }]}>
        {changeSign}
        {Math.abs(change).toFixed(0)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginTop: 70,
    marginHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 34,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEE6DA',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },

  heroGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 999,
    top: -120,
    right: -120,
  },

  warmGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    bottom: -100,
    left: -60,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  sectionMini: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A8A8A',
  },

  heroTitle: {
    marginTop: 10,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: '#111111',
  },

  highlight: {
    color: '#8B7CFF',
  },

  toggleButton: {
    backgroundColor: '#F1ECFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B7CFF',
  },

  weightRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  weightBlock: {
    alignItems: 'center',
  },

  weightLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 1,
  },

  weightValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
  },

  weekLabel: {
    fontSize: 9,
    color: '#AAAAAA',
    marginTop: 2,
  },

  centerBlock: {
    alignItems: 'center',
  },

  lossValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#52C77C',
  },

  lossLabel: {
    fontSize: 11,
    color: '#52C77C',
    fontWeight: '700',
    marginTop: 4,
  },

  progressSection: {
    marginTop: 24,
    backgroundColor: '#FAF8F5',
    borderRadius: 20,
    padding: 16,
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5D5D5D',
  },

  progressPercent: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8B7CFF',
  },

  progressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E8E0F8',
    overflow: 'hidden',
    marginBottom: 10,
  },

  progressFill: {
    height: '100%',
    borderRadius: 6,
  },

  progressFooter: {
    marginTop: 8,
  },

  progressFooterText: {
    fontSize: 11,
    color: '#7B7B7B',
    lineHeight: 16,
  },

  metricsGrid: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  metricCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1ECFF',
  },

  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8B7CFF',
  },

  metricLabel: {
    fontSize: 10,
    color: '#8A8A8A',
    marginTop: 4,
    fontWeight: '600',
  },

  weeklyContent: {
    marginTop: 20,
  },

  weeklySubtitle: {
    fontSize: 12,
    color: '#8A8A8A',
    marginBottom: 16,
    fontWeight: '600',
  },

  weeklyMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  weeklyMetricItem: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },

  weeklyMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7B7B7B',
  },

  weeklyMetricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
    marginTop: 6,
  },

  weeklyMetricUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A8A8A',
  },

  weeklyMetricChange: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },

  insightStrip: {
    marginTop: 18,
    backgroundColor: '#F3EEFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  insightText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#6D5CE8',
    fontWeight: '600',
  },
});
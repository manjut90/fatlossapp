import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { Activity, Flame, TrendingUp } from 'lucide-react-native';

type TrendingMode = 'weekly' | 'comparison' | 'averages';

export function ActivityTrending() {
  const { dailyData } = useHistoricalData();
  const [mode, setMode] = useState<TrendingMode>('weekly');

  // Prepare chart data
  const chartData = useMemo(() => {
    if (dailyData.length === 0) {
      return { labels: [], datasets: [] };
    }

    if (mode === 'weekly') {
      // Last 7 days
      const last7 = dailyData.slice(-7);
      return {
        labels: last7.map((d) => {
          const date = new Date(d.date);
          return (date.getMonth() + 1) + '/' + date.getDate();
        }),
        datasets: [
          {
            label: 'Calories Burned',
            data: last7.map((d) => d.caloriesBurned),
            color: (opacity = 1) => `rgba(255, 140, 66, ${opacity})`,
          },
        ],
      };
    } else if (mode === 'comparison') {
      // Week-over-week
      const last7 = dailyData.slice(-7);
      const prev7 = dailyData.length >= 14 ? dailyData.slice(-14, -7) : last7;

      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'This Week',
            data: last7.map((d) => d.caloriesBurned),
            color: (opacity = 1) => `rgba(123, 97, 255, ${opacity})`,
          },
          {
            label: 'Last Week',
            data: prev7.map((d) => d.caloriesBurned),
            color: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`,
          },
        ],
      };
    } else {
      // Averages
      const last7 = dailyData.slice(-7);
      const prev7 = dailyData.length >= 14 ? dailyData.slice(-14, -7) : last7;

      const last7Avg =
        last7.reduce((sum, d) => sum + d.caloriesBurned, 0) / last7.length;
      const prev7Avg =
        prev7.reduce((sum, d) => sum + d.caloriesBurned, 0) / prev7.length;

      return {
        labels: ['Last Week', 'This Week'],
        datasets: [
          {
            data: [prev7Avg, last7Avg],
            color: (opacity = 1) => `rgba(123, 97, 255, ${opacity})`,
          },
        ],
      };
    }
  }, [dailyData, mode]);

  // Calculate stats
  const last7 = dailyData.slice(-7);
  const prev7 = dailyData.length >= 14 ? dailyData.slice(-14, -7) : last7;

  const stats = useMemo(() => {
    const last7Stats = {
      totalCalories: last7.reduce((sum, d) => sum + d.caloriesBurned, 0),
      totalWorkouts: last7.filter((d) => d.workoutCount > 0).length,
      avgCaloriesPerDay:
        last7.reduce((sum, d) => sum + d.caloriesBurned, 0) / last7.length,
      consistency: (last7.filter((d) => d.workoutCount > 0).length / 7) * 100,
    };

    const prev7Stats = {
      totalCalories: prev7.reduce((sum, d) => sum + d.caloriesBurned, 0),
      totalWorkouts: prev7.filter((d) => d.workoutCount > 0).length,
      avgCaloriesPerDay:
        prev7.reduce((sum, d) => sum + d.caloriesBurned, 0) / prev7.length,
      consistency: (prev7.filter((d) => d.workoutCount > 0).length / 7) * 100,
    };

    return { last7Stats, prev7Stats };
  }, [last7, prev7]);

  const workoutTrend =
    stats.last7Stats.totalWorkouts > stats.prev7Stats.totalWorkouts
      ? 'up'
      : stats.last7Stats.totalWorkouts < stats.prev7Stats.totalWorkouts
        ? 'down'
        : 'stable';

  const calorieChange =
    stats.last7Stats.avgCaloriesPerDay - stats.prev7Stats.avgCaloriesPerDay;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ACTIVITY TRENDING</Text>
      </View>

      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(123,97,255,0.06)', 'transparent']}
          style={styles.cardGlow}
        />

        {/* Mode toggle */}
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              mode === 'weekly' && styles.toggleOptionActive,
            ]}
            onPress={() => setMode('weekly')}
          >
            <Text
              style={[
                styles.toggleText,
                mode === 'weekly' && styles.toggleTextActive,
              ]}
            >
              Last 7 Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleOption,
              mode === 'comparison' && styles.toggleOptionActive,
            ]}
            onPress={() => setMode('comparison')}
          >
            <Text
              style={[
                styles.toggleText,
                mode === 'comparison' && styles.toggleTextActive,
              ]}
            >
              Week vs Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleOption,
              mode === 'averages' && styles.toggleOptionActive,
            ]}
            onPress={() => setMode('averages')}
          >
            <Text
              style={[
                styles.toggleText,
                mode === 'averages' && styles.toggleTextActive,
              ]}
            >
              Averages
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          {chartData.datasets.length > 0 ? (
            <BarChart
              data={chartData}
              width={320}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(123, 97, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(122, 122, 122, ${opacity})`,
                barPercentage: 0.7,
              }}
              showValuesOnTopOfBars
              fromZero
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>No activity data available</Text>
            </View>
          )}
        </View>

        {/* Activity metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.metricsTitle}>Performance Metrics</Text>

          <View style={styles.metricGrid}>
            {/* Workouts */}
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Activity size={16} color="#8B7CFF" />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Workouts This Week</Text>
                <Text style={styles.metricValue}>
                  {stats.last7Stats.totalWorkouts}/7 days
                </Text>
              </View>
              <Text
                style={[
                  styles.metricTrend,
                  {
                    color:
                      workoutTrend === 'up'
                        ? '#52C77C'
                        : workoutTrend === 'down'
                          ? '#FF6B6B'
                          : '#8A8A8A',
                  },
                ]}
              >
                {workoutTrend === 'up' ? '↑' : workoutTrend === 'down' ? '↓' : '→'}
              </Text>
            </View>

            {/* Calories burned */}
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Flame size={16} color="#FF8C42" />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Avg Calories/Day</Text>
                <Text style={styles.metricValue}>
                  {Math.round(stats.last7Stats.avgCaloriesPerDay)} cal
                </Text>
              </View>
              <Text
                style={[
                  styles.metricTrend,
                  {
                    color: calorieChange > 10 ? '#52C77C' : '#FF6B6B',
                  },
                ]}
              >
                {calorieChange > 0 ? '+' : ''}{Math.round(calorieChange)}
              </Text>
            </View>

            {/* Consistency */}
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <TrendingUp size={16} color="#4B9EFF" />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Consistency</Text>
                <Text style={styles.metricValue}>
                  {Math.round(stats.last7Stats.consistency)}%
                </Text>
              </View>
              <Text style={styles.metricTrend}>
                {stats.last7Stats.consistency >= 50 ? '✓' : '○'}
              </Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        {mode === 'comparison' && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Week-over-Week Summary</Text>
            <Text style={styles.summaryText}>
              This week: {stats.last7Stats.totalWorkouts} workouts ({Math.round(stats.last7Stats.consistency)}%
              consistent)
            </Text>
            <Text style={styles.summaryText}>
              Last week: {stats.prev7Stats.totalWorkouts} workouts ({Math.round(stats.prev7Stats.consistency)}%
              consistent)
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    marginHorizontal: 18,
    marginBottom: 100,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '800',
    color: '#7B7B7B',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE6DA',
    overflow: 'hidden',
  },

  cardGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 999,
  },

  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F8F6F2',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },

  toggleOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  toggleOptionActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1ECFF',
  },

  toggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
  },

  toggleTextActive: {
    color: '#8B7CFF',
  },

  chartContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },

  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 13,
    color: '#8A8A8A',
  },

  metricsSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1ECE5',
  },

  metricsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7B7B7B',
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  metricGrid: {
    gap: 10,
  },

  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(123,97,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  metricInfo: {
    flex: 1,
  },

  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
  },

  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111111',
    marginTop: 2,
  },

  metricTrend: {
    fontSize: 16,
    fontWeight: '700',
  },

  summaryCard: {
    marginTop: 14,
    backgroundColor: '#F6F2FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B7CFF',
    marginBottom: 8,
  },

  summaryText: {
    fontSize: 11,
    color: '#5D54A4',
    lineHeight: 16,
    marginBottom: 4,
  },
});
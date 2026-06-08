import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { useAuth } from '../context/AuthContext';

type TrendingMode = 'weekly' | 'comparison' | 'averages';

export function NutritionTrending({ mode, setMode }) {
  const { dailyData } = useHistoricalData();
  const { profile } = useAuth();

  const targets = {
    calories: profile?.target_calories || 2000,
    protein: profile?.target_protein || 150,
    carbs: 250,
    fats: 80,
    fiber: 30,
  };

  // Prepare chart data based on mode
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
            label: 'Calories',
            data: last7.map((d) => d.calories),
            fillShadowGradientFrom: '#FF8C42',
            fillShadowGradientTo: '#FF8C42',
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
            data: last7.map((d) => d.calories),
            color: (opacity = 1) => `rgba(123, 97, 255, ${opacity})`,
          },
          {
            label: 'Last Week',
            data: prev7.map((d) => d.calories),
            color: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`,
          },
        ],
      };
    } else {
      // Averages
      const last7 = dailyData.slice(-7);
      const prev7 = dailyData.length >= 14 ? dailyData.slice(-14, -7) : last7;

      const last7Avg =
        last7.reduce((sum, d) => sum + d.calories, 0) / last7.length;
      const prev7Avg =
        prev7.reduce((sum, d) => sum + d.calories, 0) / prev7.length;

      return {
        labels: ['Last Week Avg', 'This Week Avg'],
        datasets: [
          {
            data: [prev7Avg, last7Avg],
            color: (opacity = 1) => `rgba(123, 97, 255, ${opacity})`,
          },
        ],
      };
    }
  }, [dailyData, mode]);

  // Calculate summary stats
  const last7 = dailyData.slice(-7);
  const prev7 = dailyData.length >= 14 ? dailyData.slice(-14, -7) : last7;

  const stats = useMemo(() => {
    const last7Avg = {
      calories: last7.reduce((sum, d) => sum + d.calories, 0) / last7.length,
      protein: last7.reduce((sum, d) => sum + d.protein, 0) / last7.length,
      carbs: last7.reduce((sum, d) => sum + d.carbs, 0) / last7.length,
      fats: last7.reduce((sum, d) => sum + d.fats, 0) / last7.length,
      fiber: last7.reduce((sum, d) => sum + d.fiber, 0) / last7.length,
    };

    const prev7Avg = {
      calories: prev7.reduce((sum, d) => sum + d.calories, 0) / prev7.length,
      protein: prev7.reduce((sum, d) => sum + d.protein, 0) / prev7.length,
      carbs: prev7.reduce((sum, d) => sum + d.carbs, 0) / prev7.length,
      fats: prev7.reduce((sum, d) => sum + d.fats, 0) / prev7.length,
      fiber: prev7.reduce((sum, d) => sum + d.fiber, 0) / prev7.length,
    };

    return { last7Avg, prev7Avg };
  }, [last7, prev7]);

  const macros = [
    { name: 'Protein', key: 'protein', value: stats.last7Avg.protein, target: targets.protein, color: '#8B7CFF', unit: 'g' },
    { name: 'Carbs', key: 'carbs', value: stats.last7Avg.carbs, target: targets.carbs, color: '#4B9EFF', unit: 'g' },
    { name: 'Fats', key: 'fats', value: stats.last7Avg.fats, target: targets.fats, color: '#FF8C42', unit: 'g' },
    { name: 'Fiber', key: 'fiber', value: stats.last7Avg.fiber, target: targets.fiber, color: '#59A95D', unit: 'g' },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>NUTRITION TRENDING</Text>
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
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffa726',
                },
                barPercentage: 0.5,
              }}
              showValuesOnTopOfBars
              fromZero
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>No data available</Text>
            </View>
          )}
        </View>

        {/* Macro breakdown */}
        <View style={styles.macroSection}>
          <Text style={styles.macroTitle}>Macro Breakdown (Daily Average)</Text>

          <View style={styles.macroGrid}>
            {macros.map((macro) => (
              <View key={macro.key} style={styles.macroItem}>
                <View
                  style={[
                    styles.macroIndicator,
                    { backgroundColor: macro.color },
                  ]}
                />
                <View style={styles.macroContent}>
                  <Text style={styles.macroName}>{macro.name}</Text>
                  <Text style={styles.macroValue}>
                    {Math.round(macro.value)}/{macro.target}{macro.unit}
                  </Text>
                </View>
                <View style={styles.macroBar}>
                  <View
                    style={[
                      styles.macroBarFill,
                      {
                        width: `${Math.min(100, (macro.value / macro.target) * 100)}%`,
                        backgroundColor: macro.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Comparison info */}
        {mode === 'comparison' && (
          <View style={styles.comparisonInfo}>
            <Text style={styles.infoLabel}>Week-over-Week Change</Text>
            <Text style={styles.infoValue}>
              {Math.round(stats.last7Avg.calories)} cal
              {stats.last7Avg.calories > stats.prev7Avg.calories ? ' ↑' : ' ↓'}
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

  macroSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1ECE5',
  },

  macroTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7B7B7B',
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  macroGrid: {
    gap: 10,
  },

  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  macroIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },

  macroContent: {
    width: 100,
  },

  macroName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5D5D5D',
  },

  macroValue: {
    fontSize: 10,
    color: '#8A8A8A',
    marginTop: 2,
  },

  macroBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E8E0F8',
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: 'hidden',
  },

  macroBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  comparisonInfo: {
    marginTop: 14,
    backgroundColor: '#F6F2FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B7CFF',
  },

  infoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8B7CFF',
    marginTop: 4,
  },
});
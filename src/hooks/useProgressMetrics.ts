import { useMemo } from 'react';
import { useHistoricalData } from './useHistoricalData';
import { useAuth } from '../context/AuthContext';

export interface MetricTrend {
  current: number;
  previous: number;
  change: number;
  percentChange: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ProgressMetrics {
  overallMetrics: {
    weightLoss: number;
    daysElapsed: number;
    weeklyLossRate: number;
    weeksRemaining: number;
    percentageComplete: number;
    startDate: string;
  };
  weekComparisonMetrics: {
    calories: MetricTrend;
    protein: MetricTrend;
    water: MetricTrend;
    workout: MetricTrend;
    sleep: MetricTrend;
  };
  trends: {
    weight: 'up' | 'down' | 'stable';
    calories: 'up' | 'down' | 'stable';
    protein: 'up' | 'down' | 'stable';
    activity: 'up' | 'down' | 'stable';
  };
  autoDetected: {
    positives: string[];
    negatives: string[];
  };
}

function calculateMetricTrend(current: number, previous: number): MetricTrend {
  const change = current - previous;
  const percentChange = previous !== 0 ? (change / previous) * 100 : 0;
  let trend: 'up' | 'down' | 'stable' = 'stable';

  if (Math.abs(percentChange) < 5) {
    trend = 'stable';
  } else if (percentChange > 0) {
    trend = 'up';
  } else {
    trend = 'down';
  }

  return { current, previous, change, percentChange, trend };
}

export function useProgressMetrics(): ProgressMetrics {
  const { firstWeightEntry, currentWeight, targetWeight, dailyData } = useHistoricalData();
  const { profile } = useAuth();

  return useMemo(() => {
    const positives: string[] = [];
    const negatives: string[] = [];

    if (!firstWeightEntry || !currentWeight || !targetWeight || dailyData.length === 0) {
      return {
        overallMetrics: {
          weightLoss: 0,
          daysElapsed: 0,
          weeklyLossRate: 0,
          weeksRemaining: 0,
          percentageComplete: 0,
          startDate: '',
        },
        weekComparisonMetrics: {
          calories: { current: 0, previous: 0, change: 0, percentChange: 0, trend: 'stable' },
          protein: { current: 0, previous: 0, change: 0, percentChange: 0, trend: 'stable' },
          water: { current: 0, previous: 0, change: 0, percentChange: 0, trend: 'stable' },
          workout: { current: 0, previous: 0, change: 0, percentChange: 0, trend: 'stable' },
          sleep: { current: 0, previous: 0, change: 0, percentChange: 0, trend: 'stable' },
        },
        trends: { weight: 'stable', calories: 'stable', protein: 'stable', activity: 'stable' },
        autoDetected: { positives: [], negatives: [] },
      };
    }

    // Overall metrics
    const startDate = new Date(firstWeightEntry.date);
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weightLoss = firstWeightEntry.weight - currentWeight;
    const weeklyLossRate = daysElapsed > 0 ? (weightLoss / daysElapsed) * 7 : 0;
    const remainingWeight = currentWeight - targetWeight;
    const weeksRemaining = weeklyLossRate > 0 ? Math.ceil(remainingWeight / weeklyLossRate) : 0;
    const totalLossNeeded = firstWeightEntry.weight - targetWeight;
    const percentageComplete = totalLossNeeded > 0 ? (weightLoss / totalLossNeeded) * 100 : 0;

    // Week comparison metrics
    const last7Days = dailyData.slice(-7);
    const previous7Days = dailyData.length >= 14 ? dailyData.slice(-14, -7) : dailyData.slice(0, 7);

    const last7Avg = {
      calories: last7Days.reduce((sum, d) => sum + d.calories, 0) / last7Days.length,
      protein: last7Days.reduce((sum, d) => sum + d.protein, 0) / last7Days.length,
      water: last7Days.reduce((sum, d) => sum + d.water, 0) / last7Days.length,
      workouts: last7Days.filter(d => d.workoutCount > 0).length,
      sleep: last7Days.reduce((sum, d) => sum + d.sleep, 0) / last7Days.length,
    };

    const prev7Avg = {
      calories: previous7Days.reduce((sum, d) => sum + d.calories, 0) / previous7Days.length,
      protein: previous7Days.reduce((sum, d) => sum + d.protein, 0) / previous7Days.length,
      water: previous7Days.reduce((sum, d) => sum + d.water, 0) / previous7Days.length,
      workouts: previous7Days.filter(d => d.workoutCount > 0).length,
      sleep: previous7Days.reduce((sum, d) => sum + d.sleep, 0) / previous7Days.length,
    };

    // Auto-detect positives and negatives
    const calorieGoal = profile?.target_calories || 2000;
    const proteinGoal = profile?.target_protein || 150;
    const waterGoal = 2500;

    // Protein consistency
    const proteinDaysCompleted = last7Days.filter(d => d.protein >= proteinGoal).length;
    if (proteinDaysCompleted >= 5) {
      positives.push('Strong protein consistency this week');
    } else if (proteinDaysCompleted <= 2) {
      negatives.push('Protein intake falling short');
    }

    // Workout consistency
    const workoutDaysLastWeek = last7Days.filter(d => d.workoutCount > 0).length;
    if (workoutDaysLastWeek >= 5) {
      positives.push('Excellent workout adherence');
    } else if (workoutDaysLastWeek <= 2) {
      negatives.push('Workout frequency needs improvement');
    }

    // Hydration
    const hydrationDaysGood = last7Days.filter(d => d.water >= waterGoal).length;
    if (hydrationDaysGood >= 5) {
      positives.push('Hydration goals mostly met');
    } else if (hydrationDaysGood <= 2) {
      negatives.push('Inconsistent hydration tracking');
    }

    // Sleep
    const sleepDaysGood = last7Days.filter(d => d.sleep >= 7).length;
    if (sleepDaysGood >= 5) {
      positives.push('Recovery improving with consistent sleep');
    } else if (sleepDaysGood <= 2) {
      negatives.push('Sleep quality needs attention');
    }

    // Calorie management
    const calorieCompliance = last7Days.filter(
      d => d.calories >= calorieGoal * 0.85 && d.calories <= calorieGoal * 1.15
    ).length;
    if (calorieCompliance >= 5) {
      positives.push('Excellent calorie control');
    } else if (calorieCompliance <= 2) {
      negatives.push('Calorie intake inconsistent');
    }

    // Weight trend
    const recentWeights = dailyData.slice(-7).map(() => currentWeight); // Simplified
    const weightTrend = weightLoss > 0 ? 'down' : weightLoss < 0 ? 'up' : 'stable';

    // Calorie trend
    const calorieChange = last7Avg.calories - prev7Avg.calories;
    const calorieTrend = calorieChange > 50 ? 'up' : calorieChange < -50 ? 'down' : 'stable';

    const metrics: ProgressMetrics = {
      overallMetrics: {
        weightLoss: Math.round(weightLoss * 10) / 10,
        daysElapsed,
        weeklyLossRate: Math.round(weeklyLossRate * 10) / 10,
        weeksRemaining: Math.max(0, weeksRemaining),
        percentageComplete: Math.round(percentageComplete),
        startDate: firstWeightEntry.date,
      },
      weekComparisonMetrics: {
        calories: calculateMetricTrend(last7Avg.calories, prev7Avg.calories),
        protein: calculateMetricTrend(last7Avg.protein, prev7Avg.protein),
        water: calculateMetricTrend(last7Avg.water, prev7Avg.water),
        workout: calculateMetricTrend(last7Avg.workouts, prev7Avg.workouts),
        sleep: calculateMetricTrend(last7Avg.sleep, prev7Avg.sleep),
      },
      trends: {
        weight: weightTrend,
        calories: calorieTrend,
        protein: last7Avg.protein > prev7Avg.protein ? 'up' : 'down',
        activity: last7Avg.workouts > prev7Avg.workouts ? 'up' : 'down',
      },
      autoDetected: {
        positives,
        negatives,
      },
    };

    return metrics;
  }, [firstWeightEntry, currentWeight, targetWeight, dailyData, profile]);
}

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHealth } from '../context/HealthContext';
import { supabase } from '../services/supabase';

interface DailyData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  water: number;
  sleep: number;
  workoutCount: number;
  caloriesBurned: number;
}

interface HistoricalData {
  firstWeightEntry: { weight: number; date: string } | null;
  currentWeight: number;
  targetWeight: number;
  dailyData: DailyData[];
  weekData: any[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useHistoricalData(): HistoricalData {
  const { user } = useAuth();
  const { healthData } = useHealth();
  const { profile } = useAuth();

  const [firstWeightEntry, setFirstWeightEntry] = useState<{ weight: number; date: string } | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

      // Fetch all logs for last 30 days
      const [foodLogs, activityLogs, hydrationLogs, sleepLogs] = await Promise.all([
        supabase
          .from('food_logs')
          .select('created_at, calories, protein, carbs, fats, fiber')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgoISO),

        supabase
          .from('activity_logs')
          .select('created_at, calories_burned')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgoISO),

        supabase
          .from('hydration_logs')
          .select('created_at, amount')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgoISO),

        supabase
          .from('sleep_logs')
          .select('created_at, hours')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgoISO),
      ]);

      // Group by date
      const dataByDate = new Map<string, DailyData>();

      // Initialize all dates in range
      for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dataByDate.set(dateStr, {
          date: dateStr,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          fiber: 0,
          water: 0,
          sleep: 0,
          workoutCount: 0,
          caloriesBurned: 0,
        });
      }

      // Aggregate food logs
      foodLogs.data?.forEach((log: any) => {
        const dateStr = log.created_at.split('T')[0];
        const entry = dataByDate.get(dateStr);
        if (entry) {
          entry.calories += Number(log.calories) || 0;
          entry.protein += Number(log.protein) || 0;
          entry.carbs += Number(log.carbs) || 0;
          entry.fats += Number(log.fats) || 0;
          entry.fiber += Number(log.fiber) || 0;
        }
      });

      // Aggregate activity logs
      activityLogs.data?.forEach((log: any) => {
        const dateStr = log.created_at.split('T')[0];
        const entry = dataByDate.get(dateStr);
        if (entry) {
          entry.workoutCount += 1;
          entry.caloriesBurned += Number(log.calories_burned) || 0;
        }
      });

      // Aggregate hydration logs
      hydrationLogs.data?.forEach((log: any) => {
        const dateStr = log.created_at.split('T')[0];
        const entry = dataByDate.get(dateStr);
        if (entry) {
          entry.water += Number(log.amount) || 0;
        }
      });

      // Aggregate sleep logs
      sleepLogs.data?.forEach((log: any) => {
        const dateStr = log.created_at.split('T')[0];
        const entry = dataByDate.get(dateStr);
        if (entry) {
          entry.sleep = Math.max(entry.sleep, Number(log.hours) || 0);
        }
      });

      const sortedDaily = Array.from(dataByDate.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setDailyData(sortedDaily);

      // Try to get first weight entry from profiles table (initial_weight)
      const initialWeight = profile?.initial_weight;
      const profileCreated = profile?.created_at;

      if (initialWeight && profileCreated) {
        setFirstWeightEntry({
          weight: initialWeight,
          date: profileCreated.split('T')[0],
        });
      } else {
        // Fallback: use current weight as first entry if no initial weight found
        setFirstWeightEntry({
          weight: profile?.current_weight || 0,
          date: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  return {
    firstWeightEntry,
    currentWeight: profile?.current_weight || 0,
    targetWeight: profile?.target_weight || 0,
    dailyData,
    weekData: [],
    loading,
    error,
    refresh: fetchHistoricalData,
  };
}

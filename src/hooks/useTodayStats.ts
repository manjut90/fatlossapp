import {
  useEffect,
  useState,
  useCallback,
} from 'react';

import { supabase } from '../services/supabase';

export interface TodayStats {
  loading: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  water: number;
  sleep: number;
  workoutCompleted: boolean;
  caloriesBurned: number;
  streak: number;
  xp: number;
  refreshTodayStats: () => void;
}

export default function useTodayStats(): TodayStats {
  const [loading, setLoading] = useState(true);
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [fiber, setFiber] = useState(0);
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  const fetchTodayStats = useCallback(async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.id) {
        setLoading(false);
        return;
      }

      const userId = user.id;

      // Today's date range
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const startISO = start.toISOString();
      const today = start.toISOString().split('T')[0];

      // Run all queries in parallel
      const [
        foodResult,
        waterResult,
        sleepResult,
        activityResult,
        progressResult,
        xpResult,
      ] = await Promise.all([
        // Food logs — sum real macros
        supabase
          .from('food_logs')
          .select('calories, protein, carbs, fats, fiber')
          .eq('user_id', userId)
          .gte('created_at', startISO),

        // Water logs — sum amount
        supabase
          .from('hydration_logs')
          .select('amount')
          .eq('user_id', userId)
          .gte('created_at', startISO),

        // Sleep — get latest entry today
        supabase
          .from('sleep_logs')
          .select('hours')
          .eq('user_id', userId)
          .gte('created_at', startISO)
          .order('created_at', { ascending: false })
          .limit(1),

        // Activity — check if worked out + sum calories burned
        supabase
          .from('activity_logs')
          .select('calories_burned')
          .eq('user_id', userId)
          .gte('created_at', startISO),

        // Streak from user_progress
        supabase
          .from('user_progress')
          .select('streak')
          .eq('user_id', userId)
          .maybeSingle(),

        // XP earned today
        supabase
          .from('xp_logs')
          .select('xp')
          .eq('user_id', userId)
          .gte('created_at', startISO),
      ]);

      // ── FOOD ──
      if (foodResult.data && foodResult.data.length > 0) {
        const totalCalories = foodResult.data.reduce((sum, row) => sum + (Number(row.calories) || 0), 0);
        const totalProtein = foodResult.data.reduce((sum, row) => sum + (Number(row.protein) || 0), 0);
        const totalCarbs = foodResult.data.reduce((sum, row) => sum + (Number(row.carbs) || 0), 0);
        const totalFats = foodResult.data.reduce((sum, row) => sum + (Number(row.fats) || 0), 0);
        const totalFiber = foodResult.data.reduce((sum, row) => sum + (Number(row.fiber) || 0), 0);

        setCalories(Math.round(totalCalories));
        setProtein(Math.round(totalProtein));
        setCarbs(Math.round(totalCarbs));
        setFats(Math.round(totalFats));
        setFiber(Math.round(totalFiber));
      } else {
        setCalories(0);
        setProtein(0);
        setCarbs(0);
        setFats(0);
        setFiber(0);
      }

      // ── WATER ──
      if (waterResult.data && waterResult.data.length > 0) {
        const totalWater = waterResult.data.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
        setWater(Math.round(totalWater));
      } else {
        setWater(0);
      }

      // ── SLEEP ──
      if (sleepResult.data && sleepResult.data.length > 0) {
        setSleep(Number(sleepResult.data[0].hours) || 0);
      } else {
        setSleep(0);
      }

      // ── ACTIVITY ──
      if (activityResult.data && activityResult.data.length > 0) {
        setWorkoutCompleted(true);
        const totalBurned = activityResult.data.reduce((sum, row) => sum + (Number(row.calories_burned) || 0), 0);
        setCaloriesBurned(Math.round(totalBurned));
      } else {
        setWorkoutCompleted(false);
        setCaloriesBurned(0);
      }

      // ── STREAK ──
      if (progressResult.data) {
        setStreak(progressResult.data.streak || 0);
      }

      // ── XP ──
      if (xpResult.data && xpResult.data.length > 0) {
        const totalXp = xpResult.data.reduce((sum, row) => sum + (Number(row.xp) || 0), 0);
        setXp(Math.round(totalXp));
      } else {
        setXp(0);
      }

    } catch (err) {
      console.log('useTodayStats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayStats();
  }, [fetchTodayStats]);

  return {
    loading,
    calories,
    protein,
    carbs,
    fats,
    fiber,
    water,
    sleep,
    workoutCompleted,
    caloriesBurned,
    streak,
    xp,
    refreshTodayStats: fetchTodayStats,
  };
}

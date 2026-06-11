import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { supabase } from '../services/supabase';
import { addFood } from '../services/food';
import { addActivity } from '../services/activity';
import { addWater } from '../services/hydration';
import { addSleep } from '../services/sleep';
import { awardCheckInXp } from '../services/xp';
import { updateDailyStreak } from '../services/streaks';
import { calculateDailyScore } from '../utils/calculateDailyScore';
import { calculateXP } from '../utils/calculateXP';

const HealthContext = createContext<any>(null);

const XP_PER_CHECKIN = {
  food: 12,
  water: 5,
  activity: 20,
  sleep: 10,
};

const DEFAULT_HEALTH_DATA = {
  todayCalories: 0,
  todayProtein: 0,
  todayCarbs: 0,
  todayFats: 0,
  todayFiber: 0,
  todayWater: 0,
  todayWorkout: false,
  todaySleep: 0,
  todayCaloriesBurned: 0,
  dailyScore: 0,
  xp: 0,
  totalXp: 0,
  level: 1,
  streak: 0,
  timeline: [],
};

export function HealthProvider({ children }: any) {
  const [healthData, setHealthData] = useState(DEFAULT_HEALTH_DATA);
  const [initialized, setInitialized] = useState(false);

  // ==========================================
  // LOAD TODAY'S REAL DATA FROM SUPABASE
  // ==========================================

  const loadTodayData = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.id) return;

      const userId = user.id;

      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const startISO = start.toISOString();

      const [
        foodResult,
        waterResult,
        sleepResult,
        activityResult,
        progressResult,
        xpResult,
      ] = await Promise.all([
        supabase
          .from('food_logs')
          .select('calories, protein, carbs, fats, fiber')
          .eq('user_id', userId)
          .gte('created_at', startISO),

        supabase
          .from('hydration_logs')
          .select('amount')
          .eq('user_id', userId)
          .gte('created_at', startISO),

        supabase
          .from('sleep_logs')
          .select('hours')
          .eq('user_id', userId)
          .gte('created_at', startISO)
          .order('created_at', { ascending: false })
          .limit(1),

        supabase
          .from('activity_logs')
          .select('calories_burned')
          .eq('user_id', userId)
          .gte('created_at', startISO),

        supabase
          .from('user_progress')
          .select('streak,xp')
          .eq('user_id', userId)
          .maybeSingle(),

        supabase
          .from('xp_logs')
          .select('xp')
          .eq('user_id', userId)
          .gte('created_at', startISO),
      ]);

      // Sum food macros
      const todayCalories = foodResult.data?.reduce((s, r) => s + (Number(r.calories) || 0), 0) ?? 0;
      const todayProtein = foodResult.data?.reduce((s, r) => s + (Number(r.protein) || 0), 0) ?? 0;
      const todayCarbs = foodResult.data?.reduce((s, r) => s + (Number(r.carbs) || 0), 0) ?? 0;
      const todayFats = foodResult.data?.reduce((s, r) => s + (Number(r.fats) || 0), 0) ?? 0;
      const todayFiber = foodResult.data?.reduce((s, r) => s + (Number(r.fiber) || 0), 0) ?? 0;

      // Sum water
      const todayWater = waterResult.data?.reduce((s, r) => s + (Number(r.amount) || 0), 0) ?? 0;

      // Sleep
      const todaySleep = sleepResult.data?.[0]?.hours ?? 0;

      // Activity
      const todayWorkout = (activityResult.data?.length ?? 0) > 0;
      const todayCaloriesBurned = activityResult.data?.reduce((s, r) => s + (Number(r.calories_burned) || 0), 0) ?? 0;

      // Streak
      const streak = progressResult.data?.streak ?? 0;
      const totalXp =
  progressResult.data?.xp ?? 0;

      // XP
      const xp = xpResult.data?.reduce((s, r) => s + (Number(r.xp) || 0), 0) ?? 0;

      // Daily score
      const dailyScore = calculateDailyScore({
        calories: todayCalories,
        water: todayWater,
        workout: todayWorkout,
        sleep: todaySleep,
      });

      const newHealthData = {
        todayCalories: Math.round(todayCalories),
        todayProtein: Math.round(todayProtein),
        todayCarbs: Math.round(todayCarbs),
        todayFats: Math.round(todayFats),
        todayFiber: Math.round(todayFiber),
        todayWater: Math.round(todayWater),
        todayWorkout,
        todaySleep: Number(todaySleep),
        todayCaloriesBurned: Math.round(todayCaloriesBurned),
        dailyScore,
        xp: Math.round(xp),
        totalXp: Math.round(totalXp),
        level: Math.floor(totalXp / 500) + 1,
        streak,
        timeline: [],
      };
      setHealthData(newHealthData);
    } catch (err) {
      // silent
    } finally {
      setInitialized(true);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadTodayData();
  }, [loadTodayData]);

  // ==========================================
  // UPDATE HEALTH DATA
  // ==========================================

  const updateHealthData = (updates: any) => {
    setHealthData((prev: any) => ({ ...prev, ...updates }));
  };

  // ==========================================
  // ADD PARSED CHECK-IN
  // ==========================================

  const addParsedCheckIn = async (parsed: any) => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user?.id) throw new Error('User not authenticated');

      const user_id = user.id;
      const tasks: Promise<any>[] = [];
      let xpAwarded = 0;

      if (parsed.calories > 0) {
        tasks.push(
          addFood({
            user_id,
            meal_name: parsed.meal_name || 'Meal',
            calories: parsed.calories || 0,
            protein: parsed.protein || 0,
            carbs: parsed.carbs || 0,
            fats: parsed.fats || 0,
            fiber: parsed.fiber || 0,
            meal_type: parsed.meal_type || 'snack',
            created_at: new Date().toISOString(),
          }),
        );
        xpAwarded += XP_PER_CHECKIN.food;
      }

      if (parsed.water > 0) {
        tasks.push(addWater(parsed.water * 1000, new Date().toISOString(), user_id));
        xpAwarded += XP_PER_CHECKIN.water;
      }

      if (parsed.workout) {
        tasks.push(
          addActivity({
            user_id,
            activity_name: parsed.activity_name || 'Workout',
            duration: parsed.duration || 30,
            calories_burned: parsed.calories_burned || 0,
          }),
        );
        xpAwarded += XP_PER_CHECKIN.activity;
      }

      if (parsed.sleep > 0) {
        tasks.push(
          addSleep({
            user_id,
            hours: parsed.sleep || 0,
            quality: parsed.quality || 'good',
            date: new Date().toISOString(),
          }),
        );
        xpAwarded += XP_PER_CHECKIN.sleep;
      }

      if (tasks.length > 0) {
        await Promise.all(tasks);
        await updateDailyStreak(user_id);
      }

      if (xpAwarded > 0) {
        await awardCheckInXp(xpAwarded, 'Daily Check-In', user_id);
      }

      // Reload fresh data from Supabase after saving
      await loadTodayData();

    } catch (err) {
      // silent
    }
  };

  // ==========================================
  // RESET DAILY DATA
  // ==========================================

  const resetDailyData = () => {
    setHealthData((prev: any) => ({
      ...prev,
      todayCalories: 0,
      todayProtein: 0,
      todayCarbs: 0,
      todayFats: 0,
      todayFiber: 0,
      todayWater: 0,
      todayWorkout: false,
      todaySleep: 0,
      todayCaloriesBurned: 0,
      dailyScore: 0,
      xp: 0,
      timeline: [],
    }));
  };

  return (
    <HealthContext.Provider
      value={{
        healthData,
        initialized,
        updateHealthData,
        addParsedCheckIn,
        resetDailyData,
        refreshHealthData: loadTodayData,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  return useContext(HealthContext);
}
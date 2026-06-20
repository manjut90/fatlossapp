import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { Alert } from 'react-native';

import { supabase } from '../services/supabase';
import { addFood } from '../services/food';
import { addActivity } from '../services/activity';
import { addWater } from '../services/hydration';
import { addSleep } from '../services/sleep';
import { awardCheckInXp } from '../services/xp';
import { updateDailyStreak } from '../services/streaks';
import { calculateDailyScore } from '../utils/calculateDailyScore';
import { calculateXP } from '../utils/calculateXP';
import { getLevelFromXP } from '../constants/levels';
import { getUserTargets } from '../utils/healthCalculations';

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
  const [pendingLevelUp, setPendingLevelUp] = useState(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const previousXPRef = useRef<number | null>(null);

  // ==========================================
  // LOAD TODAY'S REAL DATA FROM SUPABASE
  // ==========================================

  const loadTodayData = useCallback(async () => {
    try {
      setLoadError(null);
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
        profileResult,
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
          .select('streak,xp,last_celebrated_level')
          .eq('user_id', userId)
          .maybeSingle(),

        supabase
          .from('xp_logs')
          .select('xp')
          .eq('user_id', userId)
          .gte('created_at', startISO),

        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
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
      const totalXp = progressResult.data?.xp ?? 0;

      // XP
      const xp = xpResult.data?.reduce((s, r) => s + (Number(r.xp) || 0), 0) ?? 0;

      // Daily score
      const targets = getUserTargets(profileResult.data);
      const dailyScore = calculateDailyScore({
        calories: todayCalories,
        water: todayWater,
        workout: todayWorkout,
        sleep: todaySleep,
      }, targets);

      const levelInfo = getLevelFromXP(totalXp);



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
        level: levelInfo.level,
        streak,
        timeline: [],
        lastCelebratedLevel:
          progressResult.data?.last_celebrated_level ?? 0,
      };
      
      setHealthData(newHealthData);
    } catch (err) {
      console.error('[HealthContext] loadTodayData failed:', err);
      setLoadError(
        'Could not load your latest health data. Pull to refresh or check your connection.',
      );
    } finally {
      setInitialized(true);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadTodayData();
  }, [loadTodayData]);

  useEffect(() => {
    const currentXP = healthData?.totalXp ?? 0;

    // first render
    if (previousXPRef.current === null) {
      previousXPRef.current = currentXP;
      return;
    }

    // ignore no change or decrease
    if (currentXP <= previousXPRef.current) {
      previousXPRef.current = currentXP;
      return;
    }

    const previousLevel =
      getLevelFromXP(previousXPRef.current).level;

    const newLevel =
      getLevelFromXP(currentXP).level;

    previousXPRef.current = currentXP;


    if (
      newLevel > previousLevel &&
      newLevel > (healthData?.lastCelebratedLevel ?? 0)
    ) {

      const levelInfo = getLevelFromXP(currentXP);


      setPendingLevelUp({
        level: levelInfo.level,
        title: levelInfo.title,
      });
    }
  }, [healthData?.totalXp]);

  // ==========================================
  // UPDATE HEALTH DATA
  // ==========================================

  const updateHealthData = (updates: any) => {
    setHealthData((prev: any) => ({ ...prev, ...updates }));
  };

  const clearPendingLevelUp = () => {
    setPendingLevelUp(null);
  };

  // ==========================================
  // ADD PARSED CHECK-IN
  // ==========================================

  const addParsedCheckIn = async (parsed: any) => {
    // Tracks which check-in types succeeded so XP/streak only reflect what
    // actually persisted, and so the failure alert can name exactly what
    // didn't save (instead of a generic "something went wrong").
    type CheckInType = 'food' | 'water' | 'activity' | 'sleep';
    const tasks: { type: CheckInType; promise: Promise<any> }[] = [];

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user?.id) throw new Error('User not authenticated');

      const user_id = user.id;

      if (parsed.calories > 0) {
        tasks.push({
          type: 'food',
          promise: addFood({
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
        });
      }

      if (parsed.water > 0) {
        tasks.push({
          type: 'water',
          promise: addWater(parsed.water * 1000, new Date().toISOString(), user_id),
        });
      }

      if (parsed.workout) {
        tasks.push({
          type: 'activity',
          promise: addActivity({
            user_id,
            activity_name: parsed.activity_name || 'Workout',
            duration: parsed.duration || 30,
            calories_burned: parsed.calories_burned || 0,
          }),
        });
      }

      if (parsed.sleep > 0) {
        tasks.push({
          type: 'sleep',
          promise: addSleep({
            user_id,
            hours: parsed.sleep || 0,
            quality: parsed.quality || 'good',
            date: new Date().toISOString(),
          }),
        });
      }

      if (tasks.length === 0) {
        await loadTodayData();
        return;
      }

      // allSettled (not all): one rejected log-type must not silently
      // discard the others that actually succeeded.
      const settled = await Promise.allSettled(tasks.map(t => t.promise));

      const succeeded: CheckInType[] = [];
      const failed: CheckInType[] = [];
      settled.forEach((result, i) => {
        const type = tasks[i].type;
        // Service functions (addFood/addWater/addActivity/addSleep) catch
        // their own errors and resolve with { success: false } instead of
        // rejecting — a fulfilled promise alone does not mean the write
        // happened. Both conditions are required.
        if (result.status === 'fulfilled' && result.value?.success === true) {
          succeeded.push(type);
        } else {
          failed.push(type);
          const reason =
            result.status === 'rejected' ? result.reason : result.value;
          console.error(`[HealthContext] addParsedCheckIn: ${type} log failed:`, reason);
        }
      });

      const xpAwarded = succeeded.reduce((sum, type) => sum + XP_PER_CHECKIN[type], 0);

      // Streak/XP failures are independent of check-in failures — handle
      // separately so one doesn't mask or block the other in logs/alerts.
      let streakFailed = false;
      let xpFailed = false;

      if (succeeded.length > 0) {
        try {
          await updateDailyStreak(user_id);
        } catch (streakErr) {
          streakFailed = true;
          console.error('[HealthContext] addParsedCheckIn: streak update failed:', streakErr);
        }
      }

      if (xpAwarded > 0) {
        try {
          await awardCheckInXp(xpAwarded, 'Daily Check-In', user_id);
        } catch (xpErr) {
          xpFailed = true;
          console.error('[HealthContext] addParsedCheckIn: XP award failed:', xpErr);
        }
      }

      // Always refresh, success or partial failure, so the UI reflects what
      // actually persisted rather than going stale relative to the DB.
      await loadTodayData();

      if (failed.length > 0 || streakFailed || xpFailed) {
        const label = (t: CheckInType) => t.charAt(0).toUpperCase() + t.slice(1);
        if (succeeded.length === 0) {
          // Total failure — caller's onSave/onSelect must not show a
          // success toast or close the sheet, so this re-throws below.
          Alert.alert(
            'Check-in failed',
            "Nothing saved. Check your connection and try again.",
          );
        } else {
          Alert.alert(
            'Partial save',
            `${failed.map(label).join(', ') || 'Some data'} didn't save${
              streakFailed || xpFailed ? ' (streak/XP may be out of sync)' : ''
            }. ${succeeded.map(label).join(', ')} saved okay.`,
          );
        }
      }

      if (succeeded.length === 0 && failed.length > 0) {
        throw new Error(`All check-in writes failed: ${failed.join(', ')}`);
      }

    } catch (err) {
      console.error('[HealthContext] addParsedCheckIn failed:', err);
      if (tasks.length === 0) {
        // Failed before any task was even built (e.g. auth lookup) —
        // nothing else above has alerted yet.
        Alert.alert(
          'Check-in failed',
          "Something didn't save. Check your connection and try again.",
        );
      }
      throw err; // surfaces to CheckInScreen's sheets so they don't close
                 // or show a success toast on a no-op
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
        loadError,
        pendingLevelUp,
        clearPendingLevelUp,
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
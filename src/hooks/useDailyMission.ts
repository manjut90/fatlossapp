import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHealth } from '../context/HealthContext';
import { supabase } from '../services/supabase';
import { awardCheckInXp } from '../services/xp';
import { updateDailyStreak } from '../services/streaks';
import { getFallbackTemplate } from '../constants/missionTemplates';

export interface Mission {
  title: string;
  description: string;
  category: 'movement' | 'hydration' | 'nutrition';
  xp: number;
}

export interface DailyMission {
  id: string;
  date: string;
  missions: Mission[];
  coach_message: string;
  completed_missions: number[];
}

interface UseDailyMissionResult {
  mission: DailyMission | null;
  loading: boolean;
  completeMission: (index: number) => Promise<void>;
}

export function useDailyMission(): UseDailyMissionResult {
  const { user } = useAuth();
  const { refreshHealthData } = useHealth();

  const [mission, setMission] = useState<DailyMission | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user?.id) return;
    fetchOrGenerate();
  }, [user?.id]);

  async function fetchOrGenerate() {
    setLoading(true);
    try {
      // 1. Check DB for existing mission today
      const { data: existing, error } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existing && !error) {
        setMission(existing as DailyMission);
        return;
      }

      // 2. Not found — invoke Edge Function
      const { data, error: fnError } = await supabase.functions.invoke(
        'generate-mission',
        { body: { user_id: user.id, date: today } }
      );

      if (fnError) throw fnError;
      setMission(data as DailyMission);

    } catch (err) {
      console.error('[useDailyMission] fetch/generate failed:', err);

      // 3. Last resort — local fallback (never crash HomeScreen)
      const fallback = getFallbackTemplate(today);
      setMission({
        id: 'fallback',
        date: today,
        missions: fallback.missions as Mission[],
        coach_message: fallback.coach_message,
        completed_missions: [],
      });
    } finally {
      setLoading(false);
    }
  }

  const completeMission = useCallback(async (index: number) => {
    if (!mission || !user?.id) return;

    // Guard: idempotent — ignore if already completed
    if (mission.completed_missions.includes(index)) return;

    const updatedCompleted = [...mission.completed_missions, index];
    const earnedXp = mission.missions[index]?.xp ?? 50;

    // Optimistic update — UI responds immediately
    setMission(prev =>
      prev ? { ...prev, completed_missions: updatedCompleted } : prev
    );

    try {
      await Promise.all([
        // Update completed_missions in daily_missions row
        // Skip DB write for fallback missions (no real row exists)
        mission.id !== 'fallback'
          ? supabase
              .from('daily_missions')
              .update({ completed_missions: updatedCompleted })
              .eq('id', mission.id)
              .eq('user_id', user.id)
          : Promise.resolve(),

        // Award XP — uses confirmed schema: { user_id, xp, reason }
        // src/services/xp.ts → awardCheckInXp(amount, reason, user_id)
        awardCheckInXp(earnedXp, 'Mission Complete', user.id),

        // Update streak — src/services/streaks.ts → updateDailyStreak(user_id)
        updateDailyStreak(user.id),
      ]);

      // Refresh HealthContext so HomeScreen XP + streak display updates
      await refreshHealthData();

    } catch (err) {
      console.error('[useDailyMission] completeMission failed:', err);

      // Rollback optimistic update on failure
      setMission(prev =>
        prev
          ? {
              ...prev,
              completed_missions: prev.completed_missions.filter(
                i => i !== index
              ),
            }
          : prev
      );
    }
  }, [mission, user?.id, refreshHealthData]);

  return { mission, loading, completeMission };
}
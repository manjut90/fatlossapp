import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHealth } from '../context/HealthContext';
import { MissionGenerationService, DailyMissionsJson } from '../services/missionGeneration';

export interface Mission {
  type: 'movement' | 'nutrition' | 'recovery';
  title: string;
  completed: boolean;
  xp: number;
}

export interface DailyMission {
  id: string;
  date: string;
  coach_message: string;
  missions: Mission[];
  completed_count: number;
  total_count: number;
  xp_reward: number;
}

interface UseDailyMissionResult {
  mission: DailyMission | null;
  loading: boolean;
  completeMission: (type: 'movement' | 'nutrition' | 'recovery') => Promise<void>;
  refresh: () => Promise<void>;
}

export function useDailyMission(): UseDailyMissionResult {
  const { user } = useAuth();
  const { refreshHealthData } = useHealth();

  const [mission, setMission] = useState<DailyMission | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTodaysMission = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const record = await MissionGenerationService.getTodaysMission(user.id);
      
      const json = record.missions_json as DailyMissionsJson;
      const missionsList: Mission[] = [
        { type: 'movement', title: json.movement.title, completed: json.movement.completed, xp: 15 },
        { type: 'nutrition', title: json.nutrition.title, completed: json.nutrition.completed, xp: 15 },
        { type: 'recovery', title: json.recovery.title, completed: json.recovery.completed, xp: 15 }
      ];

      setMission({
        id: record.id,
        date: record.date,
        coach_message: record.coach_message,
        missions: missionsList,
        completed_count: record.completed_count,
        total_count: record.total_count,
        xp_reward: record.xp_reward
      });
    } catch (err) {
      console.error('[useDailyMission] fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTodaysMission();
  }, [fetchTodaysMission]);

  const completeMission = useCallback(async (type: 'movement' | 'nutrition' | 'recovery') => {
    if (!mission || !user?.id) return;

    // Find the mission in local list and check if already completed
    const targetMission = mission.missions.find(m => m.type === type);
    if (!targetMission || targetMission.completed) return;

    // Optimistic Update
    setMission(prev => {
      if (!prev) return null;
      const updatedMissions = prev.missions.map(m => 
        m.type === type ? { ...m, completed: true } : m
      );
      const updatedCount = prev.completed_count + 1;
      return {
        ...prev,
        missions: updatedMissions,
        completed_count: updatedCount
      };
    });

    try {
      // Call service to update database and award XP
      const record = await MissionGenerationService.updateMissionCompletion(
        user.id,
        mission.id,
        type,
        true
      );

      // Parse updated record
      const json = record.missions_json as DailyMissionsJson;
      const missionsList: Mission[] = [
        { type: 'movement', title: json.movement.title, completed: json.movement.completed, xp: 15 },
        { type: 'nutrition', title: json.nutrition.title, completed: json.nutrition.completed, xp: 15 },
        { type: 'recovery', title: json.recovery.title, completed: json.recovery.completed, xp: 15 }
      ];

      setMission({
        id: record.id,
        date: record.date,
        coach_message: record.coach_message,
        missions: missionsList,
        completed_count: record.completed_count,
        total_count: record.total_count,
        xp_reward: record.xp_reward
      });

      // Refresh health context (levels, XP UI)
      await refreshHealthData();
    } catch (err) {
      console.error('[useDailyMission] completeMission failed, rolling back:', err);
      // Rollback on error
      setMission(prev => {
        if (!prev) return null;
        const rolledBackMissions = prev.missions.map(m => 
          m.type === type ? { ...m, completed: false } : m
        );
        const rolledBackCount = Math.max(0, prev.completed_count - 1);
        return {
          ...prev,
          missions: rolledBackMissions,
          completed_count: rolledBackCount
        };
      });
    }
  }, [mission, user?.id, refreshHealthData]);

  return { 
    mission, 
    loading, 
    completeMission, 
    refresh: fetchTodaysMission 
  };
}
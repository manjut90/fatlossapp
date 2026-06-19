import { supabase } from './supabase';
import { getFallbackTemplate } from '../constants/missionTemplates';


export async function hasCompletedTodayMission(
  userId: string
) {
  const today =
    new Date().toISOString().split('T')[0];

  const { data, error } =
    await supabase
      .from('daily_missions')
      .select('completed_missions, missions')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

  if (error || !data) {
    return false;
  }

  const completed =
  Array.isArray(data.completed_missions)
    ? data.completed_missions
    : [];

const totalMissions =
  Array.isArray(data.missions)
    ? data.missions.length
    : 0;

return (
  totalMissions > 0 &&
  completed.length === totalMissions
);
}

export async function getTodayMission(
  userId: string
) {
  const today =
    new Date().toISOString().split('T')[0];

  const { data, error } =
    await supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

  if (error) {
    return null;
  }

  return data;
}

export async function resolveMissionId(userId: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0];

  // 1. Try to get the mission normally
  const mission = await getTodayMission(userId);
  if (mission?.id) {
    return mission.id;
  }

  // 2. If it fails, create and insert a fallback mission
  console.warn(
    `[resolveMissionId] Mission fetch/generation failed. Creating fallback.`,
  );
  const fallback = getFallbackTemplate(today);
  const fallbackPayload = {
    user_id: userId,
    date: today,
    missions: fallback.missions,
    coach_message: fallback.coach_message,
    completed_missions: [],
    is_fallback: true, // Add a flag to identify fallback missions
  };

  const { data: fallbackMission, error: insertError } = await supabase
    .from('daily_missions')
    .insert(fallbackPayload)
    .select('id')
    .single();

  if (insertError || !fallbackMission?.id) {
    const criticalError = new Error(
      `[resolveMissionId] CRITICAL: Could not insert fallback mission.`,
    );
    console.error(criticalError, insertError);
    throw criticalError;
  }

  return fallbackMission.id;
}
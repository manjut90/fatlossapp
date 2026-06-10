import { supabase } from './supabase';

export async function hasCompletedTodayMission(
  userId: string
) {
  const today =
    new Date().toISOString().split('T')[0];

  const { data, error } =
    await supabase
      .from('daily_missions')
      .select('completed_missions')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

  if (error || !data) {
    return false;
  }

  return (
    Array.isArray(
      data.completed_missions
    ) &&
    data.completed_missions.length > 0
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
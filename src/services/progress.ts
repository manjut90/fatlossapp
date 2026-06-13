import { supabase } from '../services/supabase';
import { getLevel } from './level';

export async function addXp(
  amount: number,
) {
  try {
    const {
      data: existing,
    } = await supabase
      .from('user_progress')
      .select('*')
      .limit(1)
      .single();

    // CREATE USER

    if (!existing) {
      await supabase
        .from('user_progress')
        .insert({
          xp: amount,
          level: 1,
          streak: 1,
          last_checkin_date:
            new Date(),
        });

      return;
    }

    // CALCULATE

    const newXp =
      (existing.xp || 0) +
      amount;

    const level = getLevel(newXp);

    await supabase
      .from('user_progress')
      .update({
        xp: newXp,
        level,
      })
      .eq('id', existing.id);

    return {
      xp: newXp,
      level,
    };
  } catch (err) {
    console.log(err);
  }
}

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  return user.id;
}

export async function updateLastCelebratedLevel(
  level: number,
  userId?: string,
) {
  try {
    const resolvedUserId = userId || (await getCurrentUserId());

    const { error } = await supabase
      .from('user_progress')
      .update({
        last_celebrated_level: level,
      })
      .eq('user_id', resolvedUserId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Error updating last celebrated level:', err);
    return { success: false };
  }
}
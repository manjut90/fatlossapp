import { supabase } from '../services/supabase';

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
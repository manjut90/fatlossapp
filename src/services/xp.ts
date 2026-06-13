import { supabase } from './supabase';

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

export async function awardCheckInXp(
  amount: number,
  reason = 'Check-In',
  user_id?: string,
) {
  console.log('XP_AWARD_START', {
    amount,
    reason,
    user_id,
  });

  try {
    const resolvedUserId =
      user_id ||
      (await getCurrentUserId());

    console.log('XP_RESOLVED_USER', resolvedUserId);

    console.log('XP_LOG_INSERT_START');

    const { error } =
      await supabase
        .from('xp_logs')
        .insert({
          user_id: resolvedUserId,
          xp: amount,
          reason,
          created_at: new Date().toISOString(),
        });

    console.log('XP_LOG_INSERT_RESULT', error);

    if (error) {
      throw error;
    }

    const { data: progress, error: progressError } =
      await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', resolvedUserId)
        .maybeSingle();

    console.log(
      'USER_PROGRESS_FETCH',
      progress,
      progressError
    );

    if (progressError) {
      throw progressError;
    }

    if (!progress) {
      console.log('USER_PROGRESS_MISSING: Creating new row for user', resolvedUserId);
      await supabase
        .from('user_progress')
        .insert({
          user_id: resolvedUserId,
          xp: amount,
          level: 1,
          streak: 0,
          last_celebrated_level: 0,
        });
    
      console.log('XP_AWARD_SUCCESS (via insert)');
      return {
        success: true,
        xp: amount,
      };
    }

    const currentXp =
      progress?.xp || 0;

    console.log(
      'XP_UPDATE_START',
      currentXp,
      amount
    );

    const { data: updateData, error: xpError } =
      await supabase
        .from('user_progress')
        .update({
          xp: currentXp + amount,
        })
        .eq('user_id', resolvedUserId)
        .select();

    console.log(
      'XP_UPDATE_RESULT',
      updateData,
      xpError
    );

    if (xpError) {
      throw xpError;
    }

    console.log('XP_AWARD_SUCCESS');

    return {
      success: true,
      xp: amount,
    };
  } catch (err) {
    console.log('XP_AWARD_FAILED', err);

    return {
      success: false,
      xp: 0,
    };
  }
}
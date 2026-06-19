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
    console.log('XP_RPC_START', { amount, reason });

    const { data, error } = await supabase.rpc('award_xp', {
      p_user_id: resolvedUserId,
      p_amount: amount,
      p_reason: reason,
    });

    console.log('XP_RPC_RESULT', data, error);

    if (error) {
      throw error;
    }

    if (data && data.success === false) {
      throw new Error(data.error || 'RPC execution failed');
    }

    console.log('XP_AWARD_SUCCESS', data);

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
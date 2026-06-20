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


  try {
    const resolvedUserId =
      user_id ||
      (await getCurrentUserId());



    const { data, error } = await supabase.rpc('award_xp', {
      p_user_id: resolvedUserId,
      p_amount: amount,
      p_reason: reason,
    });



    if (error) {
      throw error;
    }

    if (data && data.success === false) {
      throw new Error(data.error || 'RPC execution failed');
    }



    return {
      success: true,
      xp: amount,
    };
  } catch (err) {
    console.error('Failed to award XP:', err);

    return {
      success: false,
      xp: 0,
    };
  }
}
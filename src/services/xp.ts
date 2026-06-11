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

    const { error } =
      await supabase
        .from('xp_logs')
        .insert({
          user_id: resolvedUserId,
          xp: amount,
          reason,
          created_at:
            new Date().toISOString(),
        });

   if (error) {
  throw error;
}

const { data: progress } =
  await supabase
    .from('user_progress')
    .select('xp')
    .eq('user_id', resolvedUserId)
    .single();

const currentXp =
  progress?.xp || 0;

const { error: xpError } =
  await supabase
    .from('user_progress')
    .update({
      xp: currentXp + amount,
    })
    .eq('user_id', resolvedUserId);

if (xpError) {
  throw xpError;
}

return {
  success: true,
  xp: amount,
};
  } catch (err) {
    console.log(err);

    return {
      success: false,
      xp: 0,
    };
  }
}
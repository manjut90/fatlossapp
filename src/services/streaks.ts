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

function toDateOnly(value: string) {
  return new Date(value)
    .toISOString()
    .split('T')[0];
}

function getYesterdayDate(today: string) {
  const day =
    new Date(`${today}T00:00:00.000Z`);
  day.setUTCDate(day.getUTCDate() - 1);
  return day
    .toISOString()
    .split('T')[0];
}

export async function updateDailyStreak(
  user_id?: string,
) {
  try {
    const resolvedUserId =
      user_id ||
      (await getCurrentUserId());

    const today =
      new Date()
        .toISOString()
        .split('T')[0];

    const { data, error } =
      await supabase
        .from('user_progress')
        .select(
          'id, streak, last_checkin_date',
        )
        .eq('user_id', resolvedUserId)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      const { error: insertError } =
        await supabase
          .from('user_progress')
          .insert({
            user_id: resolvedUserId,
            streak: 1,
            last_checkin_date: today,
          });

      if (insertError) {
        throw insertError;
      }

      return {
        success: true,
        streak: 1,
      };
    }

    const lastCheckIn =
      data.last_checkin_date
        ? toDateOnly(
            data.last_checkin_date,
          )
        : null;

    if (lastCheckIn === today) {
      return {
        success: true,
        streak: data.streak || 1,
      };
    }

    const yesterday =
      getYesterdayDate(today);

    const nextStreak =
      lastCheckIn === yesterday
        ? (data.streak || 0) + 1
        : 1;

    const { error: updateError } =
      await supabase
        .from('user_progress')
        .update({
          streak: nextStreak,
          last_checkin_date: today,
        })
        .eq('id', data.id);

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      streak: nextStreak,
    };
  } catch (err) {
    console.log(err);

    return {
      success: false,
      streak: 0,
    };
  }
}

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

// =====================================================
// ADD WATER
// =====================================================

export async function addWater(
  amount: number,
  logged_at?: string,
  user_id?: string,
) {
  try {
    const resolvedUserId =
      user_id ||
      (await getCurrentUserId());

    // =====================================
    // SAVE WATER LOG
    // =====================================

    const { error } =
      await supabase
        .from('hydration_logs')
        .insert({
          user_id: resolvedUserId,
          amount,
          created_at:
            logged_at ||
            new Date().toISOString(),
        });

    console.log(error);

    if (error) {
      throw error;
    }

    return {
      success: true,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
    };
  }
}

// =====================================================
// GET TODAY WATER
// =====================================================

export async function getTodayWater() {
  try {
    const user_id =
      await getCurrentUserId();

    // =====================================
    // START OF DAY
    // =====================================

    const start =
      new Date();

    start.setHours(
      0,
      0,
      0,
      0,
    );

    // =====================================
    // FETCH TODAY LOGS
    // =====================================

    const { data, error } =
      await supabase
        .from('hydration_logs')
        .select('*')
        .eq('user_id', user_id)
        // Filter by creation date to get today's logs
        .gte(
          'created_at',
          start.toISOString(),
        );

    if (error) {
      throw error;
    }

    // =====================================
    // CALCULATE TOTAL
    // =====================================

    const total =
      data.reduce(
        (sum, item) =>
          sum + item.amount,
        0,
      );

    return {
      success: true,
      total,
    };
  } catch (err) {
    console.log(err);

    return {
      success: false,
      total: 0,
    };
  }
}
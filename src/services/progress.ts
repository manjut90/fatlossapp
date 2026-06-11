import { supabase } from '../services/supabase';

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

    const level =
      Math.floor(newXp / 500) + 1;

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
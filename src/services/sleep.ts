import { supabase } from './supabase';

type AddSleepInput = {
  user_id?: string;
  hours: number;
  quality: string;
  date?: string;
};

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

export async function addSleep(
  input: AddSleepInput,
) {
  try {
    const user_id =
      input.user_id ||
      (await getCurrentUserId());

    const { error } =
      await supabase
        .from('sleep_logs')
        .insert({
          user_id,
          hours: input.hours,
          sleep_quality:
            input.quality,
          created_at:
            input.date ||
            new Date()
              .toISOString(),
        });

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
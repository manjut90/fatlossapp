import { supabase } from './supabase';

type AddActivityInput = {
  user_id?: string;
  activity_name: string;
  duration: number;
  calories_burned: number;
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

export async function addActivity(
  input: AddActivityInput,
) {
  try {
    const user_id =
      input.user_id ||
      (await getCurrentUserId());

    const { error } =
      await supabase
        .from('activity_logs')
        .insert({
          user_id,
          activity_name:
            input.activity_name,
          duration:
            input.duration,
          calories_burned:
            input.calories_burned,
          created_at: new Date().toISOString(),
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
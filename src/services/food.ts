import { supabase } from './supabase';

type AddFoodInput = {
  user_id?: string;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  meal_type: string;
  created_at?: string;
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

export async function addFood(
  input: AddFoodInput,
) {
  try {
    const user_id =
      input.user_id ||
      (await getCurrentUserId());

    const { error } =
      await supabase
        .from('food_logs')
        .insert({
          user_id,
          meal_name:
            input.meal_name,
          calories:
            input.calories,
          protein:
            input.protein,
          carbs: input.carbs,
          fats: input.fats,
          fiber: input.fiber,
          meal_type:
            input.meal_type,
          created_at:
            input.created_at ||
            new Date().toISOString(),
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
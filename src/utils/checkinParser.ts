import { parseMultipleFoods } from '../services/mealParser';

export function parseCheckIn(
  text: string
) {
  const lower =
    text.toLowerCase();

  let calories = 0;

  let protein = 0;

  let fiber = 0;

  let water = 0;

  let workout = false;

  let sleep = 0;

  // ======================================
  // WATER
  // ======================================

  const waterMatch =
    lower.match(
      /(\d+(\.\d+)?)\s?(l|litre|liter)/i
    );

  if (waterMatch) {
    water = Number(
      waterMatch[1]
    );
  }

  // ======================================
  // SLEEP
  // ======================================

  const sleepMatch =
    lower.match(
      /(\d+)\s?(hours|hour|hrs|hr)/i
    );

  if (sleepMatch) {
    sleep = Number(
      sleepMatch[1]
    );
  }

  // ======================================
  // WORKOUT
  // ======================================

  if (
    lower.includes(
      'workout'
    ) ||
    lower.includes(
      'gym'
    ) ||
    lower.includes(
      'cardio'
    ) ||
    lower.includes(
      'cycling'
    )
  ) {
    workout = true;
  }

  const parsedFoods =
    parseMultipleFoods(lower);

  calories +=
    parsedFoods.totals.calories;
  protein +=
    parsedFoods.totals.protein;
  fiber +=
    parsedFoods.totals.fiber;

  const firstItem =
    parsedFoods.items[0];

  return {
    calories,

    protein,

    carbs: parsedFoods.totals.carbs,

    fats: parsedFoods.totals.fats,

    fiber,

    meal_name:
      firstItem?.name || '',

    meal_type: 'snack',

    water,

    workout,

    sleep,
  };
}
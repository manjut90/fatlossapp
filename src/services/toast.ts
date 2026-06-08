export const successMessages = {
  water: [
    'Hydration updated 💧',
    'Water logged successfully 🚰',
    'Recovery fuel added ⚡',
  ],

  food: [
    'Meal check-in complete 🍽️',
    'Nutrition updated 🥗',
    'Fuel added successfully 🔥',
  ],

  activity: [
    'Workout logged 🔥',
    'Activity complete ⚡',
    'Movement tracked 🏃',
  ],

  sleep: [
    'Recovery updated 😴',
    'Sleep logged successfully 🌙',
    'Rest impacts results 💪',
  ],

  xp: [
    '+XP Earned ⚡',
    'Progress updated 🚀',
    'You’re leveling up ⭐',
  ],
};

export function getRandomMessage(
  type:
    | 'water'
    | 'food'
    | 'activity'
    | 'sleep'
    | 'xp',
) {
  const messages =
    successMessages[type];

  return messages[
    Math.floor(
      Math.random() *
        messages.length,
    )
  ];
}
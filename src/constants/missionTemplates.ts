export interface MissionTemplate {
  title: string;
  description: string;
  category: 'movement' | 'hydration' | 'nutrition';
  xp: number;
}

export interface DayTemplate {
  missions: MissionTemplate[];
  coach_message: string;
}

export const missionTemplates = {
  movement: [
    {
      title: '10 Minute Walk',
      description: 'Walk for 10 minutes after your next meal.',
      category: 'movement' as const,
      xp: 50,
    },
    {
      title: '5000 Steps',
      description: 'Reach 5000 total steps today.',
      category: 'movement' as const,
      xp: 75,
    },
    {
      title: '15 Minute Workout',
      description: 'Complete a short workout session.',
      category: 'movement' as const,
      xp: 100,
    },
  ],

  hydration: [
    {
      title: 'Drink 1.5L Water',
      description: 'Finish 1.5L before 6 PM.',
      category: 'hydration' as const,
      xp: 50,
    },
    {
      title: 'Hydration Check',
      description: 'Log water intake 3 times today.',
      category: 'hydration' as const,
      xp: 75,
    },
  ],

  nutrition: [
    {
      title: 'Protein Goal',
      description: 'Hit your protein target today.',
      category: 'nutrition' as const,
      xp: 100,
    },
    {
      title: 'Healthy Meal',
      description: 'Log one balanced meal today.',
      category: 'nutrition' as const,
      xp: 50,
    },
  ],
};

const FALLBACK_PAIRS: DayTemplate[] = [
  {
    missions: [
      missionTemplates.movement[0],
      missionTemplates.hydration[0],
    ],
    coach_message:
      "Simple day. Two small wins. That's all I need from you.",
  },
  {
    missions: [
      missionTemplates.nutrition[0],
      missionTemplates.hydration[0],
    ],
    coach_message:
      'Nutrition and hydration. The unsexy stuff that actually works.',
  },
  {
    missions: [
      missionTemplates.movement[0],
      missionTemplates.nutrition[0],
    ],
    coach_message:
      'Movement and clean fuel. You know what to do.',
  },
];

export function getFallbackTemplate(
  date: string
): DayTemplate {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 0);

  const dayOfYear = Math.floor(
    (d.getTime() - start.getTime()) / 86400000
  );

  return FALLBACK_PAIRS[
    dayOfYear % FALLBACK_PAIRS.length
  ];
}
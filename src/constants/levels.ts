export interface LevelThreshold {
  level: number;
  xp: number;
  title: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number | null;
  progressPercent: number;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, xp: 0, title: 'Beginner' },
  { level: 2, xp: 500, title: 'Starter' },
  { level: 3, xp: 1500, title: 'Momentum Builder' },
  { level: 4, xp: 3000, title: 'Consistency Machine' },
  { level: 5, xp: 5000, title: 'Transformation Zone' },
  { level: 6, xp: 8000, title: 'Elite Performer' },
  { level: 7, xp: 12000, title: 'LFGO Legend' },
];

export function getLevelFromXP(totalXp: number): LevelInfo {
  let currentLevelIndex = -1;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevelIndex = i;
      break;
    }
  }

  // Fallback to level 1 if something goes wrong (e.g., negative XP)
  if (currentLevelIndex === -1) {
    currentLevelIndex = 0;
  }

  const currentLevelData = LEVEL_THRESHOLDS[currentLevelIndex];
  const nextLevelData = LEVEL_THRESHOLDS[currentLevelIndex + 1] || null;

  const { level, title } = currentLevelData;
  const currentLevelXp = currentLevelData.xp;
  const nextLevelXp = nextLevelData ? nextLevelData.xp : null;

  let progressPercent = 0;

  if (nextLevelXp !== null) {
    const xpInCurrentLevel = totalXp - currentLevelXp;
    const xpToNextLevel = nextLevelXp - currentLevelXp;
    if (xpToNextLevel > 0) {
      progressPercent = (xpInCurrentLevel / xpToNextLevel) * 100;
    }
  } else {
    // This is the highest level
    progressPercent = 100;
  }

  return {
    level,
    title,
    currentLevelXp,
    nextLevelXp,
    progressPercent: Math.min(100, Math.max(0, progressPercent)), // Clamp between 0 and 100
  };
}
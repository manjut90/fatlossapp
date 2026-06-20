import { UserTargets } from './healthCalculations';

export function calculateDailyScore(
  {
    calories,
    water,
    workout,
    sleep,
  }: any,
  targets: UserTargets
) {
  let score = 0;

  /* FOOD */

  if (calories >= 1200) {
    score += 35;
  }

  /* WATER */

  if (water >= targets.watermL) {
    score += 25;
  }

  /* WORKOUT */

  if (workout) {
    score += 25;
  }

  /* SLEEP */

  if (sleep >= targets.sleep) {
    score += 15;
  }

  return Math.min(
    100,
    score
  );
}
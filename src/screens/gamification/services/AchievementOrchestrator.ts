// src/screens/gamification/services/AchievementOrchestrator.ts

import { User } from '@supabase/supabase-js';
import { achievementService } from './AchievementService';
import { awardCheckInXp } from '../../../services/xp';
import { ACHIEVEMENTS, AchievementDefinition } from '../engine/achievements';

class AchievementOrchestrator {
  /**
   * Checks for any new achievements that a user may have unlocked.
   * It fetches the user's already unlocked achievements and compares them
   * against the master list of achievement definitions, running the verifier
   * function only for those not yet unlocked.
   *
   * @param userId - The ID of the user to check.
   * @returns The definition of the first newly unlocked achievement, or null if none.
   */
  public async checkForNewAchievements(
    userId: string
  ): Promise<AchievementDefinition | null> {
    try {
      // 1. Load user's unlocked achievements
      const unlockedAchievements = await achievementService.getUserAchievements(
        userId
      );
      const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));

      // 2. Compare against ACHIEVEMENTS definitions to find what to check
      const achievementsToCheck = ACHIEVEMENTS.filter(
        (def) => !unlockedIds.has(def.id)
      );

      if (achievementsToCheck.length === 0) {
        return null;
      }

      // The verifier functions expect a User object, but only use the `id` property.
      // We can safely cast a partial object for this purpose.
      const user = { id: userId } as User;

      // 3. Run verifier() only for achievements not already unlocked
      for (const definition of achievementsToCheck) {
        const isUnlocked = await definition.verifier(user);

        // 4. Return FIRST newly unlocked achievement
        if (isUnlocked) {
          console.log(`[AchievementOrchestrator] New achievement unlocked: ${definition.name}`);
          // Persist the achievement to the database before notifying the UI
          await achievementService.unlockAchievement(userId, definition.id);

          console.log(
            'ACHIEVEMENT_XP_START',
            definition.id,
            definition.xp
          );

          const xpResult =
            await awardCheckInXp(
              definition.xp,
              `Achievement: ${definition.name}`,
              userId
            );

          console.log(
            'ACHIEVEMENT_XP_RESULT',
            xpResult
          );

          return definition;
        }
      }

      return null;
    } catch (error) {
      console.error('[AchievementOrchestrator] Error checking for new achievements:', error);
      return null;
    }
  }
}

export const achievementOrchestrator = new AchievementOrchestrator();
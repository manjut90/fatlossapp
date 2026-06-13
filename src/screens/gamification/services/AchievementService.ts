// src/screens/gamification/services/AchievementService.ts

import { supabase } from '../../../services/supabase';
import { Achievement } from '../types';

class AchievementService {
  /**
   * Fetches all of a user's unlocked achievements from the database.
   * @param userId - The ID of the user.
   * @returns An array of unlocked achievements.
   */
  public async getUserAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at, metadata')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }

    return data.map((a) => ({
      id: a.achievement_id,
      unlockedAt: a.unlocked_at,
      metadata: a.metadata,
    }));
  }

  /**
   * Saves a newly unlocked achievement to the database.
   * @param userId - The ID of the user.
   * @param achievementId - The ID of the achievement to unlock.
   * @param metadata - Optional data related to the achievement.
   * @returns The newly created achievement record.
   */
  public async unlockAchievement(
    userId: string,
    achievementId: string,
    metadata?: Record<string, any>
  ): Promise<Achievement> {
    console.log('UNLOCK_START', achievementId);
    try {
      const session = await supabase.auth.getSession();

      console.log(
        'ACHIEVEMENT_SESSION_USER',
        session.data.session?.user?.id
      );

      console.log(
        'ACHIEVEMENT_FUNCTION_USER_ID',
        userId
      );

      console.log(
        'ACHIEVEMENT_INSERT_PAYLOAD',
        {
          user_id: userId,
          achievement_id: achievementId,
          metadata,
        }
      );

      const { data, error } = await supabase
        .from('user_achievements')
        .upsert(
          {
            user_id: userId,
            achievement_id: achievementId,
            metadata,
          },
          { onConflict: 'user_id, achievement_id', ignoreDuplicates: true }
        )
        .select('achievement_id, unlocked_at, metadata')
        .single();

      if (error) {
        throw error;
      }

      console.log('UNLOCK_SUCCESS', data);

      // If data is null, it means the achievement already existed and was ignored.
      // We should fetch it to return the complete achievement object.
      if (!data) {
        const existing = await this.hasAchievement(userId, achievementId);
        if (existing) return existing;
        // This case should ideally not be reached if the upsert is configured correctly
        throw new Error('Failed to retrieve existing achievement after upsert.');
      }

      return {
        id: data.achievement_id,
        unlockedAt: data.unlocked_at,
        metadata: data.metadata,
      };
    } catch (err) {
      console.log(
        'ACHIEVEMENT_UNLOCK_ERROR',
        JSON.stringify(err, null, 2)
      );
      throw err;
    }
  }

  /**
   * Checks if a user has already unlocked a specific achievement.
   * @param userId - The ID of the user.
   * @param achievementId - The ID of the achievement to check.
   * @returns The achievement if it exists, otherwise null.
   */
  public async hasAchievement(
    userId: string,
    achievementId: string
  ): Promise<Achievement | null> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at, metadata')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .maybeSingle();

    if (error) {
      console.error('Error checking for achievement:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.achievement_id,
      unlockedAt: data.unlocked_at,
      metadata: data.metadata,
    };
  }
}

export const achievementService = new AchievementService();
// src/screens/gamification/engine/achievements.ts

import { User } from '@supabase/supabase-js';
import { supabase } from '../../../services/supabase';
import { Achievement } from '../types';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  xp: number;
  verifier: (user: User) => Promise<boolean>;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'FIRST_POST',
    name: 'First Post',
    description: 'Create your first post in the feed.',
    xp: 50,
    verifier: async (user: User) => {
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) return false;
      return (count || 0) > 0;
    },
  },
  {
    id: 'WORKOUT_MASTER',
    name: 'Workout Master',
    description: 'Complete 10 "hard" workouts.',
    xp: 500,
    verifier: async (user: User) => {
      const { count, error } = await supabase
        .from('user_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('difficulty', 'hard');

      if (error) return false;
      return (count || 0) >= 10;
    },
  },
  {
    id: 'STREAK_7',
    name: '7-Day Streak',
    description: 'Maintain a 7-day check-in streak.',
    xp: 250,
    verifier: async (user: User) => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('streak')
        .eq('user_id', user.id)
        .single();

      if (error || !data) return false;
      return data.streak >= 7;
    },
  },
];

export const getAchievementById = (id: string) => {
  return ACHIEVEMENTS.find((a) => a.id === id);
};
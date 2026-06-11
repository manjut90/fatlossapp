import {
  useEffect,
  useState,
} from 'react';

import { supabase } from '../services/supabase';

export default function useProgress() {
  // ======================================================
  // STATE
  // ======================================================

  const [xp, setXp] =
    useState(0);

  const [level, setLevel] =
    useState(1);

  const [streak, setStreak] =
    useState(0);

  const [starColor, setStarColor] =
    useState('#C0C0C0');

  const [loading, setLoading] =
    useState(true);

  // ======================================================
  // STAR COLOR
  // ======================================================

  const getStarColor = (
    lvl: number,
  ) => {
    if (lvl <= 5) {
      return '#C0C0C0';
    }

    if (lvl <= 10) {
      return '#F7C873';
    }

    if (lvl <= 20) {
      return '#8B7CFF';
    }

    return '#62B5FF';
  };

  // ======================================================
  // FETCH PROGRESS
  // ======================================================

  const fetchProgress =
    async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const {
          data,
        } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (data) {
          setXp(data.xp || 0);

          setLevel(
            data.level || 1,
          );

          setStreak(
            data.streak || 0,
          );

          setStarColor(
            getStarColor(
              data.level || 1,
            ),
          );
        }

        setLoading(false);
      } catch (err) {
        console.log(err);

        setLoading(false);
      }
    };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchProgress();
  }, []);

  // ======================================================
  // RETURN
  // ======================================================

  return {
    xp,
    level,
    streak,
    starColor,
    loading,

    refreshProgress:
      fetchProgress,
  };
}
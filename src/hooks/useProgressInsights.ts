import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateProgressInsights, clearInsightsCache } from '../services/progressInsights';
import { useProgressMetrics } from './useProgressMetrics';

interface ProgressInsights {
  positives: string;
  negatives: string;
  recommendations: string;
  loading: boolean;
  error: string | null;
  cached: boolean;
  refresh: () => Promise<void>;
}

export function useProgressInsights(): ProgressInsights {
  const { user, profile } = useAuth();
  const metrics = useProgressMetrics();

  const [positives, setPositives] = useState('');
  const [negatives, setNegatives] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await generateProgressInsights(user.id, metrics, profile);

      setPositives(result.positives);
      setNegatives(result.negatives);
      setRecommendations(result.recommendations);
      setCached(result.cached);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  }, [user?.id, metrics, profile]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleRefresh = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Clear cache to force regeneration
      await clearInsightsCache(user.id);
      await fetchInsights();
    } catch (err) {
      console.error('Error refreshing insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh insights');
    }
  }, [user?.id, fetchInsights]);

  return {
    positives,
    negatives,
    recommendations,
    loading,
    error,
    cached,
    refresh: handleRefresh,
  };
}

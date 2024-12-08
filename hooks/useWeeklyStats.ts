import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface WeeklyStats {
  challengesTaken: number;
  weeklyChange: number;
}

interface CachedWeeklyStats {
  stats: WeeklyStats;
  timestamp: number;
}

export function useWeeklyStats(userId?: string) {
  const [stats, setStats] = useState<WeeklyStats>({
    challengesTaken: 0,
    weeklyChange: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Only fetch if userId is provided
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const CACHE_KEY = `weekly_stats_cache_${userId}`;
    const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    const fetchWeeklyStats = async () => {
      try {
        setIsLoading(true);

        // Check for cached stats
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const parsedCache: CachedWeeklyStats = JSON.parse(cachedData);
          const currentTime = Date.now();

          // If cache is still valid, use cached data
          if (currentTime - parsedCache.timestamp < CACHE_EXPIRATION) {
            setStats(parsedCache.stats);
            setIsLoading(false);
            return;
          }
        }

        // Fetch fresh data from Supabase
        const { data: weeklyStats, error: weeklyStatsError } = await supabase
          .from('weekly_challenge_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (weeklyStatsError) {
          console.error('Error fetching weekly stats:', weeklyStatsError);
          throw weeklyStatsError;
        }

        const freshStats = {
          challengesTaken: weeklyStats?.this_week_attempts ?? 0,
          weeklyChange: weeklyStats?.weekly_change ?? 0
        };

        // Cache the new stats
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          stats: freshStats,
          timestamp: Date.now()
        }));

        setStats(freshStats);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred while fetching weekly stats'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyStats();
  }, [supabase, userId]);

  // Method to clear cache manually
  const clearCache = (specificUserId?: string) => {
    const cacheKey = specificUserId 
      ? `weekly_stats_cache_${specificUserId}` 
      : Object.keys(localStorage).find(key => key.startsWith('weekly_stats_cache_'));
    
    if (cacheKey) {
      localStorage.removeItem(cacheKey);
    }
  };

  return { stats, isLoading, error, clearCache };
}

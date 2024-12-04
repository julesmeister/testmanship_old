import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface WeeklyStats {
  challengesTaken: number;
  weeklyChange: number;
}

export function useWeeklyStats() {
  const [stats, setStats] = useState<WeeklyStats>({
    challengesTaken: 0,
    weeklyChange: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        setIsLoading(true);
        const { data: weeklyStats, error: weeklyStatsError } = await supabase
          .from('weekly_challenge_stats')
          .select('*')
          .single();

        if (weeklyStatsError) {
          console.error('Error fetching weekly stats:', weeklyStatsError);
          throw weeklyStatsError;
        }

        setStats({
          challengesTaken: weeklyStats?.this_week_attempts ?? 0,
          weeklyChange: weeklyStats?.weekly_change ?? 0
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred while fetching weekly stats'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyStats();
  }, [supabase]);

  return { stats, isLoading, error };
}

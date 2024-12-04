import { useState, useEffect } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';

export interface UserProgress {
  total_challenges_completed: number;
  total_words_written: number;
  total_time_spent: number;
  average_performance: number;
  weakest_skills: string[];
  last_active_level: string;
  longest_streak: number;
}

export interface WordCountData {
  word_count: number;
  completed_at: string;
}

interface UseUserWordStatsReturn {
  progress: UserProgress | null;
  wordCountData: WordCountData[];
  isLoading: boolean;
  error: Error | null;
}

export const useUserWordStats = (
  supabase: SupabaseClient,
  user: User | null | undefined
): UseUserWordStatsReturn => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [wordCountData, setWordCountData] = useState<WordCountData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          setProgress(data);
        }

        // Fetch word count time series data
        const { data: wordCountData, error: wordCountError } = await supabase
          .from('challenge_attempts')
          .select('word_count, completed_at')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: true })
          .limit(30);

        if (wordCountError) throw wordCountError;
        setWordCountData(wordCountData || []);

      } catch (err) {
        console.error('Error fetching user word stats:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user?.id, supabase]);

  return { progress, wordCountData, isLoading, error };
};

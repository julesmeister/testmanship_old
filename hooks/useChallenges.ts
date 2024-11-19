import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Challenge } from '@/types/challenge';

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchChallenges() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setChallenges(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch challenges'));
        console.error('Error fetching challenges:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChallenges();
  }, [supabase]);

  return { challenges, isLoading, error };
}

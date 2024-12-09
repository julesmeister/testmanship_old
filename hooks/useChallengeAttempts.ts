import { useState, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { ChallengeAttempt } from '@/types/challenge';
import { challengeAttemptsCache } from '@/lib/db/challenge-attempts-cache';

interface UseChallengeAttemptsParams {
  supabase: SupabaseClient;
  userId: string;
  page?: number;
  pageSize?: number;
}

export const useChallengeAttempts = () => {
  const [challengesAttempts, setChallengesAttempts] = useState<ChallengeAttempt[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChallengeAttempts = useCallback(async ({
    supabase, 
    userId, 
    page = 1, 
    pageSize = 10
  }: UseChallengeAttemptsParams) => {
    setIsLoading(true);
    try {
      // First, check cache
      const cachedAttempts = await challengeAttemptsCache.getCachedAttempts(userId);

      if (cachedAttempts.length > 0) {
        console.log(`🟢 Cache Hit: Retrieved ${cachedAttempts.length} challenge attempts for user ${userId}`, {
          userId,
          cacheSize: cachedAttempts.length,
          cacheTimestamp: new Date(cachedAttempts[0].cached_at).toISOString()
        });
        setChallengesAttempts(cachedAttempts);
        setIsLoading(false);
        return { success: true, data: cachedAttempts, fromCache: true };
      }

      console.log(`🔵 Cache Miss: No valid cache found for user ${userId}`, { userId });

      // Get total count
      const { count } = await supabase
        .from('challenge_attempt_details')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setTotalCount(count || 0);

      // Get paginated data
      const start = (page - 1) * pageSize;
      const end = page * pageSize - 1;
      const { data, error: fetchError } = await supabase
        .from('challenge_attempt_details')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .range(start, end);

      if (fetchError) throw fetchError;

      const formattedChallenges = (data || []).map(attempt => ({
        id: attempt.attempt_id,
        challenge_id: attempt.challenge_id,
        user_id: userId,
        title: attempt.challenge_title,
        difficulty: attempt.difficulty_level,
        performance: attempt.performance_score,
        paragraphs: attempt.paragraph_count,
        word_count: attempt.word_count,
        completed_at: new Date(attempt.completed_at),
        time_spent: attempt.time_spent,
        format: attempt.format_name,
        content: attempt.content,
        feedback: attempt.feedback
      }));

      // Cache the fetched attempts
      await challengeAttemptsCache.cacheAttempts(formattedChallenges, userId);

      setChallengesAttempts(formattedChallenges);
      setIsLoading(false);

      return { 
        success: true, 
        data: formattedChallenges, 
        fromCache: false 
      };
    } catch (error) {
      console.error('Error fetching challenge attempts:', error);
      toast.error('Failed to fetch challenge attempts');
      setIsLoading(false);
      return { 
        success: false, 
        data: [], 
        fromCache: false 
      };
    }
  }, []);

  return { 
    challengesAttempts, 
    totalCount, 
    isLoading, 
    fetchChallengeAttempts,
    setChallengesAttempts,
    setTotalCount
  };
};

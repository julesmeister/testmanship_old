import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ChallengeAttempt, UserProgress } from '@/types/wordsmith';

export function useUserChallenges(selectedUser: string | null) {
  const supabase = createClientComponentClient();
  const [userChallenges, setUserChallenges] = useState<ChallengeAttempt[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchUserChallenges(userId: string) {
      setIsLoading(true);
      
      // Fetch challenge attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('challenge_attempts')
        .select(`
          id,
          challenge:challenge_id (
            id,
            title,
            instructions,
            difficulty_level,
            time_allocation
          ),
          content,
          word_count,
          paragraph_count,
          time_spent,
          performance_score,
          completed_at,
          feedback
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (attemptsError) {
        console.error('Error fetching challenges:', attemptsError);
        setIsLoading(false);
        return;
      }

      // Fetch user progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (progressError) {
        console.error('Error fetching user progress:', progressError);
      }

      // Transform the attempts data to match ChallengeAttempt type
      const transformedAttempts = attempts?.map(attempt => ({
        ...attempt,
        challenge: Array.isArray(attempt.challenge) ? attempt.challenge[0] : attempt.challenge
      })) || [];

      setUserChallenges(transformedAttempts);
      setUserProgress(progress);
      setIsLoading(false);
    }

    if (selectedUser) {
      fetchUserChallenges(selectedUser);
    } else {
      setUserChallenges([]);
      setUserProgress(null);
    }
  }, [selectedUser, supabase]);

  return {
    userChallenges,
    userProgress,
    isLoading
  };
}

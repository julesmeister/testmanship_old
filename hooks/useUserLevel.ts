import { useState, useEffect } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface UseUserLevelProps {
  user: User | null | undefined;
  setLevel: (level: string) => void;
  initialLevel?: string;
}

export function useUserLevel({ user, initialLevel, setLevel }: UseUserLevelProps) {
  const supabase = createClientComponentClient();

  const updateLevel = async (newLevel: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .update({ last_active_level: newLevel })
        .eq('user_id', user.id);

      if (error) throw error;
      setLevel(newLevel);
      return { success: true };
    } catch (error) {
      console.error('Error updating difficulty level:', error);
      return { success: false, error };
    }
  };

  const initializeUserProgress = async () => {
    if (!user) return;

    try {
      // First, try to fetch existing user progress
      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('last_active_level')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw fetchError;
      }

      // If user progress exists, set the level and return
      if (existingProgress?.last_active_level) {
        setLevel(existingProgress.last_active_level);
        return { success: true };
      }

      // If no progress exists, create a new entry with default values
      const { error: insertError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          last_active_level: 'A1',
          total_challenges_completed: 0,
          total_words_written: 0,
          total_time_spent: 0,
          average_performance: 0,
          strongest_skills: [],
          weakest_skills: [],
          preferred_topics: [],
          current_streak: 0,
          longest_streak: 0,
          total_exercises_completed: 0
        });

      if (insertError) throw insertError;
      
      setLevel('A1');
      return { success: true };
    } catch (error) {
      console.error('Error initializing user progress:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (user) {
      initializeUserProgress();
    }
  }, [user]);

  return {
    updateLevel,
  };
}

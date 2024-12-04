import { useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface UserProgressSetters {
  setWeakestSkills: (skills: string[]) => void;
  setUserProgressId: (id: string | null) => void;
  setUpdatedAt: (date: Date | null) => void;
  setCurrentStreak: (streak: number) => void;
  setExercisesTaken: (count: number) => void;
  setDifficulty: (level: string | null) => void;
}

export const useUserProgress = (
  supabase: SupabaseClient,
  userId: string, 
  setters: UserProgressSetters
) => {
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('user_id, weakest_skills, updated_at, current_streak, total_challenges_completed, total_exercises_completed, last_active_level')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        
        if (data) {
          setters.setWeakestSkills(data.weakest_skills || []);
          setters.setUserProgressId(data.user_id);
          setters.setUpdatedAt(data.updated_at);
          setters.setCurrentStreak(data.current_streak);
          setters.setExercisesTaken(data.total_exercises_completed);
          setters.setDifficulty(data.last_active_level);
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }
    };

    if (userId) {
      fetchUserProgress();
    }
  }, [supabase, userId, setters]);
};

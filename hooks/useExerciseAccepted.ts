import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { calculateStreak } from '@/utils/helpers';

interface ExerciseAcceptedParams {
  supabase: SupabaseClient;
  session: any;
  data: {
    userProgressId: string;
    weakestSkills: string[];
    updated_at: Date;
    current_streak: number;
    longest_streak: number;
    total_exercises_completed?: number;
  };
}

export const useExerciseAccepted = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitExerciseAccepted = async ({ supabase, session, data }: ExerciseAcceptedParams) => {
    setIsSubmitting(true);
    try {
      console.log('Starting exercise accepted submission with data:', JSON.stringify(data, null, 2));
      
      if (!session?.user) {
        console.error('No user session found');
        toast.error('Please sign in to update progress', {
          id: 'updating-progress',
        });
        return { success: false };
      }

      // Calculate streaks
      const { updated_streak, updated_longest_streak } = calculateStreak(data);
      
      // Update the user_progress record
      const { data: progressRecord, error: progressError } = await supabase
        .from('user_progress')
        .update({ 
          weakest_skills: data.weakestSkills, 
          current_streak: updated_streak,
          updated_at: new Date().toISOString(),
          longest_streak: updated_longest_streak,
          total_exercises_completed: (data.total_exercises_completed || 0) + 1 
        })
        .eq('user_id', data.userProgressId)
        .select()
        .single();

      if (progressError) {
        console.error('Progress update error:', progressError);
        throw new Error(`Failed to update user progress: ${progressError.message}`);
      }

      console.log('Successfully updated user progress:', progressRecord);
      
      toast.success('Exercise recorded!', {
        id: 'updating-progress',
      });

      return { success: true, data: progressRecord };

    } catch (error) {
      console.error('Error in submitExerciseAccepted:', error);
      toast.error('Failed to record exercise', {
        id: 'updating-progress',
      });
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitExerciseAccepted
  };
};

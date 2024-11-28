import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface ExerciseAcceptedParams {
  supabase: SupabaseClient;
  session: any;
  data: {
    userProgressId: string;
    weakestSkills: string[];
    updated_at: Date;
    current_streak: number;
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

      // If updated_at is not the same day as today, and there is only one day gap, update the current_streak. If there is more than 1 day gap, reset the current_streak.
      const today = new Date();
      const lastUpdate = new Date(data.updated_at);
      
      // Reset hours to midnight to compare dates only
      today.setHours(0, 0, 0, 0);
      lastUpdate.setHours(0, 0, 0, 0);
      
      var updated_streak = data.current_streak;

      // Calculate days between dates, handling timezone differences
      const gap = Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (gap > 1) {
        // More than one day gap, reset streak
        updated_streak = 1;
      } else if (gap === 1) {
        // Exactly one day gap, increment streak
        updated_streak = data.current_streak + 1;
      }
      // If gap is 0 (same day) or negative (future date), keep current streak

      // Update the user_progress record
      const { data: progressRecord, error: progressError } = await supabase
        .from('user_progress')
        .update({ weakest_skills: data.weakestSkills, current_streak: updated_streak })
        .eq('id', data.userProgressId)
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

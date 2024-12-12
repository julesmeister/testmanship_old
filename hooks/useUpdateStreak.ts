import { SupabaseClient } from '@supabase/supabase-js';
import { calculateStreak } from '@/utils/helpers';

export const useUpdateStreak = () => {
  const updateStreak = async (supabase: SupabaseClient, userId: string) => {
    // Fetch current progress
    const { data: currentProgress, error: progressFetchError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (progressFetchError && progressFetchError.code !== 'PGRST116') {
      console.error('Error fetching current progress:', progressFetchError);
      throw new Error(`Failed to fetch current progress: ${progressFetchError.message}`);
    }

    // Calculate streaks
    const { updated_streak, updated_longest_streak } = calculateStreak(currentProgress);

    // Update user progress with new streak
    const userProgressUpdate = {
      user_id: userId,
      streak: updated_streak,
      longest_streak: updated_longest_streak,
      updated_at: new Date().toISOString(),
    };

    // Update the user progress in the database
    const { error: updateError } = await supabase
      .from('user_progress')
      .upsert(userProgressUpdate);

    if (updateError) {
      console.error('Error updating user progress:', updateError);
      throw new Error(`Failed to update user progress: ${updateError.message}`);
    }
  };

  return { updateStreak };
};

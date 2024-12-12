import { useCallback } from 'react';
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';
import { exerciseCacheByDifficulty } from '@/lib/db/exercise-cache-by-difficulty'; // Correct import

const useSaveScore = (supabase: SupabaseClient, onScoreSaved?: () => void) => {
  const saveScore = useCallback(async (userId: string, exerciseId: string, score: number, difficulty: string) => {
    try {
      const { data: existingRecord, error: fetchError } = await supabase
        .from('user_exercise_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .limit(1)
        .single();

      if (fetchError) {
        console.error('Error fetching existing record:', fetchError);
      }

      console.log('Existing Record:', existingRecord); // Log the existing record

      if (existingRecord) {
        const existingScore = existingRecord.score;
        const averageScore = Math.round((existingScore + score) / 2); // Round to nearest integer

        const { error: updateError } = await supabase
          .from('user_exercise_progress')
          .update({ score: averageScore, attempts: existingRecord.attempts + 1, last_attempt_at: new Date() })
          .eq('user_id', userId)
          .eq('exercise_id', exerciseId);

        if (updateError) {
          console.error('Error updating score:', updateError);
          throw updateError;
        }

        // Call to saveUserExerciseScore to update the cache
        await exerciseCacheByDifficulty.saveUserExerciseScore(userId, exerciseId, averageScore, difficulty, existingRecord.attempts + 1);
        if (onScoreSaved) {
          onScoreSaved();
        }
      } else {
        console.log('No existing record found, inserting new record.');

        const { error: insertError } = await supabase
          .from('user_exercise_progress')
          .insert([{ user_id: userId, exercise_id: exerciseId, score }]);

        if (insertError) {
          console.error('Error inserting new record:', insertError);
          throw insertError;
        }

        await exerciseCacheByDifficulty.saveUserExerciseScore(userId, exerciseId, score, difficulty, 1);
        if (onScoreSaved) {
          onScoreSaved();
        }
      }

      toast.success('Score recorded successfully!'); // Toast notification on success
    } catch (error) {
      toast.error('Error saving score:', error);
      console.error('Error saving score:', error); // Log the error
    }
  }, [supabase]);

  return { saveScore };
};
export default useSaveScore;

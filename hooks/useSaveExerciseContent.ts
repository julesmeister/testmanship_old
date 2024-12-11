import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface SaveExerciseParams {
  supabase: SupabaseClient;
  exerciseId: string;
  content: any;
  update: boolean;
  topic: string;
  exerciseType: string;
}

export function useSaveExerciseContent() {
  const [isSaving, setIsSaving] = useState(false);

  const saveContent = async ({ supabase, exerciseId, content, update, topic, exerciseType }: SaveExerciseParams) => {
    setIsSaving(true);
    try {      
      if (update && exerciseId) {

        // Update existing exercise content
        const { error: updateError } = await supabase
          .from('exercise_content')
          .update({
            content: content,
            topic: topic,
          })
          .eq('id', exerciseId);

        if (updateError) throw updateError;
      } else {
        // Create new exercise content
        const { error: insertError } = await supabase
          .from('exercise_content')
          .insert({
            content: content,
            topic,
            exercise_type: exerciseType,
            exercise_id: exerciseId
          });

        if (insertError) throw insertError;
      }

      toast.success(update ? 'Exercise content updated!' : 'New exercise content created!');
      return { success: true };
    } catch (error) {
      console.error('Error saving exercise content:', error);
      toast.error('Failed to save exercise content');
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  return { saveContent, isSaving };
}

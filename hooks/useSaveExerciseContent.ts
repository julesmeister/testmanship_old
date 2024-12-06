import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface SaveExerciseParams {
  supabase: SupabaseClient;
  exerciseId: string;
  content: any;
}

export function useSaveExerciseContent() {
  const [isSaving, setIsSaving] = useState(false);

  const saveContent = async ({ supabase, exerciseId, content }: SaveExerciseParams) => {
    setIsSaving(true);
    try {
      // Get current exercise content
      const { data: exerciseData, error: fetchError } = await supabase
        .from('exercises')
        .select('content')
        .eq('id', exerciseId)
        .single();

      if (fetchError) throw fetchError;

      // Append new content to existing content array
      const updatedContent = exerciseData?.content || [];
      updatedContent.push(content);

      // Update exercise with new content
      const { error: updateError } = await supabase
        .from('exercises')
        .update({
          content: updatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', exerciseId);

      if (updateError) throw updateError;

      toast.success('Exercise content saved successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error saving exercise content:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save exercise content');
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveContent,
  };
}

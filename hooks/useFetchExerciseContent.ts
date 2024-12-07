import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface ExerciseContent {
  id: string;
  exercise_id: string;
  topic: string;
  content: any;
  exercise_type: string;
  order_index: number;
}

interface FetchParams {
  supabase: SupabaseClient;
  exerciseId: string;
  exerciseType?: string;
}

export const useFetchExerciseContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [exerciseContent, setExerciseContent] = useState<ExerciseContent[]>([]);

  const fetchContent = async ({ supabase, exerciseId, exerciseType }: FetchParams) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('exercise_content')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('exercise_type', exerciseType!.toLowerCase().replace(/\s+/g, '-'));

      const { data, error } = await query;

      if (error) {
        toast.error('Error fetching exercise content', {
          id: 'fetch-error',
        });
        return { success: false, data: null };
      }
      console.log('Fetched exercise content:', data);
      setExerciseContent(data || []);
      return { success: true, data };
    } catch (error) {
      toast.error('Unexpected error occurred', {
        id: 'unexpected-error',
      });
      return { success: false, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    exerciseContent,
    fetchContent,
  };
};

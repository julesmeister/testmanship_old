import { useState, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { exerciseCache, CachedExerciseContent } from '@/lib/db/exercise-cache';

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

  const fetchContent = useCallback(async ({ supabase, exerciseId, exerciseType }: FetchParams) => {
    setIsLoading(true);
    setExerciseContent([]); // Reset content when starting a new fetch

    try {
      // First, check cache
      const cachedContent = await exerciseCache.getCachedContent(
        exerciseId, 
        exerciseType!.toLowerCase().replace(/\s+/g, '-')
      );

      if (cachedContent.length > 0) {
        console.log(`🟢 Cache Hit: Retrieved ${cachedContent.length} exercise content items for exercise ${exerciseId}`, {
          exerciseId,
          exerciseType,
          cacheSize: cachedContent.length,
          cacheTimestamp: new Date(cachedContent[0].cached_at).toISOString()
        });
        setExerciseContent(cachedContent as ExerciseContent[]);
        return { success: true, data: cachedContent, fromCache: true };
      }

      console.log(`🔵 Cache Miss: No valid cache found for exercise ${exerciseId}`, {
        exerciseId,
        exerciseType
      });

      // If no valid cache, fetch from Supabase
      let query = supabase
        .from('exercise_content')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('exercise_type', exerciseType!.toLowerCase().replace(/\s+/g, '-'));

      const { data, error } = await query;

      if (error) {
        console.error(`🔴 Fetch Error: Failed to retrieve exercise content`, {
          exerciseId,
          exerciseType,
          errorMessage: error.message
        });
        toast.error('Error fetching exercise content', {
          id: 'fetch-error',
        });
        return { success: false, data: null };
      }

      // Handle empty results
      if (!data || data.length === 0) {
        console.warn(`⚠️ No exercise content found`, {
          exerciseId,
          exerciseType
        });
        // toast.warning('No exercise content available', {
        //   id: 'no-content',
        // });
        return { success: true, data: [], fromCache: false };
      }

      // Cache the fetched data
      await exerciseCache.cacheContent(data as CachedExerciseContent[]);
      console.log(`🟠 Cache Update: Stored ${data.length} exercise content items`, {
        exerciseId,
        exerciseType,
        itemCount: data.length
      });

      console.log(`🟣 Fresh Fetch: Retrieved ${data.length} exercise content items`, {
        exerciseId,
        exerciseType,
        itemCount: data.length
      });
      
      setExerciseContent(data);
      return { success: true, data, fromCache: false };
    } catch (error) {
      console.error('🚨 Unexpected error in fetchContent', error);
      toast.error('Unexpected error occurred', {
        id: 'unexpected-error',
      });
      return { success: false, data: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Manual cache clearing method
  const clearCache = useCallback(async (exerciseId?: string, exerciseType?: string) => {
    if (exerciseId && exerciseType) {
      // Clear specific exercise cache
      await exerciseCache.clearSpecificCache(exerciseId, exerciseType);
    } else {
      // Clear entire exercise cache
      await exerciseCache.clearAllCache();
    }
  }, []);

  return {
    isLoading,
    exerciseContent,
    fetchContent,
    clearCache,
  };
};

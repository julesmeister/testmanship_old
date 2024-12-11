import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';
import { exerciseCacheByDifficulty } from '@/lib/db/exercise-cache-by-difficulty';
import { useLanguageStore } from '@/stores/language';

export interface Exercise {
  id: string;
  topic: string;
  description: string;
  exercise_types: string[];
  order_index: number;
  content: any;
  completed: boolean;
  score?: number;
  duration: number;
  progress: number;
  objectives: string[];
}

export interface UseExercisesParams {
  supabase: SupabaseClient;
  user: User | null;
  difficulty: string;
}

export const useExercises = ({ supabase, user, difficulty }: UseExercisesParams) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { selectedLanguageId, languages } = useLanguageStore();

  const fetchExercises = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // First, check cache
    const cacheKey = `exercises-${user.id}-${difficulty}`;
    const cachedExercises = await exerciseCacheByDifficulty.difficultyExerciseContent
      .where('difficulty').equals(difficulty)
      .toArray();

    if (cachedExercises.length > 0) {
      console.log(`🟢 Cache Hit: Retrieved ${cachedExercises.length} exercises for ${cacheKey}`, {
        userId: user.id,
        difficulty,
        cacheSize: cachedExercises.length,
        cacheTimestamp: new Date(cachedExercises[0].cached_at).toISOString(),
        cachedExercisesDetails: cachedExercises.map(ex => ({
          exercise_id: ex.exercise_id,
          topic: ex.topic,
          description: ex.description,
          exercise_types: ex.exercise_types,
          order_index: ex.order_index
        }))
      });
      
      // Transform cached exercises to Exercise type
      const transformedCachedExercises = cachedExercises.map(cachedExercise => {
        return {
          id: cachedExercise.exercise_id,
          topic: cachedExercise.topic || 'Unnamed Exercise',  
          description: cachedExercise.description || '',
          exercise_types: cachedExercise.exercise_types,
          content: cachedExercise.content,
          order_index: cachedExercise.order_index,
          completed: false,
          score: undefined,
          duration: 10,
          progress: 0,
          objectives: cachedExercise.exercise_types
        };
      });

      setExercises(transformedCachedExercises);
      setIsLoading(false);
      return;
    }

    console.log(`🔵 Cache Miss: No valid cache found for ${cacheKey}`, {
      userId: user.id,
      difficulty
    });

    try {
      const { data: exercisesData, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('difficulty_level', difficulty)
        .eq('lang', languages.find(lang => lang.id === selectedLanguageId)?.name || 'German')
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Get user progress for completed exercises
      const { data: userProgress, error: progressError } = await supabase
        .from('user_exercise_progress')
        .select('exercise_id, score')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Map database exercises to component format from supabase
      const formattedExercises = exercisesData.map(exercise => ({
        id: exercise.id,
        exercise_id: exercise.id,
        topic: exercise.topic,
        description: exercise.description,
        exercise_types: exercise.exercise_types,
        content: exercise.content,
        difficulty,
        order_index: exercise.order_index || 0,  // Ensure order_index is included
        completed: userProgress.some(progress => progress.exercise_id === exercise.id),
        score: userProgress.find(progress => progress.exercise_id === exercise.id)?.score,
        cached_at: Date.now(),
        duration: 10,  // Default duration, adjust as needed
        progress: userProgress.find(progress => progress.exercise_id === exercise.id)?.score || 0,
        objectives: exercise.exercise_types  // Use exercise types as objectives
      })).sort((a, b) => a.order_index - b.order_index);

      // Log exercises with their order_index
      console.log('Formatted Exercises with order_index:', formattedExercises.map(ex => ({
        id: ex.id,
        topic: ex.topic,
        order_index: ex.order_index
      })));

      // Cache the exercises with full details
      await exerciseCacheByDifficulty.cacheContent(formattedExercises.map(ex => ({
        id: ex.id,
        exercise_id: ex.exercise_id,
        topic: ex.topic,
        description: ex.description,
        exercise_types: ex.exercise_types,
        content: ex.content,
        difficulty,
        order_index: ex.order_index !== undefined ? ex.order_index : 0,  // Ensure order_index is always a number
        completed: ex.completed,
        cached_at: ex.cached_at
      })));

      console.log('🔐 Cached Exercises Details:', formattedExercises.map(ex => ({
        id: ex.id,
        topic: ex.topic,
        order_index: ex.order_index,
        difficulty: difficulty
      })));

      setExercises(formattedExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user, difficulty]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return { exercises, isLoading };
};

import { useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface UserProgressSetters {
  setWeakestSkills?: (skills: string[]) => void;
  setUserProgressId?: (id: string | null) => void;
  setUpdatedAt?: (date: Date | null) => void;
  setCurrentStreak?: (streak: number) => void;
  setExercisesTaken?: (count: number) => void;
  setDifficulty?: (level: string | null) => void;
}

interface CachedUserProgress {
  data: {
    weakest_skills: string[];
    user_id: string;
    updated_at: Date | null;
    current_streak: number;
    total_exercises_completed: number;
    last_active_level: string | null;
  };
  timestamp: number;
}

export const useUserProgress = (
  supabase: SupabaseClient,
  userId: string, 
  setters: UserProgressSetters = {}
) => {
  // Method to clear cache manually
  const clearCache = (specificUserId?: string) => {
    const cacheKey = specificUserId 
      ? `user_progress_cache_${specificUserId}` 
      : Object.keys(localStorage).find(key => key.startsWith('user_progress_cache_'));
    
    if (cacheKey) {
      localStorage.removeItem(cacheKey);
    }
  };

  // Function to calculate current streak based on last activity date
  const calculateCurrentStreak = (lastActiveDate: Date | null, currentStreak: number): number => {
    if (!lastActiveDate) return currentStreak;

    const currentDate = new Date();
    const daysSinceLastActivity = Math.floor(
      (currentDate.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Reset streak if more than 1 day has passed since last activity
    return daysSinceLastActivity > 1 ? 0 : currentStreak;
  };

  useEffect(() => {
    const CACHE_KEY = `user_progress_cache_${userId}`;
    const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    const fetchUserProgress = async () => {
      try {
        // Check for cached progress
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const parsedCache: CachedUserProgress = JSON.parse(cachedData);
          const currentTime = Date.now();

          // If cache is still valid, use cached data
          if (currentTime - parsedCache.timestamp < CACHE_EXPIRATION) {
            const cachedProgress = parsedCache.data;
            const currentStreak = calculateCurrentStreak(
              cachedProgress.updated_at, 
              cachedProgress.current_streak
            );

            setters.setWeakestSkills?.(cachedProgress.weakest_skills || []);
            setters.setUserProgressId?.(cachedProgress.user_id);
            setters.setUpdatedAt?.(cachedProgress.updated_at);
            setters.setCurrentStreak?.(currentStreak);
            setters.setExercisesTaken?.(cachedProgress.total_exercises_completed);
            setters.setDifficulty?.(cachedProgress.last_active_level);
            return;
          }
        }

        // Fetch fresh data from Supabase
        const { data, error } = await supabase
          .from('user_progress')
          .select('user_id, weakest_skills, updated_at, current_streak, total_challenges_completed, total_exercises_completed, last_active_level')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        
        if (data) {
          // Calculate current streak
          const currentStreak = calculateCurrentStreak(
            data.updated_at ? new Date(data.updated_at) : null, 
            data.current_streak
          );

          // Cache the new progress
          const progressToCache = {
            data: {
              weakest_skills: data.weakest_skills || [],
              user_id: data.user_id,
              updated_at: data.updated_at,
              current_streak: currentStreak,
              total_exercises_completed: data.total_exercises_completed,
              last_active_level: data.last_active_level
            },
            timestamp: Date.now()
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(progressToCache));

          // Set the progress in the component
          setters.setWeakestSkills?.(data.weakest_skills || []);
          setters.setUserProgressId?.(data.user_id);
          setters.setUpdatedAt?.(data.updated_at);
          setters.setCurrentStreak?.(currentStreak);
          setters.setExercisesTaken?.(data.total_exercises_completed);
          setters.setDifficulty?.(data.last_active_level);

          // If streak was reset, update the database
          if (currentStreak === 0 && data.current_streak !== 0) {
            await supabase
              .from('user_progress')
              .update({ current_streak: 0 })
              .eq('user_id', userId);
          }
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }
    };

    if (userId) {
      fetchUserProgress();
    }

    // Return clearCache method if needed
    return () => {
      clearCache(userId);
    };
  }, [supabase, userId, setters]);

  // Return clearCache method so it can be used separately
  return { clearCache };
};

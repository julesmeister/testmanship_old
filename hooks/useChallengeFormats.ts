import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';
import { ChallengeFormat } from '@/types/challenge-generator';
import { difficultyLevels } from '@/utils/constants';

interface FormatCache {
  [difficulty: string]: {
    formats: ChallengeFormat[];
    timestamp: number;
  }
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const formatCache: FormatCache = {};

export function useChallengeFormats(supabase: SupabaseClient, initialDifficulty: string) {
  const [formats, setFormats] = useState<ChallengeFormat[]>([]);
  const [groupedFormats, setGroupedFormats] = useState<{ [key: string]: ChallengeFormat[] }>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateFormatsState = useCallback((formatsData: ChallengeFormat[]) => {
    setFormats(formatsData);
    setGroupedFormats(
      formatsData.reduce((acc: { [key: string]: ChallengeFormat[] }, format) => {
        const key = format.difficulty_level;
        if (!acc[key]) acc[key] = [];
        acc[key].push(format);
        return acc;
      }, {})
    );
  }, []);

  const loadFormats = useCallback(async (difficulty: string) => {
    if (!difficulty) return;

    setIsLoading(true);
    try {
      // Check cache first
      const cached = formatCache[difficulty];
      const now = Date.now();
      if (cached && now - cached.timestamp < CACHE_DURATION) {
        updateFormatsState(cached.formats);
        setIsLoading(false);
        return;
      }

      const difficultyIndex = difficultyLevels.indexOf(difficulty);
      const applicableLevels = difficultyLevels.slice(0, difficultyIndex + 1);
      
      const { data: formatsData, error } = await supabase
        .from('challenge_formats')
        .select('*')
        .in('difficulty_level', applicableLevels)
        .order('difficulty_level');

      if (error) throw error;

      // Update cache
      formatCache[difficulty] = {
        formats: formatsData,
        timestamp: now
      };

      updateFormatsState(formatsData);
    } catch (error) {
      console.error('Error loading formats:', error);
      toast.error('Failed to load formats');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, updateFormatsState]);

  // Load initial formats
  useEffect(() => {
    loadFormats(initialDifficulty);
  }, [initialDifficulty, loadFormats]);

  return {
    formats,
    groupedFormats,
    loadFormats,
    isLoading
  };
}

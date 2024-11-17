import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';
import { ChallengeFormat } from '@/types/challenge-generator';
import { difficultyLevels } from '@/utils/constants';

export function useChallengeFormats(supabase: SupabaseClient, initialDifficulty = 'A1') {
  const [formats, setFormats] = useState<ChallengeFormat[]>([]);
  const [groupedFormats, setGroupedFormats] = useState<{ [key: string]: ChallengeFormat[] }>({});

  const loadFormats = async (difficulty: string) => {
    try {
      const difficultyIndex = difficultyLevels.indexOf(difficulty as any);
      const applicableLevels = difficultyLevels.slice(0, difficultyIndex + 1);
      
      const { data: formatsData, error } = await supabase
        .from('challenge_formats')
        .select('*')
        .in('difficulty_level', applicableLevels)
        .order('difficulty_level');

      if (error) throw error;

      setFormats(formatsData);

      // Group formats by difficulty level
      const grouped = formatsData.reduce((acc: { [key: string]: any[] }, format) => {
        if (!acc[format.difficulty_level]) {
          acc[format.difficulty_level] = [];
        }
        acc[format.difficulty_level].push(format);
        return acc;
      }, {});

      setGroupedFormats(grouped);
    } catch (error) {
      console.error('Error loading formats:', error);
      toast.error('Failed to load formats');
    }
  };

  // Load initial formats
  useEffect(() => {
    loadFormats(initialDifficulty);
  }, [initialDifficulty]);

  return {
    formats,
    groupedFormats,
    loadFormats
  };
}

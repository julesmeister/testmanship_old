import { useState } from 'react';
import { toast } from 'sonner';
import { ChallengeFormat, Suggestion } from '@/types/challenge-generator';
import { UseFormGetValues } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '@/components/dashboard/challenge-generator/schema';

type FormValues = z.infer<typeof formSchema>;

export function useChallengeSuggestions(
  getFormValues: UseFormGetValues<FormValues>,
  formats: ChallengeFormat[]
) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [usedTitles, setUsedTitles] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = async () => {
    try {
      const difficulty = getFormValues('difficulty');
      const format = formats.find(f => f.id === getFormValues('format'));
      const timeAllocation = getFormValues('timeAllocation');

      if (!format) {
        toast.error('Please select a format');
        return;
      }

      setIsGenerating(true);
      toast.loading('Generating challenge suggestions...', {
        id: 'generating-suggestions',
      });

      const response = await fetch('/api/challenge-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          difficulty, 
          format: format.name, 
          timeAllocation,
          usedTitles: Array.from(usedTitles)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for rate limit error specifically
        if (response.status === 429 || data.error?.code === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before generating more suggestions.');
        }
        throw new Error('Failed to generate suggestions');
      }

      if (!data.suggestions?.length) {
        throw new Error('No suggestions received');
      }

      // Add new titles to usedTitles
      const newTitles = new Set(usedTitles);
      data.suggestions.forEach((suggestion: Suggestion) => {
        newTitles.add(suggestion.title);
      });
      setUsedTitles(newTitles);

      setSuggestions(data.suggestions);
      toast.success('Suggestions generated', {
        id: 'generating-suggestions',
      });

      return data.suggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate suggestions',
        { id: 'generating-suggestions' }
      );
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const resetUsedTitles = () => {
    setUsedTitles(new Set());
  };

  return {
    suggestions,
    setSuggestions,
    usedTitles,
    isGenerating,
    generateSuggestions,
    resetUsedTitles
  };
}

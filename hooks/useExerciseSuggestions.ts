/**
 * Custom React hook for generating one-line writing exercises.
 * 
 * This hook provides AI-generated exercises based on given weak skills,
 * with built-in error handling and loading states.
 * 
 * @example
 * ```tsx
 * const { 
 *   isLoading, 
 *   suggestion,
 *   error,
 *   generateExercise
 * } = useExerciseSuggestions();
 * 
 * // Generate an exercise for specific weak skills
 * const exercise = await generateExercise(['grammar', 'vocabulary']);
 * ```
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguageStore } from '@/stores/language';

interface ExerciseSuggestion {
  exercise_prompt: string;
  begin_phrase: string;
  vocabulary: { [key: string]: string };
  weak_skill: string;
  remaining_weak_skills: string[];
}

interface ExerciseState {
  exercise: ExerciseSuggestion | null;
  isLoading: boolean;
  error: string | null;
}

const defaultState: ExerciseState = {
  exercise: null,
  isLoading: false,
  error: null
};

interface UseExerciseSuggestionsParams {
  weak_skills?: string[];
  difficulty?: string;
}

export function useExerciseSuggestions({ weak_skills = [], difficulty = 'A1' }: UseExerciseSuggestionsParams = {}): { exercise: ExerciseSuggestion | null, isLoading: boolean, error: string | null, generateExercise: () => Promise<ExerciseSuggestion | null> } {
  const [state, setState] = useState<ExerciseState>(defaultState);
  const { selectedLanguageId, languages } = useLanguageStore();

  const generateExercise = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const selectedLanguage = languages.find(lang => lang.id === selectedLanguageId);

      const response = await fetch('/api/exercise-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weakSkills: weak_skills,
          targetLanguage: selectedLanguage?.code?.toUpperCase() || 'EN',
          difficulty
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate exercise';
        let errorDetails = null;

        try {
          // Try to parse as JSON first
          const errorData = await response.json();
          errorDetails = errorData;
          
          // Extract more specific error message if available
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.choices && errorData.choices[0]?.message?.content) {
            // Handle AI provider response format
            errorMessage = 'Received unexpected AI response';
          }
        } catch {
          // If not JSON, fall back to text
          const errorText = await response.text();
          errorMessage = errorText || `HTTP error ${response.status}: ${response.statusText}`;
        }

        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          details: errorDetails
        });

        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        exercise: data,
        isLoading: false,
        error: null
      }));
      
      return data;
    } catch (error) {
      console.error('Error generating exercise:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again later';
      setState(prev => ({
        ...prev,
        exercise: null,
        isLoading: false,
        error: errorMessage
      }));
      toast.error('Failed to generate exercise', {
        description: errorMessage
      });
      return null;
    }
  };

  if (weak_skills.length > 0 && !state.exercise && !state.isLoading && !state.error) {
    generateExercise();
  }

  return {
    ...state,
    generateExercise
  };
}

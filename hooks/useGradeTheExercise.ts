/**
 * Custom React hook for grading language exercise responses.
 * 
 * This hook handles the grading of user responses to language exercises,
 * providing grades and improved sentence suggestions.
 * 
 * @example
 * ```tsx
 * const { 
 *   isLoading, 
 *   grade,
 *   improvedSentence,
 *   error,
 *   gradeExercise
 * } = useGradeTheExercise();
 * 
 * // Grade a user's exercise response
 * const result = await gradeExercise({
 *   exercise: "Practice using past tense verbs",
 *   answer: "I gone to the store yesterday"
 * });
 * ```
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguageStore } from '@/stores/language';

interface GradingResult {
  grade: number;
  improvedSentence: string;
  begin_phrase: string
}

interface GradingState {
  result: GradingResult | null;
  isLoading: boolean;
  error: string | null;
}

const defaultState: GradingState = {
  result: null,
  isLoading: false,
  error: null
};

interface GradeExerciseParams {
  exercise: string;
  answer: string;
  difficulty: string;
}

export function useGradeTheExercise() {
  const [state, setState] = useState<GradingState>(defaultState);
  const { selectedLanguageId, languages } = useLanguageStore();

  const gradeExercise = async ({ exercise, answer, difficulty }: GradeExerciseParams): Promise<GradingResult | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
        const selectedLanguage = languages.find(lang => lang.id === selectedLanguageId);
      const response = await fetch('/api/grade-the-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise,
          answer,
          targetLanguage: selectedLanguage?.code?.toUpperCase() || 'EN',
          difficulty
        })
      });

      if (!response.ok) {
        throw new Error('Failed to grade exercise');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const result = {
        grade: data.grade,
        improvedSentence: data.improvedSentence,
        begin_phrase: data.begin_phrase
      };
      console.log('[useGradeTheExercise] Grading result:', result);

      setState(prev => ({ ...prev, result, isLoading: false }));
      return result;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to grade exercise';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      toast.error(message);
      return null;
    }
  };

  return {
    ...state,
    gradeExercise
  };
}

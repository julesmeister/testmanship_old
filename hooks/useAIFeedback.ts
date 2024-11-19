import { useState, useRef, useCallback } from 'react';
import { Challenge } from '@/types/challenge';

export interface AIFeedbackOptions {
  challenge: Challenge | null;
  minInterval?: number;
  targetLanguage?: string;
}

export const useAIFeedback = ({ challenge, minInterval = 5000, targetLanguage }: AIFeedbackOptions) => {
  const [feedback, setFeedback] = useState<string>('');
  const [lastFeedbackTime, setLastFeedbackTime] = useState<number>(0);
  const queuedFeedbackRef = useRef<NodeJS.Timeout | null>(null);

  const generateFeedback = useCallback(async (paragraphText: string, isNewParagraph: boolean = false) => {
    try {
      const response = await fetch('/api/challenge-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essayContent: paragraphText,
          challenge,
          targetLanguage: targetLanguage || 'English',
          isNewParagraph
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate feedback');
      }

      const data = await response.json();
      setFeedback(data.feedback);
      setLastFeedbackTime(Date.now());
    } catch (error) {
      console.error('Error generating feedback:', error);
    }
  }, [challenge, targetLanguage]);

  // Cleanup function for component unmount
  const cleanup = useCallback(() => {
    if (queuedFeedbackRef.current) {
      clearTimeout(queuedFeedbackRef.current);
      queuedFeedbackRef.current = null;
    }
  }, []);

  return {
    feedback,
    generateFeedback,
    cleanup
  };
};

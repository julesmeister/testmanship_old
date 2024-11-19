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

  const generateFeedback = useCallback(async (paragraphText: string): Promise<string> => {
    try {
      if (!paragraphText?.trim()) {
        throw new Error('No text provided for feedback');
      }

      if (!challenge?.id) {
        throw new Error('No active challenge found');
      }

      const response = await fetch('/api/challenge-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essayContent: paragraphText,
          challengeId: challenge.id,
          targetLanguage: targetLanguage || 'English',
        }),
      });

      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        if (!response.ok) {
          throw new Error(`Failed to generate feedback: ${response.status}`);
        }
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(errorData.message || `Failed to generate feedback: ${response.status}`);
      }

      if (!errorData?.feedback) {
        throw new Error('No feedback received from server');
      }

      const feedbackText = errorData.feedback;
      setFeedback(feedbackText);
      setLastFeedbackTime(Date.now());
      return feedbackText;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate feedback');
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

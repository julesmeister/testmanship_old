import { useState, useRef, useCallback } from 'react';
import { Challenge } from '@/types/challenge';

export interface AIFeedbackOptions {
  challenge: Challenge | null;
  minInterval?: number;
  targetLanguage?: string;
}

export const useAIFeedback = ({ challenge, targetLanguage }: AIFeedbackOptions) => {
  const [feedback, setFeedback] = useState<string>('');

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

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        // Check for rate limit error from the API
        if (response.status === 429) {
          throw new Error('rate limit exceeded');
        }
        throw new Error(responseData.message || `Failed to generate feedback: ${response.status}`);
      }

      if (!responseData?.feedback) {
        throw new Error('No feedback received from server');
      }

      const feedbackText = responseData.feedback;
      setFeedback(feedbackText);
      return feedbackText;
    } catch (error) {
      // Re-throw the error to be handled by the caller
      throw error;
    }
  }, [challenge, targetLanguage]);

  const cleanup = useCallback(() => {
    setFeedback('');
  }, []);

  return { feedback, generateFeedback, cleanup, setFeedback };
};

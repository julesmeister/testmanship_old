import { useState, useRef, useCallback, useEffect } from 'react';
import { Challenge } from '@/types/challenge';

export interface AIFeedbackOptions {
  challenge: Challenge | null;
  minInterval?: number;
  targetLanguage?: string;
}

export const useAIFeedback = ({ challenge, targetLanguage }: AIFeedbackOptions) => {
  const [feedback, setFeedback] = useState<string>('');

  // Debug: Log when hook is initialized or targetLanguage changes
  useEffect(() => {
    console.log('[useAIFeedback] Hook initialized/updated:', {
      targetLanguage,
      normalizedLanguage: targetLanguage ? targetLanguage.toUpperCase() : 'EN',
      challengeId: challenge?.id
    });
  }, [targetLanguage, challenge]);

  const generateFeedback = useCallback(async (paragraphText: string): Promise<string> => {
    try {
      if (!paragraphText?.trim()) {
        throw new Error('No text provided for feedback');
      }

      if (!challenge?.id) {
        throw new Error('No active challenge found');
      }

      console.log('[useAIFeedback] Making API request with:', {
        targetLanguage: (targetLanguage || 'EN').toUpperCase(),
        challengeId: challenge.id,
        textPreview: paragraphText.slice(0, 50) + '...'
      });

      const response = await fetch('/api/challenge-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essayContent: paragraphText,
          challenge: challenge,
          targetLanguage: (targetLanguage || 'EN').toUpperCase(),
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
          throw new Error('Our AI is taking a quick break. Please try again in a few moments for more feedback! 🧠✨');
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

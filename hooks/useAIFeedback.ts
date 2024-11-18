import { useState, useRef, useCallback } from 'react';
import { makeAIRequest } from '@/utils/ai';
import type { Challenge } from '../types/challenge';

interface AIFeedbackOptions {
  challenge: Challenge | null;
  minInterval?: number;
}

export const useAIFeedback = ({ challenge, minInterval = 5000 }: AIFeedbackOptions) => {
  const [feedback, setFeedback] = useState<string>('');
  const [lastFeedbackTime, setLastFeedbackTime] = useState<number>(0);
  const queuedFeedbackRef = useRef<NodeJS.Timeout | null>(null);

  const generateFeedback = useCallback(async (paragraphText: string, isNewParagraph: boolean = false) => {
    if (!challenge) return;

    // Clear any previously queued feedback
    if (queuedFeedbackRef.current) {
      clearTimeout(queuedFeedbackRef.current);
      queuedFeedbackRef.current = null;
    }

    const now = Date.now();
    const timeSinceLastFeedback = now - lastFeedbackTime;

    if (timeSinceLastFeedback < minInterval) {
      // Queue only the latest feedback request
      const waitTime = minInterval - timeSinceLastFeedback;
      queuedFeedbackRef.current = setTimeout(() => {
        queuedFeedbackRef.current = null;
        generateFeedback(paragraphText, isNewParagraph);
      }, waitTime);
      return;
    }

    const prompt = `Analyze the following paragraph from an essay on "${challenge?.title}". Consider these requirements:
    - Grammar focus: ${challenge?.grammar_focus?.length ? challenge.grammar_focus.join(', ') : 'Not specified'}
    - Vocabulary themes: ${challenge?.vocabulary_themes?.length ? challenge.vocabulary_themes.join(', ') : 'Not specified'}
    
    Paragraph:
    ${paragraphText}
    
    Provide:
    1. Brief feedback on this paragraph's grammar and vocabulary usage (2-3 sentences)
    ${isNewParagraph ? '2. One concise suggestion for what could be discussed in the next paragraph (1 sentence)' : ''}`;

    try {
      const suggestions = await makeAIRequest([
        {
          role: 'system',
          content: 'You are a writing assistant providing concise feedback on essay paragraphs. Focus on constructive feedback and brief, relevant suggestions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);
      setFeedback(suggestions);
      setLastFeedbackTime(Date.now());
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  }, [challenge, minInterval, lastFeedbackTime]);

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

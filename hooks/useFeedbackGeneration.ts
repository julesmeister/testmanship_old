import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  instructions: string;
  difficulty_level: string;
  time_allocation: number;
  word_count?: number;
  grammar_focus?: string[];
  vocabulary_themes?: string[];
}

export const useFeedbackGeneration = (
  challenge: Challenge | null,
  onGenerateFeedback: (paragraph: string) => Promise<string>,
) => {
  const [outputCodeState, setOutputCodeState] = useState<string>('');
  const [lastFeedbackTime, setLastFeedbackTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const MIN_FEEDBACK_INTERVAL = 5000; // 5 seconds

  const validateFeedbackRequest = useCallback((inputMessage?: string) => {
    if (!challenge) throw new Error('No active challenge found');
    if (!inputMessage?.trim()) throw new Error('No text to analyze');
    return true;
  }, [challenge]);

  const handleGenerateFeedback = useCallback(async (paragraph: string): Promise<string> => {
    validateFeedbackRequest(paragraph);
    
    const now = Date.now();
    const timeSinceLastFeedback = now - lastFeedbackTime;
    
    if (timeSinceLastFeedback < MIN_FEEDBACK_INTERVAL) {
      const waitTime = Math.ceil((MIN_FEEDBACK_INTERVAL - timeSinceLastFeedback) / 1000);
      throw new Error(`Please wait ${waitTime} seconds before requesting feedback again`);
    }

    setLastFeedbackTime(now);
    return await onGenerateFeedback(paragraph);
  }, [challenge, lastFeedbackTime, onGenerateFeedback, validateFeedbackRequest]);

  const handleParagraphFeedback = useCallback(async (paragraph: string, index: number) => {
    if (!paragraph?.trim()) {
      toast.error('No text to analyze in this paragraph');
      return;
    }

    const toastId = toast.loading(`Analyzing paragraph ${index + 1}...`);
    try {
      const feedback = await handleGenerateFeedback(paragraph);
      if (!feedback?.trim()) {
        toast.dismiss(toastId);
        toast.error('No feedback received');
        return;
      }
      setOutputCodeState(feedback);
      toast.dismiss(toastId);
      toast.success(`Generated feedback for paragraph ${index + 1}`);
    } catch (error) {
      toast.dismiss(toastId);
      let errorMessage = 'Failed to generate feedback';
      
      if (error instanceof Error) {
        // Check for rate limit error
        if (error.message.toLowerCase().includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      // Log error details without throwing
      if (process.env.NODE_ENV === 'development') {
        console.warn('Feedback generation error:', error);
      }
    }
  }, [handleGenerateFeedback]);

  const handleFinishChallenge = useCallback(async (inputMessage: string, onStopChallenge: () => void) => {
    try {
      validateFeedbackRequest(inputMessage);
      
      const toastId = toast.loading('Analyzing your complete essay...');
      setShowFeedback(true);
      
      const feedback = await handleGenerateFeedback(inputMessage);
      
      if (feedback?.trim()) {
        toast.dismiss(toastId);
        toast.success('Generated comprehensive feedback');
      } else {
        toast.dismiss(toastId);
        toast.error('No feedback received');
      }
    } catch (error) {
      let errorMessage = 'Failed to generate feedback';
      
      if (error instanceof Error) {
        // Check for rate limit error
        if (error.message.toLowerCase().includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      // Log error details without throwing
      if (process.env.NODE_ENV === 'development') {
        console.warn('Feedback generation error:', error);
      }
    } finally {
      onStopChallenge();
    }
  }, [handleGenerateFeedback, validateFeedbackRequest]);

  return {
    outputCodeState,
    showFeedback,
    setOutputCodeState,
    setShowFeedback,
    handleParagraphFeedback,
    handleFinishChallenge,
  };
};

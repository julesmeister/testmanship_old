import { useState, useCallback, useEffect } from 'react';
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
  setFeedback: (feedback: string) => void,
) => {
  const [lastFeedbackTime, setLastFeedbackTime] = useState<number>(0);
  const MIN_FEEDBACK_INTERVAL = 5000; // 5 seconds

  const validateFeedbackRequest = useCallback((inputMessage?: string) => {
    if (!challenge) throw new Error('No active challenge found');
    if (!inputMessage?.trim()) throw new Error('No text to analyze');
    return true;
  }, [challenge]);

  const handleGenerateFeedback = useCallback(async (inputMessage: string) => {
    try {
      validateFeedbackRequest(inputMessage);

      // Rate limiting check
      const now = Date.now();
      if (now - lastFeedbackTime < MIN_FEEDBACK_INTERVAL) {
        throw new Error('Please wait a moment before requesting more feedback');
      }

      const feedback = await onGenerateFeedback(inputMessage);
      setLastFeedbackTime(now);

      return feedback;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate feedback');
    }
  }, [challenge, lastFeedbackTime, onGenerateFeedback, validateFeedbackRequest]);

  const handleParagraphFeedback = useCallback(async (paragraph: string, index: number) => {
    if (!paragraph?.trim()) {
      toast.error('No text to analyze in this paragraph');
      return;
    }

    // Create loading toast with a timeout
    const toastId = toast.loading(`Analyzing paragraph ${index + 1}...`, {
      duration: 3000, // Auto dismiss after 3 seconds
      onAutoClose: () => {
        toast.dismiss(toastId);
      }
    });

    try {
      const feedback = await handleGenerateFeedback(paragraph);
      
      // Immediately dismiss loading toast
      toast.dismiss(toastId);
      
      if (!feedback?.trim()) {
        toast.error('No feedback received');
        return;
      }
      
      setFeedback(feedback);
      toast.success(`Generated feedback for paragraph ${index + 1}`);
    } catch (error) {
      // Immediately dismiss loading toast
      toast.dismiss(toastId);

      let errorMessage = 'Failed to generate feedback';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { 
        duration: 3000,
        onAutoClose: () => toast.dismiss() // Cleanup any remaining toasts
      });

      if (process.env.NODE_ENV === 'development') {
        console.warn('Feedback generation error:', error);
      }
    }
  }, [handleGenerateFeedback, setFeedback]);

  const handleFinishChallenge = useCallback(async (inputMessage: string, onStopChallenge: () => void) => {
    const toastId = toast.loading('Analyzing your complete essay...');

    try {
      validateFeedbackRequest(inputMessage);
      const feedback = await handleGenerateFeedback(inputMessage);
      
      if (feedback?.trim()) {
        setFeedback(feedback);
        toast.dismiss(toastId);
        toast.success('Generated comprehensive feedback');
      } else {
        toast.dismiss(toastId);
        toast.error('No feedback received');
      }
      
      onStopChallenge();
    } catch (error) {
      // Always dismiss the loading toast first
      toast.dismiss(toastId);

      let errorMessage = 'Failed to generate feedback';
      let duration = 3000;
      
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          errorMessage = error.message;
          duration = 5000;
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage, { duration });

      if (process.env.NODE_ENV === 'development') {
        console.warn('Challenge completion error:', error);
      }
    }
  }, [handleGenerateFeedback, setFeedback, validateFeedbackRequest]);

  // Clear feedback content and any lingering toasts when challenge changes
  useEffect(() => {
    setFeedback('');
    toast.dismiss(); // Dismiss any lingering toasts
  }, [challenge, setFeedback]);

  return {
    handleParagraphFeedback,
    handleFinishChallenge,
  };
};

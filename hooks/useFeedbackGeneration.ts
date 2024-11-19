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

  const handleToast = useCallback((type: 'success' | 'error' | 'loading', message: string, loadingToastId?: string) => {
    if (loadingToastId) toast.dismiss(loadingToastId);
    toast[type](message);
    return type === 'loading' ? message : undefined;
  }, []);

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
      handleToast('error', 'No text to analyze in this paragraph');
      return;
    }

    const loadingToastId = handleToast('loading', `Analyzing paragraph ${index + 1}...`);
    try {
      const feedback = await handleGenerateFeedback(paragraph);
      if (!feedback?.trim()) {
        handleToast('error', 'No feedback received', loadingToastId);
        return;
      }
      setOutputCodeState(feedback);
      handleToast('success', `Generated feedback for paragraph ${index + 1}`, loadingToastId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate feedback';
      handleToast('error', message, loadingToastId);
    }
  }, [handleGenerateFeedback, handleToast]);

  const handleFinishChallenge = useCallback(async (inputMessage: string, onStopChallenge: () => void) => {
    try {
      validateFeedbackRequest(inputMessage);
      
      const loadingToastId = handleToast('loading', 'Analyzing your complete essay...');
      setShowFeedback(true);
      
      const feedback = await handleGenerateFeedback(inputMessage);
      
      if (feedback?.trim()) {
        handleToast('success', 'Generated comprehensive feedback', loadingToastId);
      } else {
        handleToast('error', 'No feedback received', loadingToastId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate feedback';
      handleToast('error', message);
    } finally {
      onStopChallenge();
    }
  }, [handleGenerateFeedback, handleToast, validateFeedbackRequest]);

  return {
    outputCodeState,
    showFeedback,
    setOutputCodeState,
    setShowFeedback,
    handleParagraphFeedback,
    handleFinishChallenge,
  };
};

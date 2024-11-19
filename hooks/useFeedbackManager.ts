import { useRef, useEffect } from 'react';

export const useFeedbackManager = (generateFeedback: (text: string) => void) => {
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleParagraphChange = (
    currentText: string,
    prevText: string,
    lastEditedIndex: number
  ) => {
    // Clear any existing timeouts
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    if (editingTimeoutRef.current) {
      clearTimeout(editingTimeoutRef.current);
      editingTimeoutRef.current = null;
    }

    const currentParagraphs = currentText.split(/\n\s*\n/);
    const prevParagraphs = prevText.split(/\n\s*\n/);

    const justCreatedNewParagraph = 
      currentText.endsWith('\n\n') && 
      !prevText.endsWith('\n\n') && 
      currentParagraphs.length > prevParagraphs.length;

    if (justCreatedNewParagraph && currentParagraphs.length >= 2) {
      const lastCompletedParagraph = currentParagraphs[currentParagraphs.length - 2];
      if (lastCompletedParagraph?.trim().length > 0) {
        feedbackTimeoutRef.current = setTimeout(() => {
          generateFeedback(lastCompletedParagraph);
        }, 1000);
      }
    } else if (lastEditedIndex !== -1 && 
               lastEditedIndex !== currentParagraphs.length - 1 && 
               currentParagraphs[lastEditedIndex]?.trim().length > 0) {
      editingTimeoutRef.current = setTimeout(() => {
        generateFeedback(currentParagraphs[lastEditedIndex]);
      }, 1500);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      if (editingTimeoutRef.current) clearTimeout(editingTimeoutRef.current);
    };
  }, []);

  return { handleParagraphChange };
};

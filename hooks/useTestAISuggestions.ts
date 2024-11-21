import { useState, useEffect, useRef, useCallback } from 'react';
import { Challenge } from '@/types/challenge';

export interface UseTestAISuggestionsProps {
  challenge: Challenge | null;
  content: string;
  enabled: boolean;
  interval?: number;
  onSuggestion: (suggestion: string) => void;
  onError?: (error: string) => void;
  targetLanguage?: string;
}

export const useTestAISuggestions = ({
  challenge,
  content,
  enabled,
  interval = 20000,
  onSuggestion,
  onError,
  targetLanguage = 'EN'
}: UseTestAISuggestionsProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastContentRef = useRef<string>('');

  const generateSuggestion = useCallback(async () => {
    if (!challenge || !content.trim()) {
      console.log('[Hook] Skipping suggestion - no challenge or content');
      return;
    }

    if (!enabled) {
      console.log('[Hook] Skipping suggestion - disabled');
      return;
    }

    if (isRateLimited || isDailyLimitReached) {
      console.log('[Hook] Skipping suggestion - rate limited');
      return;
    }

    // Don't generate if content hasn't changed
    if (content === lastContentRef.current) {
      console.log('[Hook] Skipping suggestion - content unchanged');
      return;
    }
    lastContentRef.current = content;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/test-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge,
          content,
          targetLanguage
        }),
        signal: abortControllerRef.current.signal
      });

      const responseData = await response.json();

      if (response.status === 429) {
        const isDaily = responseData.error?.message?.includes('free-models-per-day');
        console.log('[Hook] Rate limited:', isDaily ? 'daily limit' : 'temporary');
        
        if (isDaily) {
          setIsDailyLimitReached(true);
          onError?.("We've reached today's AI suggestion limit. Don't worry though - it'll reset tomorrow! 🌅");
        } else {
          setIsRateLimited(true);
          onError?.("Taking a quick breather to process suggestions. Keep writing! ✨");
        }
        return;
      }

      if (!response.ok) {
        const error = responseData.error?.message || "Oops! Something's not quite right with suggestions right now";
        console.error('[Hook] Suggestion API error:', error);
        onError?.(error);
        throw new Error(error);
      }

      console.log('[Hook] Received suggestion:', {
        preview: responseData.suggestion?.slice(0, 50) + '...'
      });
      onSuggestion(responseData.suggestion);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[Hook] Request aborted');
        return;
      }
      console.error('[Hook] Error generating suggestion:', error);
      onError?.("Having a bit of trouble with suggestions at the moment. Keep writing - you're doing great! 🌟");
    }
  }, [challenge, content, targetLanguage, onSuggestion, onError, enabled, isRateLimited, isDailyLimitReached]);

  const stop = useCallback(() => {
    console.log('[Hook] Stopping suggestions');
    setIsActive(false);
    
    // Clear interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Clear debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // Cancel pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!enabled) {
      console.log('[Hook] Not starting - disabled');
      return;
    }
    if (!challenge) {
      console.log('[Hook] Not starting - no challenge');
      return;
    }
    if (!content.trim()) {
      console.log('[Hook] Not starting - no content');
      return;
    }
    if (isRateLimited || isDailyLimitReached) {
      console.log('[Hook] Not starting - rate limited');
      return;
    }
    
    console.log('[Hook] Starting suggestions');
    setIsActive(true);
    generateSuggestion();
  }, [enabled, challenge, content, generateSuggestion, isRateLimited, isDailyLimitReached]);

  // Handle content changes with debounce
  useEffect(() => {
    if (!enabled) return;

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // Set new debounce timer
    debounceRef.current = setTimeout(() => {
      start();
    }, 1000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [enabled, content, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      setIsRateLimited(false);
      setIsDailyLimitReached(false);
      lastContentRef.current = '';
    };
  }, [stop]);

  return {
    isActive,
    isRateLimited,
    isDailyLimitReached,
    stop,
    start
  };
};

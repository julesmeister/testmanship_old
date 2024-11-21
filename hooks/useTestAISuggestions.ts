/**
 * Custom React hook for managing AI-powered writing suggestions.
 * 
 * This hook provides real-time writing assistance by generating contextual suggestions
 * while efficiently managing API resources and rate limits. It implements:
 * - Debounced suggestions (1s after typing stops)
 * - Rate limit handling (both temporary and daily)
 * - Request cancellation for stale suggestions
 * - User-friendly error messages
 * 
 * @example
 * ```tsx
 * const {
 *   isActive,
 *   isRateLimited,
 *   isDailyLimitReached,
 *   stop,
 *   generateSuggestion
 * } = useTestAISuggestions({
 *   challenge: selectedChallenge,
 *   content: userText,
 *   enabled: true,
 *   onSuggestion: (suggestion) => setCurrentSuggestion(suggestion),
 *   onError: (error) => toast(error)
 * });
 * ```
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Challenge } from '@/types/challenge';

/**
 * Props for the useTestAISuggestions hook.
 */
export interface UseTestAISuggestionsProps {
  /** The current challenge being attempted */
  challenge: Challenge | null;
  /** The current text content being written */
  content: string;
  /** Whether the suggestion system is enabled */
  enabled: boolean;
  /** Callback function to handle new suggestions */
  onSuggestion: (suggestion: string) => void;
  /** Optional callback for error handling */
  onError?: (error: string) => void;
  /** Target language code (default: 'EN') */
  targetLanguage?: string;
}

/**
 * Custom React hook for managing AI-powered writing suggestions.
 * 
 * @param props - Hook props
 * @returns An object containing the hook's state and methods
 */
export const useTestAISuggestions = ({
  challenge,
  content,
  enabled,
  onSuggestion,
  onError,
  targetLanguage = 'EN'
}: UseTestAISuggestionsProps) => {
  // Track active state and rate limits
  const [isActive, setIsActive] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);

  // Refs for managing requests and content
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSentContentRef = useRef<string>('');

  /**
   * Checks if the content has changed since the last API call
   */
  const hasContentChanged = useCallback(() => {
    return content !== lastSentContentRef.current;
  }, [content]);

  /**
   * Generates a new AI suggestion based on current content.
   * Handles API calls, rate limits, and error states.
   */
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

    if (!hasContentChanged()) {
      console.log('[Hook] Skipping suggestion - content unchanged since last call');
      return;
    }

    // Update last sent content before making the API call
    lastSentContentRef.current = content;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setIsActive(true);
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

      console.log('[Hook] Received suggestion');
      onSuggestion(responseData.suggestion);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[Hook] Request aborted');
        return;
      }
      console.error('[Hook] Error generating suggestion:', error);
      onError?.("Having a bit of trouble with suggestions at the moment. Keep writing - you're doing great! 🌟");
    } finally {
      setIsActive(false);
    }
  }, [challenge, content, targetLanguage, onSuggestion, onError, enabled, isRateLimited, isDailyLimitReached, hasContentChanged]);

  /**
   * Cleanup effect that runs on unmount
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsRateLimited(false);
      setIsDailyLimitReached(false);
      lastSentContentRef.current = '';
    };
  }, []);

  return {
    isActive,
    isRateLimited,
    isDailyLimitReached,
    stop: useCallback(() => {
      setIsActive(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, []),
    generateSuggestion
  };
};

/**
 * ⚠️ DOCUMENTATION NOTICE
 * Before making any changes to this file, please review the DOCUMENTATION.md in this directory.
 * After making changes, update the DOCUMENTATION.md file accordingly.
 * This helps maintain accurate and up-to-date documentation of the test system.
 * 
 * 
 * Additional resources:
 * - See FEEDBACK_MECHANISM.md for AI feedback implementation details
 */

'use client';
/*eslint-disable*/

import DashboardLayout from '@/components/layout';
import { useLanguageStore } from '@/stores/language';
import { ChatBody, OpenAIModel } from '@/types/types';
import { User } from '@supabase/supabase-js';
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TimerProgress from './TimerProgress';
import { Card, CardContent } from '@/components/ui/card';
import LeftColumn from './LeftColumn';
import { makeAIRequest } from '@/utils/ai';
import { useAIFeedback } from '@/hooks/useAIFeedback';
import { type Challenge } from '@/types/challenge';
import { useTextEditor } from '@/hooks/useTextEditor';
import { useChallengeTimer } from '@/hooks/useChallengeTimer';
import { useFeedbackManager } from '@/hooks/useFeedbackManager';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { rateLimit } from '@/utils/rateLimit';
import { sanitizeInput } from '@/utils/security';
import { calculateMetrics } from '@/utils/metrics';
import { createClient } from '@supabase/supabase-js';
import { useTestAISuggestions } from '@/hooks/useTestAISuggestions';
import { toast } from 'sonner';
import { useTestState } from '@/hooks/useTestState';
import { PencilIcon, ClockIcon, CheckCircleIcon, ChatBubbleBottomCenterTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

interface StatCardProps {
  label: string;
  value: string | number;
}

const StatCard = ({ label, value }: StatCardProps) => (
  <Card className="bg-card">
    <CardContent className="p-6">
      <div className="flex flex-col space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </div>
    </CardContent>
  </Card>
);

// Add inputMessage to the selected challenge
const extendChallenge = (challenge: Challenge | null, currentInputMessage: string) => {
  if (!challenge) return null;
  return {
    ...challenge,
    inputMessage: currentInputMessage
  };
};

export default function Test({ user, userDetails }: Props) {
  const { showChallenges, showEvaluation, idleTimer, setIdleTimer, startChallenge } = useTestState();
  const [outputCode, setOutputCode] = useState<string>('');
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [mode, setMode] = useState<'practice' | 'exam'>('exam');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [showFeedbackState, setShowFeedbackState] = useState(false);
  const [manuallyClosedFeedbackState, setManuallyClosedFeedbackState] = useState(false);
  const [rateLimitExceeded, setRateLimitExceeded] = useState<boolean>(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [currentSuggestion, setCurrentSuggestion] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [lastTyped, setLastTyped] = useState<number>(Date.now());
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging for language selection
  const { selectedLanguageId, languages } = useLanguageStore();
  const selectedLanguage = languages.find(lang => lang.id === selectedLanguageId);

  useEffect(() => {
    console.log('[Test Component] Language State:', {
      selectedLanguageId,
      languages,
      selectedLanguage,
      targetLanguageCode: selectedLanguage?.code?.toUpperCase()
    });
  }, [selectedLanguageId, languages, selectedLanguage]);

  const { feedback, generateFeedback, cleanup: cleanupFeedback, setFeedback } = useAIFeedback({
    challenge: selectedChallenge,
    targetLanguage: selectedLanguage?.code?.toUpperCase() || 'EN'
  });

  useEffect(() => {
    console.log('[Test Component] AIFeedback Hook Initialization:', {
      targetLanguage: selectedLanguage?.code?.toUpperCase() || 'EN'
    });
  }, [selectedLanguage]);

  const {
    text: inputMessage,
    stats: { wordCount, paragraphCount, charCount },
    setInputMessage,
    handleTextChange: handleTextStats
  } = useTextEditor();

  const {
    elapsedTime,
    isTimeUp,
    isWriting,
    startTimer,
    resetTimer,
    setIsWriting
  } = useChallengeTimer(selectedChallenge);

  const {
    handleParagraphChange
  } = useFeedbackManager(generateFeedback);

  const {
    isActive: isSuggestionActive,
    isRateLimited,
    isDailyLimitReached,
    stop: stopSuggestions,
    generateSuggestion
  } = useTestAISuggestions({
    challenge: selectedChallenge,
    content: inputMessage,
    enabled: !isTimeUp,
    targetLanguage: selectedLanguage?.code?.toUpperCase() || 'EN',
    onSuggestion: (suggestion) => {
      setCurrentSuggestion(suggestion);
      // Reset idle timer when suggestion is received
      setIdleTimer(null);
    },
    onError: (error) => {
      toast.error(error);
      // Reset idle timer on error
      setIdleTimer(null);
    }
  });

  useEffect(() => {
    setError('');
  }, [inputMessage]);

  useEffect(() => {
    if (error) {
      toast(error, {
        duration: isDailyLimitReached ? 10000 : 5000
      });
    }
  }, [error, isDailyLimitReached]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputMessage(newValue);
    setLastTyped(Date.now());
    
    // Clear existing timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      setIdleTimer(null);
    }

    // Set new timer
    idleTimerRef.current = setTimeout(() => {
      if (!selectedChallenge) return;
      
      toast.info("Generating writing suggestions...", {
        duration: 3000,
        position: 'bottom-right'
      });
      generateSuggestion();
    }, 20000); // 20 seconds

    // Stop existing suggestions when user starts typing
    console.log('[Index] Text changed, stopping suggestions');
    stopSuggestions();
    
    // Update stats
    handleTextStats(newValue);
    
    // Auto-adjust height
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
    
    // Show feedback state if needed
    if (newValue.length > 0 && !showFeedbackState && !manuallyClosedFeedbackState) {
      setShowFeedbackState(true);
    }
    
    if (isTimeUp) return;
    
    if (!isWriting && newValue.length > 0 && !isTimeUp) {
      setIsWriting(true);
    }

    // Calculate current paragraph index by counting double newlines
    const paragraphs = newValue.split(/\n\s*\n/);
    const currentIndex = paragraphs.length - 1;
    
    // Only trigger paragraph change if content actually changed
    if (newValue !== inputMessage) {
      handleParagraphChange(newValue, inputMessage, currentIndex);
    }
  }, [generateSuggestion, handleTextStats, stopSuggestions, handleParagraphChange, inputMessage, isTimeUp, isWriting, manuallyClosedFeedbackState, showFeedbackState]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const cursorPosition = e.currentTarget.selectionStart;
      const newValue = inputMessage.slice(0, cursorPosition) + '\n\n' + inputMessage.slice(cursorPosition);
      setInputMessage(newValue);
      
      // Store the reference to the current target
      const textarea = e.currentTarget;
      
      // Set cursor position after the new paragraph
      setTimeout(() => {
        if (textarea) {
          textarea.selectionStart = cursorPosition + 2;
          textarea.selectionEnd = cursorPosition + 2;
        }
      }, 0);
    }
  };

  const handleStartChallenge = (challenge: Challenge) => {
    startChallenge(); // This will reset idleTimer to 20 and set proper states
    setSelectedChallenge(challenge);
    setInputMessage('');
    setOutputCode('');
    setManuallyClosedFeedbackState(false);
    setShowFeedbackState(false);
    setCurrentSuggestion(''); // Clear current suggestion when starting new challenge
  };

  const handleStopChallenge = () => {
    resetTimer();
    setSelectedChallenge(null);
    setInputMessage('');
    setOutputCode('');
    setShowFeedbackState(false);
    setManuallyClosedFeedbackState(false);
  };

  const handleBackToChallenges = () => {
    handleStopChallenge();
  };

  const handleGenerateFeedback = async (paragraph: string): Promise<string> => {
    if (isGeneratingFeedback) {
      throw new Error('Feedback generation already in progress');
    }

    // Check rate limit before proceeding
    try {
      await checkRateLimit();
    } catch (error) {
      setRateLimitExceeded(true);
      throw new Error('Too many feedback requests. Please wait a moment.');
    }

    // Sanitize and validate input
    const sanitizedParagraph = sanitizeInput(paragraph);
    if (!validateSubmission(sanitizedParagraph)) {
      throw new Error(securityError || 'Invalid input');
    }

    setIsGeneratingFeedback(true);
    try {
      return await generateFeedback(sanitizedParagraph);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const validateSubmission = (content: string): boolean => {
    // Reset previous error
    setSecurityError(null);

    // Basic content validation
    if (!content.trim()) {
      setSecurityError('Content cannot be empty');
      return false;
    }
    
    // Get text metrics
    const metrics = calculateMetrics(content);
    
    // Validate content length
    if (metrics.wordCount < 5) {
      setSecurityError('Content is too short (minimum 5 words)');
      return false;
    }
    
    if (metrics.wordCount > 1000) {
      setSecurityError('Content is too long (maximum 1000 words)');
      return false;
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(content))) {
      setSecurityError('Invalid content detected');
      return false;
    }

    return true;
  };

  // Add authentication check with proper types
  useAuthCheck({ 
    user: user || null, 
    userDetails, 
    supabase 
  });

  // Rate limiting function
  const checkRateLimit = useCallback(async () => {
    const key = user?.id || 'anonymous';
    if (rateLimit.isLimited(key)) {
      setRateLimitExceeded(true);
      throw new Error('Rate limit exceeded. Please wait a moment.');
    }
    setRateLimitExceeded(false);
  }, [user?.id]);

  const handleGradeChallenge = async () => {
    setSecurityError(null);
    
    // Authentication check
    if (!user?.id || !selectedChallenge?.id) {
      toast.error('Authentication required to save results');
      return;
    }

    // Rate limit check
    if (rateLimitExceeded) {
      toast.error('Please wait before submitting another challenge');
      return;
    }

    try {
      setLoading(true);

      // Trigger evaluation
      const response = await fetch('/api/challenge-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          content: inputMessage,
          timeSpent: selectedChallenge.time_allocation || 1800
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to evaluate challenge');
      }
      
      toast.success('Challenge completed! Viewing evaluation...');
      
      // Let the timer handle setting isTimeUp
      if (!isTimeUp) {
        handleBackToChallenges();
      }
    } catch (error) {
      console.error('Error grading challenge:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to grade challenge');
    } finally {
      setLoading(false);
    }
  };

  // Update countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (lastTyped) {
      interval = setInterval(() => {
        const elapsed = Date.now() - lastTyped;
        const remaining = Math.max(0, 20 - Math.floor(elapsed / 1000));
        
        if (remaining > 0 && !isSuggestionActive) {
          setIdleTimer(remaining);
        } else {
          setIdleTimer(null);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lastTyped, isSuggestionActive]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  const performanceMetrics = useMemo(() => ({
    wordCount,
    paragraphCount,
    timeSpent: elapsedTime,
    metrics: {
      grammar: 0.85,
      vocabulary: 0.78,
      fluency: 0.82,
      overall: 0.82
    }
  }), [wordCount, paragraphCount, elapsedTime]);

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Writing Assistant"
      description="Get instant feedback on your writing"
    >
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <LeftColumn
          challenge={selectedChallenge}
          outputCode={feedback}
          onStartChallenge={handleStartChallenge}
          onStopChallenge={handleStopChallenge}
          onGenerateFeedback={handleGenerateFeedback}
          isGeneratingFeedback={isGeneratingFeedback}
          isTimeUp={isTimeUp}
          mode={mode}
          timeElapsed={elapsedTime}
          timeAllocation={selectedChallenge?.time_allocation}
          inputMessage={inputMessage}
          showFeedback={showFeedbackState}
          manuallyClosedFeedback={manuallyClosedFeedbackState}
          setManuallyClosedFeedback={setManuallyClosedFeedbackState}
          setShowFeedback={setShowFeedbackState}
          currentSuggestion={currentSuggestion}
          stopSuggestions={stopSuggestions}
          setCurrentSuggestion={setCurrentSuggestion}
          generateSuggestion={generateSuggestion}
          isSuggestionActive={isSuggestionActive}
        />

        {/* Writing Area */}
        <div className="flex-1 flex flex-col space-y-4 w-full lg:w-2/3">
          {!selectedChallenge ? (
            <Tabs defaultValue="practice" className="w-full" onValueChange={value => setMode(value as 'practice' | 'exam')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="practice" 
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500 
                            data-[state=inactive]:text-indigo-600 dark:data-[state=inactive]:text-indigo-400
                            hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  Practice Mode
                </TabsTrigger>
                <TabsTrigger 
                  value="exam" 
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500
                            data-[state=inactive]:text-indigo-600 dark:data-[state=inactive]:text-indigo-400
                            hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  Exam Mode
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            <TimerProgress
              timeElapsed={elapsedTime}
              timeAllocation={selectedChallenge.time_allocation}
              mode={mode}
              onGradeChallenge={handleGradeChallenge}
              wordCount={wordCount}
              requiredWordCount={selectedChallenge.word_count}
              showGradeButton={wordCount >= (selectedChallenge.word_count || 0)}
            />
          )}
          {selectedChallenge ? (
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Start writing your essay here..."
              spellCheck="false"
              style={{
                backgroundImage: `
                  linear-gradient(transparent, transparent calc(1.5rem - 1px), #e5e7eb calc(1.5rem - 1px), #e5e7eb 1.5rem, transparent 1.5rem),
                  linear-gradient(90deg, transparent 4rem, #f3f4f6 4rem, #f3f4f6 4.25rem, transparent 4.25rem),
                  linear-gradient(#fafafa, #fafafa)
                `,
                backgroundSize: '100% 1.5rem, 100% 100%, 100% 100%',
                backgroundAttachment: 'local, scroll, scroll',
                lineHeight: '1.5rem',
                paddingTop: '1.5rem',
                paddingLeft: '4.5rem',
                fontFamily: '"Special Elite", "Courier New", monospace',
                fontWeight: '600',
                fontSize: '1.125rem'
              }}
              className="flex-1 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 resize-none focus:outline-none focus:ring-0 min-h-[200px] scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent whitespace-pre-wrap text-zinc-700 shadow-inner [background-color:rgb(255_255_255/0.5)] dark:[background-color:rgb(24_24_27/0.3)]"
              disabled={isTimeUp}
            />
          ) : (
            <div className="flex-1 w-full min-h-[200px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <PencilIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="space-y-2 text-center max-w-sm">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  Ready to Start Writing?
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Select a challenge from the list to begin your writing journey. We'll track your progress and provide feedback along the way.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-6 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <div className="space-y-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors duration-200 cursor-pointer bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Practice Mode</h4>
                      <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 text-left">
                      Get real-time AI assistance as you write. Receive sentence suggestions when idle and choose to receive feedback on select paragraph. Perfect for improving your writing skills with guidance.
                    </p>
                  </div>
                  <div className="space-y-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors duration-200 cursor-pointer bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Exam Mode</h4>
                      <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 text-left">
                      Write independently without assistance. Get comprehensive evaluation upon completion, with detailed strengths and weaknesses analysis for your writing portfolio.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-xs text-zinc-400 dark:text-zinc-500 pt-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>Timer starts when you select a challenge</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm text-zinc-400 dark:text-zinc-500">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  <span>Progress Tracking</span>
                </div>
                <div className="flex items-center">
                  <ChatBubbleBottomCenterTextIcon className="w-4 h-4 mr-1" />
                  <span>Instant Feedback</span>
                </div>
                <div className="flex items-center">
                  <ChartBarIcon className="w-4 h-4 mr-1" />
                  <span>Performance Stats</span>
                </div>
              </div>
            </div>
          )}
          {/* Writing Statistics Bar */}
          {selectedChallenge && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[/* eslint-disable @typescript-eslint/no-use-before-define */
                { label: 'Words', value: wordCount },
                { label: 'Paragraphs', value: paragraphCount },
                { label: 'Characters', value: charCount },
                { label: 'Time Elapsed', value: formatTime(elapsedTime) }
              ].map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </div>)}
        </div>
      </div>
      {/* Idle Timer Badge */}
      {idleTimer !== null && selectedChallenge && !showChallenges && !showEvaluation && (
        <div className="fixed bottom-4 right-4 py-1 px-3 bg-orange-500 text-white text-sm font-medium rounded-full shadow-lg">
          Idle: {idleTimer}s
        </div>
      )}
    </DashboardLayout>
  );
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

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
import { User } from '@supabase/supabase-js';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TimerProgress from './TimerProgress';
import { Card, CardContent } from '@/components/ui/card';
import LeftColumn from './LeftColumn';
import { startProgress } from '@/components/ui/progress-bar';
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
import { useEvaluationState } from '@/hooks/useEvaluationState';
import { PencilIcon, ClockIcon, CheckCircleIcon, ChatBubbleBottomCenterTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import EmptyTestState from './components/EmptyTestState';

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
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [mode, setMode] = useState<'practice' | 'exam'>('exam');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [showFeedbackState, setShowFeedbackState] = useState(false);
  const [manuallyClosedFeedbackState, setManuallyClosedFeedbackState] = useState(false);
  const [rateLimitExceeded, setRateLimitExceeded] = useState<boolean>(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [currentSuggestion, setCurrentSuggestion] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [lastTyped, setLastTyped] = useState<number | null>(Date.now());
  const [format, setFormat] = useState<string>('');
  const [checkedPhrases, setCheckedPhrases] = useState<boolean[]>([]);
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
    setIsWriting,
    forceTimeUp
  } = useChallengeTimer(selectedChallenge);

  const handleForceTimeUp = () => {
    forceTimeUp();
  };

  const {
    handleParagraphChange
  } = useFeedbackManager(generateFeedback);

  const {
    insights,
    isLoading: evaluationLoading,
    error: evaluationError,
    performanceMetrics: evaluatedPerformanceMetrics,
    skillMetrics: evaluatedSkillMetrics
  } = useEvaluationState(selectedChallenge, isTimeUp, inputMessage, format);

  const {
    isActive: isSuggestionActive,
    isRateLimited,
    isDailyLimitReached,
    stop: stopSuggestions,
    generateSuggestion
  } = useTestAISuggestions({
    challenge: selectedChallenge,
    content: inputMessage,
    enabled: !isTimeUp && !evaluationLoading && !showEvaluation,
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

  useEffect(() => {
    const fetchFormat = async () => {
      if (selectedChallenge?.format_id) {
        console.log('Fetching format for format_id:', selectedChallenge.format_id);
        const { data: formatData, error } = await supabase
          .from('challenge_formats')
          .select('name')
          .eq('id', selectedChallenge.format_id)
          .single();

        if (formatData) {
          console.log('Format fetched successfully:', formatData.name);
          setFormat(formatData.name);
        } else if (error) {
          console.error('Error fetching format:', error);
          setFormat('Unknown Format');
        }
      } else {
        console.log('No format_id available in selectedChallenge');
        setFormat('Unknown Format');
      }
    };

    fetchFormat();
  }, [selectedChallenge?.format_id, supabase]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const clearTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current);
      idleTimerRef.current = null;
      setIdleTimer(null);
    }
  }, [setIdleTimer]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputMessage(newText);
    setLastTyped(Date.now());

    // Check for phrases if we have a challenge selected
    if (selectedChallenge?.checklist) {
      const newCheckedPhrases = selectedChallenge.checklist.map(phrase =>
        newText.toLowerCase().includes(phrase.toLowerCase())
      );
      setCheckedPhrases(newCheckedPhrases);
    }

    // Clear existing timer
    clearTimer();



    // Stop existing suggestions when user starts typing
    console.log('[Index] Text changed, stopping suggestions');
    stopSuggestions();

    // Update stats
    handleTextStats(newText);

    // Auto-adjust height
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;

    // Show feedback state if needed
    if (newText.length > 0 && !showFeedbackState && !manuallyClosedFeedbackState) {
      setShowFeedbackState(true);
    }

    if (isTimeUp) return;

    if (!isWriting && newText.length > 0 && !isTimeUp) {
      setIsWriting(true);
    }

    // Calculate current paragraph index by counting double newlines
    const paragraphs = newText.split(/\n\s*\n/);
    const currentIndex = paragraphs.length - 1;

    // Only trigger paragraph change if content actually changed
    if (newText !== inputMessage) {
      handleParagraphChange(newText, inputMessage, currentIndex);
    }
  }, [generateSuggestion, handleTextStats, stopSuggestions, handleParagraphChange, inputMessage, isTimeUp, isWriting, manuallyClosedFeedbackState, showFeedbackState, selectedChallenge?.checklist]);

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
    setLastTyped(null);
    resetTimer();
    setSelectedChallenge(null);
    setInputMessage('');
    setOutputCode('');
    setShowFeedbackState(false);
    setManuallyClosedFeedbackState(false);
  };

  const handleGenerateFeedback = async (paragraph: string): Promise<string> => {
    if (isGeneratingFeedback) {
      throw new Error('Feedback generation already in progress');
    }

    // Check rate limit before proceeding
    try {
      checkRateLimit();
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
      const feedback = await generateFeedback(sanitizedParagraph);
      return feedback;
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
  const checkRateLimit = useCallback(() => {
    const key = user?.id || 'anonymous';
    if (rateLimit.isLimited(key)) {
      setRateLimitExceeded(true);
      throw new Error('Rate limit exceeded. Please wait a moment.');
    }
    setRateLimitExceeded(false);
  }, [user?.id]);



  // Calculate initial metrics for display before evaluation
  const initialPerformanceMetrics = {
    wordCount: inputMessage ? inputMessage.split(/\s+/).filter(word => word.length > 0).length : 0,
    paragraphCount: inputMessage ? inputMessage.split(/\n\s*\n/).filter(para => para.trim().length > 0).length : 0,
    timeSpent: elapsedTime || 0,
    performanceScore: 0,
    metrics: {
      grammar: 0,
      vocabulary: 0,
      fluency: 0,
      overall: 0
    }
  };

  // Combine real-time counts with evaluated metrics
  const performanceMetrics = {
    ...initialPerformanceMetrics,
    ...evaluatedPerformanceMetrics,
    wordCount: initialPerformanceMetrics.wordCount,
    paragraphCount: initialPerformanceMetrics.paragraphCount,
    timeSpent: initialPerformanceMetrics.timeSpent,
  };

  const skillMetrics = evaluatedSkillMetrics;

  const handleGradeChallenge = async () => {
    if (!insights || !performanceMetrics || !skillMetrics) {
      console.error('Missing required evaluation data');
      return;
    }

    // Start progress before navigation
    startProgress();

    // Create the URL parameters
    const searchParams = new URLSearchParams({
      content: inputMessage, // Use the actual textarea content
      difficulty_level: selectedChallenge?.difficulty_level || 'A1',
      insights: JSON.stringify({ insights }),
      challengeId: selectedChallenge?.id || '00000000-0000-0000-0000-000000000001',  // Use UUID format
      performanceMetrics: JSON.stringify(performanceMetrics),
      skillMetrics: JSON.stringify(skillMetrics)
    });

    // Use window.location for client-side navigation
    window.location.href = `/dashboard/recording-evaluation?${searchParams.toString()}`;
  };

  // Function to trigger fresh evaluation
  const handleRefreshEvaluation = useCallback(() => {
    if (selectedChallenge && inputMessage && isTimeUp) {
      // Force a fresh evaluation by creating a new state object
      setSelectedChallenge({ ...selectedChallenge });
    }
  }, [selectedChallenge, inputMessage, isTimeUp]);

  // Update countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (lastTyped) {
      interval = setInterval(() => {
        const elapsed = Date.now() - lastTyped;
        const remaining = Math.max(0, 30 - Math.floor(elapsed / 1000));

        if (remaining > 0 && !isSuggestionActive) {
          setIdleTimer(remaining);
        } else {
          clearTimer();
          // Only generate if still enabled
          if (!isTimeUp && !evaluationLoading && !showEvaluation && selectedChallenge && mode === 'practice') {
            toast.info("Generating writing suggestions...", {
              duration: 3000,
              position: 'bottom-right'
            });
            generateSuggestion();
          }
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
        clearInterval(idleTimerRef.current);
      }
    };
  }, []);

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Writing Assistant"
      description="Get instant feedback on your writing"
    >
      <div className="flex flex-col lg:flex-row gap-4 w-full min-h-[calc(100vh-10rem)]">
        <LeftColumn
          challenge={selectedChallenge}
          format={format}
          outputCode={outputCode}
          onStartChallenge={handleStartChallenge}
          onStopChallenge={handleStopChallenge}
          onGenerateFeedback={handleGenerateFeedback}
          isGeneratingFeedback={isGeneratingFeedback}
          onRefreshEvaluation={handleRefreshEvaluation}
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
          insights={insights}
          evaluationLoading={evaluationLoading}
          evaluationError={evaluationError}
          evaluatedPerformanceMetrics={evaluatedPerformanceMetrics}
          evaluatedSkillMetrics={evaluatedSkillMetrics}
          performanceMetrics={performanceMetrics}
          skillMetrics={skillMetrics}
          checkedPhrases={checkedPhrases}
        />

        {/* Writing Area */}
        <div className="flex-1 flex flex-col space-y-4 w-full lg:w-2/3 h-auto min-h-full">
          {!selectedChallenge ? (
            <>
              <Tabs value={mode} defaultValue="practice" className="w-full" onValueChange={value => setMode(value as 'practice' | 'exam')}>
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
              <EmptyTestState mode={mode} setMode={setMode} />
            </>
          ) : (
            selectedChallenge && !evaluationLoading && (
              <TimerProgress
                timeElapsed={elapsedTime}
                timeAllocation={selectedChallenge.time_allocation}
                mode={mode}
                onGradeChallenge={handleGradeChallenge}
                onForceTimeUp={handleForceTimeUp}
                wordCount={wordCount}
                requiredWordCount={selectedChallenge.word_count}
                showGradeButton={wordCount >= (selectedChallenge.word_count || 0)}
              />
            )
          )}
          {selectedChallenge && (
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
                fontSize: '1.125rem',
                height: '100%',
                minHeight: 'calc(100vh - 14rem)' // Account for header and padding
              }}
              className="flex-1 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 resize-none focus:outline-none focus:ring-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent whitespace-pre-wrap text-zinc-700 shadow-inner [background-color:rgb(255_255_255/0.5)] dark:[background-color:rgb(24_24_27/0.3)]"
              disabled={isTimeUp}
            />
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
      {idleTimer !== null && idleTimer <= 20 && selectedChallenge && !showChallenges && !showEvaluation && mode === "practice" && inputMessage.trim().length > 0 && (
        <div className="fixed bottom-4 right-4 py-1 px-3 bg-orange-500 text-white text-sm font-medium rounded-full shadow-lg">
          Suggesting in: {idleTimer}s
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

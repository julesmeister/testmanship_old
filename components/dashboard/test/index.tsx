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
import toast from 'react-hot-toast';
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
        <div className="text-2xl font-bold text-foreground dark:text-white">{value}</div>
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

  // Debug logging for language selection
  const { selectedLanguageId, languages } = useLanguageStore();
  const selectedLanguage = languages.find(lang => lang.id === selectedLanguageId);

  useEffect(() => {
    console.log('Current Language State:', {
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

  const {
    text: inputMessage,
    stats: { wordCount, paragraphCount, charCount },
    setInputMessage
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = sanitizeInput(e.target.value);
    
    // Update input message and track previous text
    const prevText = inputMessage;
    setInputMessage(newText);
    
    // Auto-adjust height
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
    
    // Calculate metrics for the new text
    const metrics = calculateMetrics(newText);
    const { wordCount, charCount, readingTime } = metrics;
    
    // Show feedback window on first typing if not manually closed
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
    if (newText !== prevText) {
      handleParagraphChange(newText, prevText, currentIndex);
    }
  };

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
    resetTimer();
    setSelectedChallenge(challenge);
    setInputMessage('');
    setOutputCode('');
    setManuallyClosedFeedbackState(false);
    setShowFeedbackState(false);
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

    // Content validation
    if (!validateSubmission(inputMessage)) {
      toast.error(securityError || 'Invalid submission');
      return;
    }

    try {
      setLoading(true);
      await checkRateLimit();

      // Sanitize user input
      const sanitizedContent = sanitizeInput(inputMessage);
      
      // Calculate detailed metrics
      const metrics = calculateMetrics(sanitizedContent);
      const { 
        readingTime, 
        sentenceCount, 
        paragraphCount, 
        readabilityScore, 
        vocabularyDiversity,
        grammarScore,
        avgSentenceLength,
        topicRelevance,
        improvementRate
      } = metrics;
      
      const challengeResult = {
        challenge_id: selectedChallenge.id,
        user_id: user?.id,
        content: sanitizedContent,
        word_count: metrics.wordCount,
        char_count: metrics.charCount,
        sentence_count: sentenceCount,
        paragraph_count: paragraphCount,
        reading_time: readingTime,
        readability_score: readabilityScore,
        vocabulary_diversity: vocabularyDiversity,
        grammar_score: grammarScore,
        avg_sentence_length: avgSentenceLength,
        topic_relevance: topicRelevance,
        improvement_rate: improvementRate,
        time_taken: elapsedTime,
        mode: mode,
        completed: isTimeUp || elapsedTime >= (selectedChallenge.time_allocation * 60),
        feedback_count: feedback.length,
        created_at: new Date().toISOString(),
        // Enhanced metrics
        metrics: {
          grammar_score: metrics.grammarScore,
          vocabulary_diversity: metrics.vocabularyDiversity,
          average_sentence_length: metrics.avgSentenceLength,
          readability_score: metrics.readabilityScore,
          topic_relevance: metrics.topicRelevance,
          improvement_rate: metrics.improvementRate
        },
        // Security metadata
        submission_metadata: {
          client_timestamp: new Date().toISOString(),
          client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          submission_source: 'web',
          user_agent: navigator.userAgent,
          session_id: crypto.randomUUID()
        }
      };

      // First verify user's access to challenge
      const { data: accessCheck, error: accessError } = await supabase
        .from('user_challenges')
        .select('id')
        .eq('user_id', user.id)
        .eq('challenge_id', selectedChallenge.id)
        .single();

      if (accessError || !accessCheck) {
        throw new Error('Unauthorized access to challenge');
      }

      // Then save the result with transaction
      const { error } = await supabase
        .from('challenge_results')
        .insert(challengeResult);

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error('Challenge already submitted');
        }
        throw error;
      }

      // Log successful submission for audit
      await supabase.from('submission_logs').insert({
        user_id: user.id,
        challenge_id: selectedChallenge.id,
        action: 'submit',
        status: 'success',
        metadata: challengeResult.submission_metadata
      });

      toast.success('Challenge results saved successfully');
    } catch (error) {
      console.error('Error saving challenge results:', error);
      
      // Detailed error handling
      if (error instanceof Error) {
        switch (error.message) {
          case 'Unauthorized access to challenge':
            toast.error('You do not have access to this challenge');
            break;
          case 'Challenge already submitted':
            toast.error('This challenge has already been submitted');
            break;
          default:
            toast.error('Failed to save challenge results');
        }

        // Log error for monitoring
        const { error: logError } = await supabase
          .from('error_logs')
          .insert({
            user_id: user?.id,
            error_type: 'challenge_submission',
            error_message: error.message,
            stack_trace: error.stack,
            metadata: {
              challenge_id: selectedChallenge.id,
              timestamp: new Date().toISOString()
            }
          });
          
        if (logError) {
          console.error('Failed to log error:', logError);
        }
      }
    } finally {
      setLoading(false);
      handleBackToChallenges();
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      cleanupFeedback();
    };
  }, [cleanupFeedback]);

  // Check for time up
  useEffect(() => {
    if (selectedChallenge && elapsedTime >= selectedChallenge.time_allocation * 60) {
      setIsWriting(false);
    }
  }, [elapsedTime, selectedChallenge]);

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
          isGeneratingFeedback={false}
          isTimeUp={isTimeUp}
          mode={mode}
          timeElapsed={elapsedTime}
          timeAllocation={selectedChallenge?.time_allocation}
          inputMessage={inputMessage}
          showFeedback={showFeedbackState}
          manuallyClosedFeedback={manuallyClosedFeedbackState}
          setManuallyClosedFeedback={setManuallyClosedFeedbackState}
          setShowFeedback={setShowFeedbackState}
        />

        {/* Writing Area */}
        <div className="flex-1 flex flex-col space-y-4 w-full lg:w-2/3">
          {!selectedChallenge ? (
            <Tabs defaultValue="exam" className="w-full" onValueChange={value => setMode(value as 'practice' | 'exam')}>
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
            />
          )}
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Start writing your essay here..."
            className="flex-1 w-full p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 min-h-[200px] scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent whitespace-pre-wrap"
            disabled={isTimeUp}
          />
          {/* Writing Statistics Bar */}
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

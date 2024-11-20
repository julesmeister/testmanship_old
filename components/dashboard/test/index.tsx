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
import { useState, useEffect, useRef, useCallback } from 'react';
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

  const { handleParagraphChange } = useFeedbackManager(generateFeedback);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    // Update input message and track previous text
    const prevText = inputMessage;
    setInputMessage(newText);
    
    // Show feedback window on first typing if not manually closed
    if (newText.trim() && !manuallyClosedFeedbackState) {
      setShowFeedbackState(true);
    }
    
    if (isTimeUp) return;
    
    if (!isWriting && newText.length > 0 && !isTimeUp) {
      setIsWriting(true);
    }

    // Calculate current paragraph index
    const paragraphs = newText.split(/\n\s*\n/);
    const currentIndex = paragraphs.length - 1;
    
    handleParagraphChange(newText, prevText, currentIndex);
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

    setIsGeneratingFeedback(true);
    try {
      return await generateFeedback(paragraph);
    } finally {
      setIsGeneratingFeedback(false);
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
              onGradeChallenge={() => {
                // First record the challenge results
                // TODO: Add your API call here to save the challenge results
                
                // Then navigate back to challenges
                handleBackToChallenges();
              }}
            />
          )}
          <textarea
            value={inputMessage}
            onChange={handleTextChange}
            placeholder="Start writing your essay here..."
            className="flex-1 w-full p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 min-h-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent"
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

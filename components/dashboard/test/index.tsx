'use client';
/*eslint-disable*/

import DashboardLayout from '@/components/layout';
import { useLanguageStore } from '@/stores/language';

import { ChatBody, OpenAIModel } from '@/types/types';
import { User } from '@supabase/supabase-js';
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TimerProgress from './TimerProgress';
import { Card, CardContent } from '@/components/ui/card';
import LeftColumn from './LeftColumn';
import toast from 'react-hot-toast';
import { makeAIRequest } from '@/utils/ai';
import { useAIFeedback } from '@/hooks/useAIFeedback';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

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

export default function Test({ user, userDetails }: Props) {
  // *** If you use .env.local variable for your API key, method which we recommend, use the apiKey variable commented below
  // Input States
  const [inputOnSubmit, setInputOnSubmit] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  // Response message
  const [outputCode, setOutputCode] = useState<string>('');
  // ChatGPT model
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  const [paragraphCount, setParagraphCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isWriting, setIsWriting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [mode, setMode] = useState<'practice' | 'exam'>('exam');
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [prevText, setPrevText] = useState<string>('');
  const [lastEditedParagraphIndex, setLastEditedParagraphIndex] = useState<number>(-1);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { selectedLanguageId, languages } = useLanguageStore();
  const selectedLanguage = languages.find(lang => lang.id === selectedLanguageId);

  // Debug logging for language selection
  useEffect(() => {
    console.log('Current Language State:', {
      selectedLanguageId,
      languages,
      selectedLanguage,
      targetLanguageCode: selectedLanguage?.code?.toUpperCase()
    });
  }, [selectedLanguageId, languages, selectedLanguage]);

  const { feedback, generateFeedback, cleanup: cleanupFeedback } = useAIFeedback({
    challenge: selectedChallenge,
    targetLanguage: selectedLanguage?.code?.toUpperCase() || 'EN'
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isTimeUp) return; // Prevent changes if time is up
    
    const text = e.target.value;
    setInputMessage(text);
    
    // Start timer if this is the first keystroke and time isn't up
    if (!isWriting && text.length > 0 && !isTimeUp) {
      setIsWriting(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const start = startTimeRef.current || now;
        const newElapsedTime = Math.floor((now - start) / 1000);
        
        // Check time limit before updating
        if (selectedChallenge && newElapsedTime >= selectedChallenge.time_allocation * 60) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setIsTimeUp(true);
          setIsWriting(false);
          setElapsedTime(selectedChallenge.time_allocation * 60);
        } else {
          setElapsedTime(newElapsedTime);
        }
      }, 1000);
    }
    
    // Clear any pending feedback requests
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    if (editingTimeoutRef.current) {
      clearTimeout(editingTimeoutRef.current);
      editingTimeoutRef.current = null;
    }

    const paragraphs = text.split(/\n\s*\n/);
    const prevParagraphs = prevText.split(/\n\s*\n/);
    
    // Find which paragraph is being edited
    let editedParagraphIndex = -1;
    for (let i = 0; i < Math.max(paragraphs.length, prevParagraphs.length); i++) {
      if (paragraphs[i] !== prevParagraphs[i]) {
        editedParagraphIndex = i;
        break;
      }
    }

    // Handle new paragraph creation
    const justCreatedNewParagraph = 
      text.endsWith('\n\n') && 
      !prevText.endsWith('\n\n') && 
      paragraphs.length > prevParagraphs.length;

    if (justCreatedNewParagraph && paragraphs.length >= 2) {
      const lastCompletedParagraph = paragraphs[paragraphs.length - 2];
      if (lastCompletedParagraph?.trim().length > 0) {
        feedbackTimeoutRef.current = setTimeout(() => {
          generateFeedback(lastCompletedParagraph);
        }, 1000);
      }
    }
    // Handle paragraph editing
    else if (editedParagraphIndex !== -1 && 
             editedParagraphIndex !== paragraphs.length - 1 && // Not the current paragraph
             editedParagraphIndex !== lastEditedParagraphIndex && // Not the same paragraph as last time
             paragraphs[editedParagraphIndex]?.trim().length > 0) { // Has content
      setLastEditedParagraphIndex(editedParagraphIndex);
      
      // Wait for user to finish editing
      editingTimeoutRef.current = setTimeout(() => {
        generateFeedback(paragraphs[editedParagraphIndex]);
      }, 1500); // Slightly longer delay for editing existing paragraphs
    }
    
    // Update previous text for next comparison
    setPrevText(text);
    
    // Update counts without affecting timer
    setWordCount(text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(word => word.length > 0).length);
    setParagraphCount(text.trim() === '' ? 0 : text.trim().split(/\n\s*\n/).filter(para => para.trim().length > 0).length);
    setCharCount(text.length);
  };

  const handleStartChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    // Start the timer immediately when challenge starts
    startTimeRef.current = Date.now();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);
    setIsTimeUp(false);
    setElapsedTime(0);
    setInputMessage('');
    toast.success(`${mode === 'exam' ? 'Exam' : 'Practice'} mode challenge started (${challenge.time_allocation} minutes)`, { duration: 3000 });
  };

  const handleStopChallenge = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsWriting(false);
    startTimeRef.current = null;
    setSelectedChallenge(null); // Reset selected challenge
    setElapsedTime(0); // Reset elapsed time
    setInputMessage(''); // Clear input
    setOutputCode(''); // Clear output
    setWordCount(0); // Reset word count
    setParagraphCount(0); // Reset paragraph count
    setCharCount(0); // Reset character count
  };

  const handleGenerateFeedback = async (text: string) => {
    if (!selectedChallenge) {
      throw new Error('No challenge selected. Please select a challenge first.');
    }

    if (!text.trim()) {
      throw new Error('Cannot generate feedback for empty text');
    }

    setIsGeneratingFeedback(true);
    try {
      const response = await fetch('/api/challenge-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essayContent: text,
          challengeId: selectedChallenge?.id,
          targetLanguage: selectedLanguage?.code || 'en'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `Failed to generate feedback: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Success Response:', data);
      
      if (!data.feedback) {
        throw new Error('No feedback received from the server');
      }
      
      setOutputCode(data.feedback);
      return data.feedback;
    } catch (error) {
      console.error('Error generating feedback:', error);
      throw error instanceof Error ? error : new Error('Failed to generate feedback');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // API Key
  const handleTranslate = async () => {
    setInputOnSubmit(inputMessage);

    // Chat post conditions(maximum number of characters, valid message etc.)
    const maxCodeLength = model === 'gpt-3.5-turbo' ? 700 : 700;

    if (!inputMessage) {
      alert('Please enter your subject.');
      return;
    }

    if (inputMessage.length > maxCodeLength) {
      alert(
        `Please enter code less than ${maxCodeLength} characters. You are currently at ${inputMessage.length} characters.`
      );
      return;
    }
    setOutputCode(' ');
    setLoading(true);
    const controller = new AbortController();
    const body: ChatBody = {
      inputMessage,
      model
    };

    // -------------- Fetch --------------
    const response = await fetch('/api/chatAPI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      setLoading(false);
      if (response) {
        alert(
          'Something went wrong went fetching from the API. Make sure to use a valid API key.'
        );
      }
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('Something went wrong');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      setLoading(true);
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
  };
  // -------------- Copy Response --------------
  // const copyToClipboard = (text: string) => {
  //  const el = document.createElement('textarea');
  //  el.value = text;
  //  document.body.appendChild(el);
  //  el.select();
  //  document.execCommand('copy');
  //  document.body.removeChild(el);
  // };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleBackToChallenges = () => {
    handleStopChallenge();
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current);
      }
      cleanupFeedback();
    };
  }, [cleanupFeedback]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Check for time up
  useEffect(() => {
    if (selectedChallenge && elapsedTime >= selectedChallenge.time_allocation * 60) {
      setIsTimeUp(true);
      // Clear the timer when time is up
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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
      <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row gap-6">
        <LeftColumn
          challenge={selectedChallenge}
          outputCode={outputCode}
          onStartChallenge={handleStartChallenge}
          onStopChallenge={handleStopChallenge}
          onGenerateFeedback={handleGenerateFeedback}
          isGeneratingFeedback={isGeneratingFeedback}
          isTimeUp={isTimeUp}
          mode={mode}
          timeElapsed={elapsedTime}
          timeAllocation={selectedChallenge?.time_allocation}
          inputMessage={inputMessage}
        />

        {/* Writing Area */}
        <div className="flex-1 flex flex-col space-y-4">
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

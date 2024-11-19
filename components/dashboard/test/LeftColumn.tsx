'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HiSparkles, HiPlay, HiStop, HiArrowPath, HiMiniArrowLeftOnRectangle } from 'react-icons/hi2';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState, useCallback } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HiXMark, HiLightBulb } from 'react-icons/hi2';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { DraggableWindow } from './components/DraggableWindow';

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

interface LeftColumnProps {
  challenge: Challenge | null;
  outputCode: string;
  onStartChallenge: (challenge: Challenge) => void;
  onStopChallenge: () => void;
  onGenerateFeedback: (paragraph: string) => Promise<string>;
  isGeneratingFeedback: boolean;
  isTimeUp: boolean;
  mode: 'practice' | 'exam';
  timeElapsed: number;
  timeAllocation?: number;
  inputMessage: string;
}

const difficultyLevels = [
  { 
    value: 'a1', 
    label: 'A1', 
    activeClass: 'data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-500',
    inactiveClass: 'data-[state=inactive]:text-emerald-600 dark:data-[state=inactive]:text-emerald-400',
    hoverClass: 'hover:text-emerald-800 dark:hover:text-emerald-300'
  },
  { 
    value: 'a2', 
    label: 'A2', 
    activeClass: 'data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-500',
    inactiveClass: 'data-[state=inactive]:text-green-600 dark:data-[state=inactive]:text-green-400',
    hoverClass: 'hover:text-green-800 dark:hover:text-green-300'
  },
  { 
    value: 'b1', 
    label: 'B1', 
    activeClass: 'data-[state=active]:bg-yellow-600 data-[state=active]:text-white dark:data-[state=active]:bg-yellow-500',
    inactiveClass: 'data-[state=inactive]:text-yellow-600 dark:data-[state=inactive]:text-yellow-400',
    hoverClass: 'hover:text-yellow-800 dark:hover:text-yellow-300'
  },
  { 
    value: 'b2', 
    label: 'B2', 
    activeClass: 'data-[state=active]:bg-orange-600 data-[state=active]:text-white dark:data-[state=active]:bg-orange-500',
    inactiveClass: 'data-[state=inactive]:text-orange-600 dark:data-[state=inactive]:text-orange-400',
    hoverClass: 'hover:text-orange-800 dark:hover:text-orange-300'
  },
  { 
    value: 'c1', 
    label: 'C1', 
    activeClass: 'data-[state=active]:bg-rose-600 data-[state=active]:text-white dark:data-[state=active]:bg-rose-500',
    inactiveClass: 'data-[state=inactive]:text-rose-600 dark:data-[state=inactive]:text-rose-400',
    hoverClass: 'hover:text-rose-800 dark:hover:text-rose-300'
  },
  { 
    value: 'c2', 
    label: 'C2', 
    activeClass: 'data-[state=active]:bg-red-600 data-[state=active]:text-white dark:data-[state=active]:bg-red-500',
    inactiveClass: 'data-[state=inactive]:text-red-600 dark:data-[state=inactive]:text-red-400',
    hoverClass: 'hover:text-red-800 dark:hover:text-red-300'
  }
] as const;

export default function LeftColumn({
  challenge,
  outputCode,
  onStartChallenge,
  onStopChallenge,
  onGenerateFeedback,
  isGeneratingFeedback,
  isTimeUp,
  mode,
  timeElapsed,
  timeAllocation,
  inputMessage,
}: LeftColumnProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('a1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChallenges, setShowChallenges] = useState(true);
  const [showTip, setShowTip] = useState(true);
  const [showFeedback, setShowFeedback] = useState(true);
  const [accordionValue, setAccordionValue] = useState<string | undefined>('item-1');
  const supabase = createClientComponentClient();
  const [outputCodeState, setOutputCodeState] = useState<string>('');
  const [lastFeedbackTime, setLastFeedbackTime] = useState<number>(0);
  const MIN_FEEDBACK_INTERVAL = 5000; // 5 seconds

  useEffect(() => {
    setOutputCodeState(outputCode);
  }, [outputCode]);

  useEffect(() => {
    const fetchChallenges = async () => {
      let query = supabase
        .from('challenges')
        .select('*')
        .eq('difficulty_level', selectedLevel.toUpperCase());
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching challenges:', error);
        return;
      }

      setChallenges(data || []);
    };

    fetchChallenges();
  }, [selectedLevel, searchQuery, supabase]);

  useEffect(() => {
    if (timeAllocation && timeElapsed >= timeAllocation * 60) {
      setAccordionValue(undefined);
    }
  }, [timeElapsed, timeAllocation]);

  const handleStartChallenge = (challenge: Challenge) => {
    setShowChallenges(false);
    setAccordionValue('instructions');
    onStartChallenge(challenge);
    toast.success(`${mode === 'exam' ? 'Exam' : 'Practice'} mode challenge started (${challenge.time_allocation} minutes)`, { duration: 3000 });
  };

  const handleBackToChallenges = () => {
    setShowChallenges(true);
    setAccordionValue('item-1');
    onStopChallenge();
    setShowTip(true);
    setSelectedLevel('a1'); // Reset difficulty level
  };

  const handleGenerateFeedback = async (paragraph: string) => {
    if (!challenge) {
      const error = new Error('No active challenge found. Please select a challenge first.');
      console.error(error);
      throw error;
    }

    const now = Date.now();
    const timeSinceLastFeedback = now - lastFeedbackTime;
    
    if (timeSinceLastFeedback < MIN_FEEDBACK_INTERVAL) {
      const waitTime = MIN_FEEDBACK_INTERVAL - timeSinceLastFeedback;
      const error = new Error(`Please wait ${Math.ceil(waitTime / 1000)} seconds before requesting feedback again`);
      console.error(error);
      throw error;
    }

    if (!paragraph.trim()) {
      const error = new Error('Cannot generate feedback for empty paragraph');
      console.error(error);
      throw error;
    }

    try {
      setLastFeedbackTime(now);
      const feedback = await onGenerateFeedback(paragraph);
      
      if (!feedback) {
        throw new Error('No feedback received from the server');
      }
      
      setOutputCodeState(feedback);
      return feedback;
    } catch (error) {
      console.error('Error generating feedback:', error);
      throw error instanceof Error ? error : new Error('Failed to generate feedback');
    }
  };

  const handleParagraphFeedback = async (paragraph: string, index: number) => {
    try {
      const promise = handleGenerateFeedback(paragraph);
      await toast.promise(promise, {
        loading: `Analyzing paragraph ${index + 1}...`,
        success: (data) => {
          if (!data) throw new Error('No feedback received');
          return `Generated feedback for paragraph ${index + 1}`;
        },
        error: (err) => {
          const message = err instanceof Error ? err.message : 'Failed to generate feedback';
          console.error('Feedback generation error:', err);
          return message;
        }
      });
    } catch (error) {
      // Error is already handled by toast.promise
      console.error('Error in handleParagraphFeedback:', error);
    }
  };

  const handleFinishChallenge = async () => {
    if (!challenge) {
      console.error('No active challenge found');
      return;
    }

    // Don't generate feedback if there's no text
    if (!inputMessage?.trim()) {
      toast.error('No text to analyze. Challenge ended.');
      onStopChallenge();
      return;
    }

    try {
      setShowChallenges(false);
      setShowFeedback(true);
      
      const promise = handleGenerateFeedback(inputMessage);
      await toast.promise(promise, {
        loading: 'Analyzing your complete essay...',
        success: 'Generated comprehensive feedback',
        error: 'Failed to generate feedback'
      });
      onStopChallenge();
    } catch (error) {
      console.error('Error in finish challenge:', error);
      onStopChallenge();
    }
  };

  useEffect(() => {
    // Convert timeAllocation from minutes to seconds for comparison
    const timeAllocationInSeconds = timeAllocation ? timeAllocation * 60 : 0;
    
    if (timeAllocationInSeconds > 0 && timeElapsed >= timeAllocationInSeconds && !isTimeUp) {
      // Only call handleFinishChallenge if there's actual text to analyze
      if (inputMessage?.trim()) {
        handleFinishChallenge();
      } else {
        // If no text, just stop the challenge without generating feedback
        toast.error('Time is up! No text to analyze.');
        onStopChallenge();
      }
    }
  }, [timeElapsed, timeAllocation, isTimeUp, inputMessage]);

  return (
    <div className="w-full lg:w-1/3 flex flex-col">
      {showTip && (
        <div className="relative mb-6 overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px]">
          <div className="relative flex items-start gap-3 rounded-lg bg-white/95 px-4 py-3 dark:bg-zinc-900/95">
            <HiLightBulb className="h-5 w-5 flex-shrink-0 text-amber-500 mt-1" />
            <div className="pr-6 space-y-2 text-sm">
              <p className="text-zinc-600 dark:text-zinc-300">
                Welcome! Pick a challenge from the list below and follow the instructions carefully. Best of luck on your writing journey! 🚀
              </p>
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Practice Mode:</span>
                  <span className="text-zinc-500 dark:text-zinc-400"> Real-time feedback per paragraph</span>
                </div>
                <div>
                  <span className="font-medium text-blue-600 dark:text-blue-400">Exam Mode:</span>
                  <span className="text-zinc-500 dark:text-zinc-400"> Graded feedback after time limit</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowTip(false)}
              className="absolute right-2 top-2 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {/* Challenge Selection */}
      <div className={!challenge ? "space-y-4" : ""}>
        {(showChallenges || !challenge) && (
          <>
            <Tabs defaultValue="a1" className="w-full" onValueChange={setSelectedLevel}>
              <TabsList className="grid w-full grid-cols-6 bg-gray-50 dark:bg-gray-900 p-1">
                {difficultyLevels.map(({ value, label, activeClass, inactiveClass, hoverClass }) => (
                  <TabsTrigger 
                    key={value}
                    value={value} 
                    className={cn(activeClass, inactiveClass, hoverClass)}
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <div className="flex gap-2">
                <Input
                  type="search"
                  placeholder="Search writing challenges..."
                  className="flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  className="text-foreground dark:text-white hover:text-foreground dark:hover:text-white"
                >Search</Button>
              </div>
            </div>

            {/* Challenges List */}
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {challenge.instructions.split('\n')[0]}
                      </p>
                      <div className="mt-2 text-sm text-zinc-500">
                        Time: {challenge.time_allocation} minutes
                      </div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => {
                              handleStartChallenge(challenge);
                              setShowTip(false);
                            }}
                            className="shimmer-button"
                          >
                            <HiPlay className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="bg-black border-black">
                          <p className="text-white">Timer will start when this button is clicked</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Instructions & Criteria */}
      {challenge && !showChallenges && (
        <div>
          <Accordion 
            type="single" 
            collapsible 
            className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700"
            value={accordionValue}
            onValueChange={setAccordionValue}
          >
            <AccordionItem value="instructions">
              <div className="flex justify-between items-center pr-4">
                <AccordionTrigger className="px-4 flex-grow text-left text-base sm:text-sm [&>svg]:ml-4">Writing Instructions & Criteria</AccordionTrigger>
                {!showChallenges && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={handleBackToChallenges}
                        >
                          <HiMiniArrowLeftOnRectangle className="w-4 h-4" />
                          Exit Challenge
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="bg-black border-black">
                        <p className="text-white">Stop timer and return to challenges</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Topic</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {challenge.title}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Instructions</h3>
                    <div className="text-zinc-600 dark:text-zinc-400 space-y-2">
                      {challenge.instructions.split('\n').map((instruction: string, index: number) => (
                        <p key={index}>{instruction}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Time Allocation</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {challenge.time_allocation} minutes
                    </p>
                  </div>

                  {challenge.word_count && (
                    <div>
                      <h3 className="font-semibold mb-2">Word Count Requirement</h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {challenge.word_count}
                      </p>
                    </div>
                  )}

                  {challenge.grammar_focus && challenge.grammar_focus.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Grammar Focus</h3>
                      <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
                        {challenge.grammar_focus.map((point: string, index: number) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {challenge.vocabulary_themes && challenge.vocabulary_themes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Vocabulary Themes</h3>
                      <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
                        {challenge.vocabulary_themes.map((theme: string, index: number) => (
                          <li key={index}>{theme}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2">
                      <HiArrowPath className="h-4 w-4" />
                      <span>{challenge.time_allocation} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiStop className="h-4 w-4" />
                      <span>{challenge.difficulty_level}</span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* Toggle Feedback Button */}
      {challenge && !showFeedback && (
        <button
          onClick={() => setShowFeedback(true)}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-2 rounded-full shadow-lg hover:opacity-90 transition-opacity"
        >
          <HiSparkles className="w-5 h-5" />
        </button>
      )}

      {/* AI Feedback Window */}
      {challenge && showFeedback && (
        <DraggableWindow onClose={() => setShowFeedback(false)}>
          <div className="flex flex-col gap-3">
            {/* Feedback Controls */}
            {inputMessage.trim() && (
              <div className="flex items-center justify-between gap-2 p-3 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex gap-2 overflow-x-auto">
                  <TooltipProvider>
                    {inputMessage.split(/\n\s*\n/).map((paragraph, index) => 
                      paragraph.trim() && (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={async () => {
                                console.log(`Analyzing paragraph ${index + 1}:`, paragraph.slice(0, 50) + '...');
                                await handleParagraphFeedback(paragraph, index);
                              }}
                              className="group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 rounded-lg transition-all overflow-hidden"
                            >
                              {/* Animated border */}
                              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 animate-gradient-x transition-opacity" >
                                <div className="absolute inset-[1px] bg-white dark:bg-zinc-900 rounded-lg" />
                              </div>
                              <MessageSquare className="relative z-10 w-4 h-4 text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400" />
                              <span className="relative z-10">P{index + 1}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                            <p>Get feedback for paragraph {index + 1}</p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    )}
                  </TooltipProvider>
                </div>
                
                <button
                  onClick={() => {
                    setOutputCodeState('');
                    toast.success('Feedback cleared');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              </div>
            )}
            {/* Feedback Content */}
            <div className="p-3 max-h-[40vh] overflow-y-auto">
              <div className="space-y-2">
                {outputCodeState ? (
                  <div className="text-zinc-600 dark:text-zinc-400 text-md leading-relaxed">
                    {outputCodeState.split('\n').map((line, index) => {
                      if (line.trim().startsWith('✓')) {
                        return (
                          <div key={index} className="flex items-start gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                            <span>{line.replace('✓', '').trim()}</span>
                          </div>
                        );
                      } else if (line.trim().startsWith('✗')) {
                        return (
                          <div key={index} className="flex items-start gap-2 mb-2">
                            <XCircle className="w-5 h-5 mt-0.5 text-red-500 dark:text-red-400 flex-shrink-0" />
                            <span>{line.replace('✗', '').trim()}</span>
                          </div>
                        );
                      } else if (line.trim().startsWith('!')) {
                        return (
                          <div key={index} className="flex items-start gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 mt-0.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                            <span>{line.replace('!', '').trim()}</span>
                          </div>
                        );
                      } else if (line.trim()) {
                        return <p key={index} className="mb-2">{line}</p>;
                      }
                      return null;
                    })}
                  </div>
                ) : (
                  <div className="text-zinc-500 dark:text-zinc-400">
                    No feedback generated yet. Click on a paragraph button above to generate feedback.
                  </div>
                )}
              </div>
            </div>
          </div>
        </DraggableWindow>
      )}
    </div>
  );
}

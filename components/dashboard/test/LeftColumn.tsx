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
import { toast } from 'react-hot-toast';
import { cn } from "@/lib/utils";
import { useDraggable } from '@/hooks/useDraggable';

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
  selectedChallenge: any;
  hasStartedWriting: boolean;
  outputCode: string;
  onStartChallenge: (challenge: any) => void;
  onStopChallenge: () => void;
  mode?: string;
  timeElapsed?: number;
  timeAllocation?: number;
  isTimeUp?: boolean;
  isGeneratingFeedback?: boolean;
  onGenerateFeedback?: () => void;
  setHasStartedWriting: (value: boolean) => void;
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

function DraggableWindow({ 
  children, 
  onClose 
}: { 
  children: React.ReactNode;
  onClose: () => void;
}) {
  const { dragProps, isDragging } = useDraggable({
    initialPosition: { x: 20, y: 20 }
  });

  return (
    <div 
      {...dragProps}
      className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 shadow-lg min-w-[300px] max-w-[500px] transition-all"
    >
      <div 
        className="window-handle cursor-grab active:cursor-grabbing bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 p-2.5 rounded-t-lg flex items-center justify-between select-none"
      >
        <h2 className="font-medium text-sm text-white/90 flex items-center gap-1.5">
          <HiSparkles className="w-4 h-4" />
          AI Writing Assistant
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white/70 hover:text-white/90 hover:bg-white/10 transition-colors"
          >
            <HiXMark className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="p-3 max-h-[50vh] overflow-y-auto">
        <div className="space-y-2">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function LeftColumn({
  selectedChallenge,
  hasStartedWriting,
  outputCode,
  onStartChallenge,
  onStopChallenge,
  mode = 'exam',
  timeElapsed = 0,
  timeAllocation = 0,
  isTimeUp = false,
  isGeneratingFeedback = false,
  onGenerateFeedback,
  setHasStartedWriting
}: LeftColumnProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('a1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChallenges, setShowChallenges] = useState(true);
  const [showTip, setShowTip] = useState(true);
  const [showFeedback, setShowFeedback] = useState(true);
  const [accordionValue, setAccordionValue] = useState<string | undefined>('item-1');
  const supabase = createClientComponentClient();

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
    if (timeElapsed >= timeAllocation * 60) {
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
    setHasStartedWriting(false);
  };

  const handleFinishChallenge = () => {
    onGenerateFeedback?.();
  };

  return (
    <div className="w-full lg:w-1/3 flex flex-col">
      {/* Add keyframes for shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .shimmer-button {
          background: linear-gradient(110deg, #4f46e5, #7c3aed, #2563eb, #4f46e5);
          background-size: 200% auto;
          animation: shimmer 4s linear infinite;
          transition: all 0.3s ease;
        }
        .shimmer-button:hover {
          background-size: 150% auto;
          animation-duration: 2s;
        }
      `}</style>
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
      <div className={hasStartedWriting ? "" : "space-y-4"}>
        {showChallenges && !hasStartedWriting && (
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
                            className="shrink-0 flex items-center gap-2 shimmer-button text-white hover:opacity-90"
                          >
                            <HiPlay className="w-4 h-4" />
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
      {selectedChallenge && !showChallenges && (
        <div>
          {/* Finish Challenge Button - Only show in exam mode */}
          {mode === 'exam' && (
            <Button
              className="w-full mb-4"
              variant="default"
              onClick={handleFinishChallenge}
              disabled={!isTimeUp || isGeneratingFeedback}
            >
              {isGeneratingFeedback ? (
                <>
                  <span className="mr-2">Generating Feedback</span>
                  <HiSparkles className="h-4 w-4 animate-spin" />
                </>
              ) : (
                'Finish Challenge'
              )}
            </Button>
          )}
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
                      {selectedChallenge.title}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Instructions</h3>
                    <div className="text-zinc-600 dark:text-zinc-400 space-y-2">
                      {selectedChallenge.instructions.split('\n').map((instruction: string, index: number) => (
                        <p key={index}>{instruction}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Time Allocation</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {selectedChallenge.time_allocation} minutes
                    </p>
                  </div>

                  {selectedChallenge.word_count && (
                    <div>
                      <h3 className="font-semibold mb-2">Word Count Requirement</h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {selectedChallenge.word_count}
                      </p>
                    </div>
                  )}

                  {selectedChallenge.grammar_focus && selectedChallenge.grammar_focus.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Grammar Focus</h3>
                      <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
                        {selectedChallenge.grammar_focus.map((point: string, index: number) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedChallenge.vocabulary_themes && selectedChallenge.vocabulary_themes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Vocabulary Themes</h3>
                      <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
                        {selectedChallenge.vocabulary_themes.map((theme: string, index: number) => (
                          <li key={index}>{theme}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2">
                      <HiArrowPath className="h-4 w-4" />
                      <span>{selectedChallenge.time_allocation} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiStop className="h-4 w-4" />
                      <span>{selectedChallenge.difficulty_level}</span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* Toggle Feedback Button */}
      {selectedChallenge && hasStartedWriting && !showFeedback && (
        <button
          onClick={() => setShowFeedback(true)}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-2 rounded-full shadow-lg hover:opacity-90 transition-opacity"
        >
          <HiSparkles className="w-5 h-5" />
        </button>
      )}

      {/* AI Feedback Window */}
      {selectedChallenge && hasStartedWriting && showFeedback && (
        <DraggableWindow onClose={() => setShowFeedback(false)}>
          <div className="p-3 max-h-[50vh] overflow-y-auto">
            <div className="space-y-2">
              {outputCode ? (
                <div className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">
                  {outputCode}
                </div>
              ) : (
                <div className="text-zinc-500/80 dark:text-zinc-400/80 text-xs italic">
                  Start writing to receive real-time feedback on your essay.
                </div>
              )}
            </div>
          </div>
        </DraggableWindow>
      )}
    </div>
  );
}

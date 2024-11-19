'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HiSparkles, HiPlay, HiStop, HiArrowPath, HiMiniArrowLeftOnRectangle, HiXMark, HiLightBulb, HiClipboardDocument, HiClock, HiDocumentText, HiCheckCircle, HiBookOpen } from 'react-icons/hi2';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { DraggableWindow } from './components/DraggableWindow';
import { useChallenge } from '@/hooks/useChallenge';
import { useFeedbackGeneration } from '@/hooks/useFeedbackGeneration';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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

// UI Components
const TipBox = ({ onClose }: { onClose: () => void }) => (
  <div className="relative mb-6 overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px]">
    <div className="relative flex items-start gap-3 rounded-lg bg-white/95 px-4 py-3 dark:bg-zinc-900/95">
      <HiLightBulb className="h-5 w-5 flex-shrink-0 text-amber-500 mt-1" />
      <div className="pr-6 space-y-2 text-sm">
        <p className="text-zinc-600 dark:text-zinc-300">
          Welcome! Pick a challenge from the list below and follow the instructions carefully. Best of luck on your writing journey! 🚀
        </p>
        <div className="flex gap-4 text-xs">
          <ModeInfo mode="Practice" color="emerald" description="Real-time feedback per paragraph" />
          <ModeInfo mode="Exam" color="blue" description="Graded feedback after time limit" />
        </div>
      </div>
      <CloseButton onClick={onClose} />
    </div>
  </div>
);

const ModeInfo = ({ mode, color, description }: { mode: string; color: string; description: string }) => (
  <div>
    <span className={`font-medium text-${color}-600 dark:text-${color}-400`}>{mode} Mode:</span>
    <span className="text-zinc-500 dark:text-zinc-400"> {description}</span>
  </div>
);

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="absolute right-2 top-2 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
  >
    <HiXMark className="h-4 w-4" />
  </button>
);

const ChallengeCard = ({ 
  challenge, 
  onStart 
}: { 
  challenge: Challenge; 
  onStart: (challenge: Challenge) => void;
}) => (
  <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
    <div className="flex justify-between items-start gap-4">
      <div>
        <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
        <p className="text-zinc-600 dark:text-zinc-400 line-clamp-3">
          {challenge.instructions.split('\n')[0]}
        </p>
        <div className="mt-2 text-sm text-zinc-500">
          Time: {challenge.time_allocation} minutes
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => onStart(challenge)} className="shimmer-button">
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
);

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex justify-center gap-2 mt-4">
    <Button
      variant="outline"
      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1}
    >
      Previous
    </Button>
    <span className="flex items-center px-4">
      Page {currentPage} of {totalPages}
    </span>
    <Button
      variant="outline"
      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage === totalPages}
    >
      Next
    </Button>
  </div>
);

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
  const {
    challenges,
    selectedLevel,
    searchQuery,
    showChallenges,
    showTip,
    currentPage,
    itemsPerPage,
    setSelectedLevel,
    setSearchQuery,
    setShowTip,
    setCurrentPage,
    setShowChallenges,
    handleStartChallenge,
    handleBackToChallenges,
    fetchChallenges,
  } = useChallenge(onStartChallenge, onStopChallenge);

  const {
    outputCodeState,
    showFeedback,
    setOutputCodeState,
    setShowFeedback,
    handleParagraphFeedback,
    handleFinishChallenge,
  } = useFeedbackGeneration(challenge, onGenerateFeedback);

  const [accordionValue, setAccordionValue] = useState<string | undefined>('instructions');
  const accordionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOutputCodeState(outputCode);
  }, [outputCode, setOutputCodeState]);

  useEffect(() => {
    fetchChallenges();
  }, [selectedLevel, searchQuery, fetchChallenges]);

  useEffect(() => {
    if (timeAllocation && timeElapsed >= timeAllocation * 60) {
      setAccordionValue(undefined);
    }
  }, [timeElapsed, timeAllocation]);

  useEffect(() => {
    const timeAllocationInSeconds = timeAllocation ? timeAllocation * 60 : 0;
    
    if (timeAllocationInSeconds > 0 && timeElapsed >= timeAllocationInSeconds && !isTimeUp) {
      if (inputMessage?.trim()) {
        handleFinishChallenge(inputMessage, onStopChallenge);
      } else {
        toast.error('Time is up! No text to analyze.');
        onStopChallenge();
      }
    }
  }, [timeElapsed, timeAllocation, isTimeUp, inputMessage, handleFinishChallenge, onStopChallenge]);

  return (
    <div className="w-full lg:w-1/3 flex flex-col">
      {showTip && (
        <TipBox onClose={() => setShowTip(false)} />
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
              {challenges
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} onStart={handleStartChallenge} />
              ))}

              {/* Pagination */}
              {challenges.length > itemsPerPage && (
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={Math.ceil(challenges.length / itemsPerPage)} 
                  onPageChange={setCurrentPage} 
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Instructions & Criteria */}
      {challenge && !showChallenges && (
        <div className="w-full" ref={accordionRef}>
          <Accordion 
            type="single"
            value={accordionValue}
            defaultValue="instructions"
            className="w-full"
            onValueChange={(value) => {
              // Add a small delay to let the accordion animation complete
              setTimeout(() => {
                const accordionEl = accordionRef.current;
                const footerEl = document.querySelector('.footer-admin') as HTMLElement;
                if (accordionEl && footerEl) {
                  const accordionRect = accordionEl.getBoundingClientRect();
                  const footerRect = footerEl.getBoundingClientRect();
                  const viewportHeight = window.innerHeight;
                  
                  // Check if accordion extends beyond viewport or overlaps footer
                  if (accordionRect.bottom > footerRect.top || accordionRect.bottom > viewportHeight) {
                    const overlap = Math.max(
                      accordionRect.bottom - footerRect.top,
                      accordionRect.bottom - viewportHeight
                    );
                    footerEl.style.marginTop = `${overlap + 40}px`; // Add extra padding
                  } else {
                    footerEl.style.marginTop = ''; // Reset if no overlap
                  }
                }
              }, 300); // Wait for accordion animation
            }}
          >
            <AccordionItem value="instructions" className="w-full border rounded-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between items-center pr-4">
                <AccordionTrigger className="px-4 flex-grow text-left text-base sm:text-sm [&>svg]:hidden">Writing Instructions & Criteria</AccordionTrigger>
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
                <div className="space-y-4">
                  {/* Main topic card with gradient border */}
                  <div className="relative p-4 rounded-lg bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-emerald-50/40 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-emerald-950/10" />
                    <div className="relative">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {challenge.title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Writing Challenge
                      </p>
                    </div>
                  </div>

                  {/* Instructions card */}
                  <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                    <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                      <HiClipboardDocument className="h-4 w-4 text-zinc-500" />
                      Instructions
                    </h3>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
                      {challenge.instructions.split('\n').map((instruction: string, index: number) => (
                        <p key={index} className="leading-relaxed">{instruction}</p>
                      ))}
                    </div>
                  </div>

                  {/* Requirements grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <h3 className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        <HiClock className="h-4 w-4" />
                        Time Allocation
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {challenge.time_allocation} minutes
                      </p>
                    </div>

                    {challenge.word_count && (
                      <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                        <h3 className="flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
                          <HiDocumentText className="h-4 w-4" />
                          Word Count
                        </h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          {challenge.word_count}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Focus areas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {challenge.grammar_focus && challenge.grammar_focus.length > 0 && (
                      <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                        <h3 className="flex items-center gap-2 font-medium text-emerald-900 dark:text-emerald-100 mb-2">
                          <HiCheckCircle className="h-4 w-4" />
                          Grammar Focus
                        </h3>
                        <ul className="space-y-1.5">
                          {challenge.grammar_focus.map((point: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                              <span className="mt-1 h-1 w-1 rounded-full bg-emerald-500" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {challenge.vocabulary_themes && challenge.vocabulary_themes.length > 0 && (
                      <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                        <h3 className="flex items-center gap-2 font-medium text-amber-900 dark:text-amber-100 mb-2">
                          <HiBookOpen className="h-4 w-4" />
                          Vocabulary Themes
                        </h3>
                        <ul className="space-y-1.5">
                          {challenge.vocabulary_themes.map((theme: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                              <span className="mt-1 h-1 w-1 rounded-full bg-amber-500" />
                              {theme}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Footer stats */}
                  <div className="flex items-center justify-between mt-4 px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <HiClock className="h-4 w-4" />
                      <span>{challenge.time_allocation} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium",
                        challenge.difficulty_level === "Beginner" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                        challenge.difficulty_level === "Intermediate" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
                        challenge.difficulty_level === "Advanced" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      )}>
                        {challenge.difficulty_level}
                      </span>
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
          <div className="flex flex-col h-full">
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {/* Feedback Controls */}
              {inputMessage.trim() && (
                <div className="flex items-start justify-between gap-2 p-3 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="grid grid-cols-4 gap-2">
                    {inputMessage.split(/\n\s*\n/).map((paragraph, index) => 
                      paragraph.trim() && (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={async () => {
                                  console.log(`Analyzing paragraph ${index + 1}:`, paragraph.slice(0, 50) + '...');
                                  await handleParagraphFeedback(paragraph, index);
                                }}
                                className="group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 rounded-lg transition-all overflow-hidden w-full"
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
                        </TooltipProvider>
                      )
                    )}
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

              {/* Output */}
              <div className="flex-1 overflow-y-auto px-3">
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

          {/* Resize handle indicator */}
          <div className="absolute bottom-1 right-1 w-4 h-4 text-zinc-400 dark:text-zinc-600 pointer-events-none">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M3 12h2v2H3v-2zm3 0h2v2H6v-2zm3 0h2v2H9v-2zm3 0h2v2h-2V9z" />
              <path d="M6 9h2v2H6V9zm3 0h2v2H9V9zm3 0h2v2h-2V9z" />
              <path d="M9 6h2v2H9V6zm3 0h2v2h-2V6z" />
              <path d="M12 3h2v2h-2V3z" />
            </svg>
          </div>
        </DraggableWindow>
      )}
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChallengeCard } from "@/components/dashboard/test/components/ChallengeCard";
import { useChallenge } from '@/hooks/useChallenge';
import { useFeedbackGeneration } from '@/hooks/useFeedbackGeneration';
import { useEvaluationState } from '@/hooks/useEvaluationState';
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { difficultyLevels } from '@/utils/constants';
import { generateInsights } from '@/utils/insights';
import { 
  HiXMark, 
  HiLightBulb, 
  HiClock, 
  HiDocumentText, 
  HiCheckCircle, 
  HiBookOpen,
  HiSparkles,
  HiPlay,
  HiStop,
  HiArrowPath,
  HiMiniArrowLeftOnRectangle,
  HiClipboardDocument
} from 'react-icons/hi2';
import {
  GradientCard,
  InstructionsCard,
  InfoCard,
  FocusCard,
  FooterStats,
} from '../../card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SearchInput } from '@/components/ui/search-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, MessageSquare, AlertCircle, Loader2Icon } from 'lucide-react';
import { DraggableWindow, LoadingState, EmptyState } from './components';
import { InstructionsAccordion } from "./components/InstructionsAccordion";
import EvaluationAccordion from "./components/EvaluationAccordion";
import { type Challenge } from '@/types/challenge';

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
  showFeedback: boolean;
  manuallyClosedFeedback: boolean;
  setManuallyClosedFeedback: (value: boolean) => void;
  setShowFeedback: (value: boolean) => void;
}

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

const feedbackIcons = {
  '✓': { Icon: CheckCircle2, color: 'text-emerald-500 dark:text-emerald-400' },
  '✗': { Icon: XCircle, color: 'text-red-500 dark:text-red-400' },
  '!': { Icon: AlertCircle, color: 'text-amber-500 dark:text-amber-400' }
} as const;

const FeedbackLine = ({ line }: { line: string }) => {
  const trimmedLine = line.trim();
  const icon = Object.entries(feedbackIcons).find(([symbol]) => trimmedLine.startsWith(symbol));

  if (!trimmedLine) return null;
  
  if (icon) {
    const [symbol, { Icon, color }] = icon;
    return (
      <div className="flex items-start gap-2 mb-2">
        <Icon className={`w-5 h-5 mt-0.5 ${color} flex-shrink-0`} />
        <span>{trimmedLine.replace(symbol, '').trim()}</span>
      </div>
    );
  }

  return <p className="mb-2">{line}</p>;
};

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

const DifficultyBadge = ({ level }: { level: string }) => {
  const colors = {
    Beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    Intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    Advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
  };

  return (
    <span className={cn("px-2 py-1 rounded-md text-xs font-medium", colors[level as keyof typeof colors])}>
      {level}
    </span>
  );
};

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
  showFeedback: propsShowFeedback,
  manuallyClosedFeedback,
  setManuallyClosedFeedback,
  setShowFeedback,
}: LeftColumnProps) {
  const {
    challenges,
    selectedLevel,
    searchQuery,
    showChallenges,
    showTip,
    currentPage,
    totalPages,
    setSelectedLevel,
    setSearchQuery,
    setShowTip,
    setCurrentPage,
    setShowChallenges,
    handleStartChallenge,
    handleBackToChallenges,
    fetchChallenges,
    isLoading
  } = useChallenge(onStartChallenge, onStopChallenge);

  const [accordionValue, setAccordionValue] = useState<string>("instructions");

  const {
    showEvaluation,
    insights,
    isLoading: evaluationLoading,
    error: evaluationError,
    performanceMetrics: evaluatedPerformanceMetrics,
    skillMetrics: evaluatedSkillMetrics
  } = useEvaluationState(challenge, isTimeUp, inputMessage);

  // Calculate initial metrics for display before evaluation
  const initialPerformanceMetrics = {
    wordCount: inputMessage ? inputMessage.split(/\s+/).filter(word => word.length > 0).length : 0,
    paragraphCount: inputMessage ? inputMessage.split(/\n\s*\n/).filter(para => para.trim().length > 0).length : 0,
    timeSpent: timeElapsed || 0,
    performanceScore: 0,
    metrics: {
      grammar: 0,
      vocabulary: 0,
      fluency: 0,
      overall: 0
    }
  };

  const initialSkillMetrics = {
    writingComplexity: 0,
    accuracy: 0,
    coherence: 0,
    style: 0
  };

  // Combine real-time counts with evaluated metrics
  const performanceMetrics = {
    ...evaluatedPerformanceMetrics,
    wordCount: initialPerformanceMetrics.wordCount,
    paragraphCount: initialPerformanceMetrics.paragraphCount,
    timeSpent: initialPerformanceMetrics.timeSpent,
  };

  const skillMetrics = evaluatedSkillMetrics;

  useEffect(() => {
    if (evaluationError) {
      toast.error(evaluationError);
    }
  }, [evaluationError]);

  useEffect(() => {
    if (evaluationLoading) {
      const toastId = toast.loading('Evaluating your writing...', {
        description: 'This may take a few moments',
        dismissible: true,
      });

      // Cleanup the toast when loading is done
      return () => {
        toast.dismiss(toastId);
      };
    }
  }, [evaluationLoading]);

  const [localOutputCode, setLocalOutputCode] = useState(outputCode);

  useEffect(() => {
    setLocalOutputCode(outputCode);
  }, [outputCode]);

  const {
    handleParagraphFeedback,
    handleFinishChallenge
  } = useFeedbackGeneration(challenge, onGenerateFeedback, setLocalOutputCode);

  const handleClearFeedback = useCallback(() => {
    setLocalOutputCode('');
    toast.success('Feedback cleared');
  }, []);

  const accordionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalOutputCode(outputCode);
  }, [outputCode, setLocalOutputCode]);

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

  useEffect(() => {
    if (isTimeUp && showEvaluation) {
      setAccordionValue('evaluation');
    }
  }, [isTimeUp, showEvaluation]);

  return (
    <div className="w-full lg:w-1/3 flex flex-col">
      {showTip && (
        <TipBox onClose={() => setShowTip(false)} />
      )}

      {/* Instructions & Criteria - Show when not evaluating */}
      {challenge && !showChallenges && !showEvaluation && (
        <InstructionsAccordion
          challenge={challenge}
          showChallenges={showChallenges}
          accordionValue={accordionValue}
          onAccordionValueChange={setAccordionValue}
          onBackToChallenges={handleBackToChallenges}
        />
      )}

     {showEvaluation && challenge && (
       <EvaluationAccordion
         challenge={challenge}
         performanceMetrics={performanceMetrics}
         skillMetrics={skillMetrics}
         insights={insights}
         showChallenges={showChallenges}
         accordionValue={accordionValue}
         onAccordionValueChange={setAccordionValue}
         onBackToChallenges={() => {
           onStopChallenge();
           setShowChallenges(true);
         }}
       />
     )}

      {/* Challenge Selection */}
      <div className={(!challenge || showChallenges) ? "space-y-4" : ""}>
        {(!challenge || (showChallenges && !showEvaluation)) && (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                <HiSparkles className="h-4 w-4 text-blue-500" />
                Writing Challenges
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Select your proficiency level and find a challenge
              </p>
            </div>

            <div className="p-4 space-y-4">
              {/* Difficulty Tabs */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-emerald-50/40 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-emerald-950/10 rounded-lg" />
                <Tabs defaultValue="a1" className="relative" onValueChange={setSelectedLevel}>
                  <TabsList className="grid w-full grid-cols-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {difficultyLevels.map((level) => (
                      <TabsTrigger 
                        key={level.toLowerCase()}
                        value={level.toLowerCase()} 
                        className="text-sm font-medium transition-all data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300"
                      >
                        {level}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* Search */}
              <div className="relative">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search writing challenges..."
                />
              </div>

              {/* Challenges List */}
              <div className="space-y-4">
                {isLoading ? (
                  <LoadingState />
                ) : challenges.length > 0 ? (
                  challenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} onStart={handleStartChallenge} />
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>

              {/* Pagination */}
              {challenges.length > 0 && totalPages > 1 && (
                <div className="mt-6 flex justify-center border-t border-zinc-200 dark:border-zinc-800">
                  <div className="pt-6">
                    <Pagination 
                      currentPage={currentPage} 
                      totalPages={totalPages} 
                      onPageChange={setCurrentPage} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toggle Feedback Button */}
      {challenge && !propsShowFeedback && (
        <button
          onClick={() => setShowFeedback(true)}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-2 rounded-full shadow-lg hover:opacity-90 transition-opacity"
        >
          <HiSparkles className="w-5 h-5" />
        </button>
      )}

      {/* AI Feedback Window */}
      {challenge && propsShowFeedback && (
        <DraggableWindow onClose={() => {
          setManuallyClosedFeedback(true);
          setShowFeedback(false);
        }}>
          <div className="flex flex-col h-full">
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {/* Feedback Controls */}
              {inputMessage.trim() && (
                <div className="flex items-start justify-between gap-2 p-3 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="grid grid-cols-4 gap-2">
                    {inputMessage.split(/\n\s*\n/).map((paragraph, index) => 
                      paragraph.trim() && (
                        <TooltipProvider key={index}>
                          <Tooltip defaultOpen={index === 0}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={async () => {
                                  console.log(`Analyzing paragraph ${index + 1}:`, paragraph.slice(0, 50) + '...');
                                  await handleParagraphFeedback(paragraph, index);
                                }}
                                className="group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 rounded-lg transition-all w-full"
                              >
                                {/* Container for both borders */}
                                <div className="absolute inset-0 rounded-lg border border-zinc-200 dark:border-zinc-700 transition-opacity group-hover:opacity-0" />
                                {/* Animated gradient border */}
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
                    onClick={handleClearFeedback}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                </div>
              )}

              {/* Feedback Content */}
              <div className="flex-1 min-h-0">
                {localOutputCode ? (
                  <div className="w-full h-full overflow-y-auto px-3">
                    {localOutputCode.split('\n').map((line, index) => (
                      <FeedbackLine key={index} line={line} />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center space-y-3 p-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 flex items-center justify-center">
                        <HiSparkles className="w-6 h-6 text-indigo-400 dark:text-indigo-500" />
                      </div>
                      <p className="text-zinc-400 dark:text-zinc-500 text-sm text-center max-w-[250px]">
                        Your writing feedback will appear here. Choose a paragraph to see feedback!
                      </p>
                    </div>
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
              <path d="M9 6h2v2h-2V6zm3 0h2v2h-2V6z" />
              <path d="M12 3h2v2h-2V3z" />
            </svg>
          </div>
        </DraggableWindow>
      )}
    </div>
  );
}

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  HelpCircle, 
  RefreshCw, 
  Languages, 
  MessageCircleQuestion,
  Info,
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { GuessTheIdiomProps } from '@/types/exercises';

export default function GuessTheIdiom({ exercise, onComplete }: GuessTheIdiomProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  
  // Memoize the randomized options to prevent re-randomization on each render
  const randomizedOptions = useMemo(() => {
    return exercise.idioms.reduce((acc, idiom) => {
      acc[idiom.id] = [...idiom.options].sort(() => Math.random() - 0.5);
      return acc;
    }, {} as { [key: string]: { text: string; isCorrect: boolean }[] });
  }, [exercise.idioms]);

  const isAnswerCorrect = useCallback((idiomId: string) => {
    const idiom = exercise.idioms.find(i => i.id === idiomId);
    if (!idiom) return false;

    const selectedOption = selectedAnswers[idiomId];
    const correctOption = idiom.options.find(opt => opt.isCorrect);
    
    return selectedOption === correctOption?.text;
  }, [selectedAnswers, exercise]);

  const checkAnswers = useCallback(() => {
    const allAnswered = exercise.idioms.every(idiom => selectedAnswers[idiom.id]);
    
    if (!allAnswered) {
      toast.warning('Please answer all idiom questions before checking.');
      return;
    }

    setShowResults(true);
    const correctCount = exercise.idioms.reduce((count, idiom) => 
      isAnswerCorrect(idiom.id) ? count + 1 : count, 0
    );
    const score = Math.round((correctCount / exercise.idioms.length) * 100);
    onComplete(score, exercise.idioms.length);
  }, [selectedAnswers, exercise, isAnswerCorrect, onComplete]);

  return (
    <div className="p-6 space-y-6">
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            {exercise.title && (
              <div className="flex items-center space-x-4">
                <Languages className="w-10 h-10 text-purple-600 dark:text-purple-400 
                  opacity-80 transform transition-transform hover:scale-110"/>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 
                  tracking-tight">
                  {exercise.title}
                </h2>
              </div>
            )}
          </div>

          {exercise.description && (
            <div className="bg-purple-50 dark:bg-purple-900/20 
              border border-purple-100 dark:border-purple-800/30 
              rounded-xl p-4 
              text-gray-700 dark:text-gray-300">
              <div className="flex items-start space-x-3">
                <MessageCircleQuestion 
                  className="w-6 h-6 text-purple-500 dark:text-purple-400 
                  flex-shrink-0 opacity-70"
                />
                
                <p className="text-base font-medium leading-relaxed">
                  {exercise.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6
        bg-white dark:bg-gray-800 
        rounded-xl 
        border border-gray-100 dark:border-gray-700 
        p-2"
      >
        {exercise.idioms.map((idiom) => {
          const isCorrect = showResults && isAnswerCorrect(idiom.id);
          const isIncorrect = showResults && !isAnswerCorrect(idiom.id);

          return (
            <div 
              key={idiom.id} 
              className="border border-gray-200 rounded-lg p-4 space-y-4"
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold mb-2">
                    Idiom: "{idiom.phrase}"
                  </h3>
                  {idiom.hint && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle 
                            className="w-4 h-4 
                            text-violet-500 dark:text-violet-400 
                            opacity-70 
                            cursor-help 
                            hover:opacity-100 
                            transition-opacity 
                            mb-2"
                          />
                        </TooltipTrigger>
                        <TooltipContent 
                          side="left"
                          className="bg-violet-50 dark:bg-violet-900/80 
                          text-violet-700 dark:text-violet-200 
                          text-xs 
                          p-2 
                          max-w-[200px]"
                        >
                          {idiom.hint}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                {idiom.context && (
                  <div className="flex items-start space-x-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Info 
                      className="w-4 h-4 text-gray-500 dark:text-gray-400 
                      flex-shrink-0 opacity-70 mt-1"
                    />
                    <p className="text-gray-600 dark:text-gray-300 mb-0">
                       {idiom.context}
                    </p>
                  </div>
                )}

                <div className="mt-3 mb-3">
                  <p className="text-base font-medium mb-2">
                    {idiom.question}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {randomizedOptions[idiom.id].map((option) => (
                      <Button
                        key={option.text}
                        variant={
                            showResults
                            ? (option.isCorrect 
                              ? "default" 
                              : selectedAnswers[idiom.id] === option.text 
                                ? "destructive" 
                                : "outline")
                            : (selectedAnswers[idiom.id] === option.text 
                              ? "default" 
                              : "outline")
                        }
                        className={cn(
                          "w-full transition-all duration-300 ease-in-out",
                          selectedAnswers[idiom.id] === option.text && !showResults
                            ? "bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-700 dark:hover:bg-purple-600 scale-105 shadow-lg ring-2 ring-purple-300 dark:ring-purple-600"
                            : "hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:scale-[1.02] transition-transform",
                          showResults && option.isCorrect 
                            ? "bg-green-500 text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600"
                            : "",
                          showResults && selectedAnswers[idiom.id] === option.text && !option.isCorrect
                            ? "bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600"
                            : "",
                          showResults
                            ? "!opacity-100 !cursor-default pointer-events-none" 
                            : ""
                        )}
                        onClick={() => !showResults && setSelectedAnswers(prev => ({
                          ...prev,
                          [idiom.id]: option.text
                        }))}
                        disabled={showResults}
                      >
                        {option.text}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center space-x-4">
        {!showResults ? (
          <Button 
            onClick={checkAnswers} 
            className="w-full sm:w-auto"
            disabled={Object.keys(selectedAnswers).length !== exercise.idioms.length}
          >
            Check Answers
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => {
              setShowResults(false);
              setSelectedAnswers({});
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Reset Exercise
          </Button>
        )}
      </div>

      {showResults && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Exercise Results
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exercise.idioms.map((idiom) => {
              const correctOption = idiom.options.find(opt => opt.isCorrect);
              return (
                <div 
                  key={idiom.id} 
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-md"
                >
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                      Idiom: {idiom.phrase}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {correctOption?.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

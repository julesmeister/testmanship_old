"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Info, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MultipleChoiceProps } from '@/types/exercises';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShuffledQuestion {
  text: string;
  options: {
    german: string;
    english: string;
  }[];
  correctAnswer: number;
  explanation?: string;
  originalCorrectAnswer: number;
}

export default function MultipleChoice({ exercise, onComplete }: MultipleChoiceProps) {
  const [answers, setAnswers] = useState<number[]>(new Array(exercise.questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);

  useEffect(() => {
    // Reset answers when questions change
    setAnswers(new Array(exercise.questions.length).fill(-1));
    setShowResults(false);
    
    // Shuffle options and track the new position of correct answer
    const shuffledQuestions = exercise.questions.map(question => {
      // Create a shuffled copy of the options array with their original indices
      const shuffledOptions = question.options
        .map((opt, idx) => ({ opt, idx }))
        .sort(() => Math.random() - 0.5);
      
      return {
        text: question.text,
        options: shuffledOptions.map(item => ({
          german: item.opt.german,
          english: item.opt.english
        })),
        correctAnswer: shuffledOptions.findIndex(item => item.idx === question.correctAnswer),
        explanation: question.explanation,
        originalCorrectAnswer: question.correctAnswer
      };
    });
    
    setShuffledQuestions(shuffledQuestions);
  }, [exercise.questions]);

  const handleAnswerChange = (questionIndex: number, value: number) => {
    if (showResults) return; // Prevent changes after submission
    
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
    
    // Check if all questions are answered
    if (!newAnswers.includes(-1) && shuffledQuestions.length > 0) {
      checkAnswers(newAnswers);
    }
  };

  const checkAnswers = (finalAnswers: number[]) => {
    setShowResults(true);
    
    const correctCount = finalAnswers.reduce((count, answer, index) => {
      const isCorrect = answer === shuffledQuestions[index].correctAnswer;
      return isCorrect ? count + 1 : count;
    }, 0);
    
    const score = Math.round((correctCount / shuffledQuestions.length) * 100);
    onComplete(score, shuffledQuestions.length);
  };

  if (shuffledQuestions.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="p-6 space-y-8">
        {shuffledQuestions.map((question, questionIndex) => (
          <motion.div
            key={questionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: questionIndex * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20 border border-violet-100 dark:border-violet-800/30">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 dark:from-violet-400 dark:to-pink-400 shadow-lg flex items-center justify-center"
              >
                <span className="text-white font-semibold">
                  {questionIndex + 1}
                </span>
              </motion.div>
              <div className="space-y-1">
                <h3 className="text-lg text-gray-900 dark:text-gray-100 font-semibold leading-snug">
                  {question.text}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose the best answer from the options below
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((option, optionIndex) => (
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "relative cursor-pointer group transition-all duration-300 ease-in-out",
                        "border-2 rounded-xl p-4 text-center",
                        "hover:shadow-lg hover:scale-[1.02]",
                        answers[questionIndex] === optionIndex && !showResults
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 scale-105" 
                          : "border-gray-200 dark:border-gray-700",
                        showResults && optionIndex === question.correctAnswer
                          ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                          : "",
                        showResults && answers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer
                          ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                          : ""
                      )}
                      onClick={() => !showResults && handleAnswerChange(questionIndex, optionIndex)}
                    >
                      <div className="flex items-center justify-center space-x-3 relative">
                        {showResults && optionIndex === question.correctAnswer && (
                          <Check className="w-6 h-6 text-green-500 absolute top-1/2 left-2 -translate-y-1/2" />
                        )}
                        {showResults && answers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer && (
                          <X className="w-6 h-6 text-red-500 absolute top-1/2 left-2 -translate-y-1/2" />
                        )}
                        <span className={cn(
                          "text-base font-medium transition-colors pl-8",
                          answers[questionIndex] === optionIndex && !showResults
                            ? "text-purple-700 dark:text-purple-300"
                            : "text-gray-700 dark:text-gray-300",
                          showResults && optionIndex === question.correctAnswer
                            ? "text-green-700 dark:text-green-300"
                            : "",
                          showResults && answers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer
                            ? "text-red-700 dark:text-red-300"
                            : ""
                        )}>
                          {option.german}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    className={cn(
                      "max-w-[300px] p-3 backdrop-blur-lg border shadow-lg",
                      "bg-white/90 dark:bg-gray-900/90",
                      "border-violet-100 dark:border-violet-800",
                      "text-gray-700 dark:text-gray-200",
                      "rounded-xl"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="pb-2 mb-2 border-b border-violet-100 dark:border-violet-800">
                        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                          <span className="text-xs uppercase tracking-wider font-semibold">English Translation</span>
                        </div>
                      </div>
                      <p className="text-base font-medium leading-relaxed text-gray-800 dark:text-gray-100">{option.english}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {showResults && question.explanation && answers[questionIndex] !== question.correctAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <div className="flex gap-2 items-start">
                  <Info className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-900 dark:text-red-100">{question.explanation}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}

        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Results:</h4>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Correct answers: {answers.reduce((count, answer, index) => 
                answer === shuffledQuestions[index].correctAnswer ? count + 1 : count, 0
              )} out of {exercise.questions.length}
            </div>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}

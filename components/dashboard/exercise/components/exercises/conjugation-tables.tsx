"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConjugationTablesProps } from '@/types/exercises';

export default function ConjugationTables({ exercise, onComplete }: ConjugationTablesProps) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [randomizedConjugations, setRandomizedConjugations] = useState<typeof exercise.conjugations>([]);
  console.log(exercise);
  // Initialize randomized conjugations on mount
  useEffect(() => {
    const shuffled = [...exercise.conjugations]
      .sort(() => Math.random() - 0.5);
    setRandomizedConjugations(shuffled);
    setAnswers(new Array(shuffled.length).fill(''));
  }, [exercise.conjugations]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < randomizedConjugations.length - 1) {
        // If not the last input, focus the next one
        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      } else {
        // If it's the last field, check answers immediately
        checkAnswers();
      }
    }
  };

  // Helper function to get conjugation answer
  const getConjugationAnswer = (conjugation: { pronoun: string; conjugation: string }) => {
    return conjugation.conjugation;
  };

  const checkAnswers = () => {
    setShowResults(true);
    
    const results = randomizedConjugations.map((conjugation, index) => {
      const answer = answers[index];
      if (!answer) {
        return false;
      }
      
      const userAnswer = answer.trim().toLowerCase();
      const correctAnswer = conjugation.conjugation.toLowerCase().trim();
      
      console.log(`Comparing answers at index ${index}:`, {
        pronoun: conjugation.pronoun,
        userAnswer,
        correctAnswer,
      });

      return userAnswer === correctAnswer;
    });

    const correctAnswers = results.filter(result => result).length;
    const totalAnswered = answers.filter(answer => answer.trim().length > 0).length;
    console.log('Score calculation:', {
      correctAnswers,
      totalAnswered,
      score: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
    });

    // Calculate score based on answered questions only
    const score = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                  {exercise.verb}
                </h2>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-violet-400 rounded-full opacity-50" />
              </div>
              <div className="px-3 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-400 bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-800/30 rounded-full border border-violet-200 dark:border-violet-700/50 shadow-sm">
                {exercise.tense}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 rounded-full bg-violet-400 dark:bg-violet-600" />
              <p>
                Complete the conjugation table for <span className="font-medium text-violet-700 dark:text-violet-400">{exercise.verb}</span> in <span className="font-medium text-violet-700 dark:text-violet-400">{exercise.tense}</span> tense
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-100 dark:border-violet-800/30">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-800/50">
              <span className="text-sm font-semibold text-violet-700 dark:text-violet-400">
                {randomizedConjugations.length}
              </span>
            </div>
            <span className="text-sm text-violet-700 dark:text-violet-400">
              conjugations
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4">
        {randomizedConjugations.map((conjugation, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 10
            }}
            className={cn(
              "relative flex items-center gap-4",
              "p-4 rounded-lg transition-all duration-200",
              "border-2 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50",
              !showResults && "hover:border-violet-500/50 hover:from-violet-50 hover:to-violet-50/50 dark:hover:from-violet-900/10 dark:hover:to-violet-900/5",
              !showResults && "focus-within:border-violet-500 focus-within:from-violet-50 focus-within:to-violet-50/50 dark:focus-within:from-violet-900/10 dark:focus-within:to-violet-900/5",
              showResults ? (
                answers[index]?.toLowerCase() === conjugation.conjugation.toLowerCase()
                  ? "border-green-500 from-green-50 to-green-50/50 dark:from-green-900/20 dark:to-green-900/10"
                  : "border-red-500 from-red-50 to-red-50/50 dark:from-red-900/20 dark:to-red-900/10"
              ) : "border-gray-200 dark:border-gray-700"
            )}
          >
            <span className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
              {conjugation.pronoun}
            </span>
            <div className="flex-1">
              <Input
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                data-index={index}
                className={cn(
                  "w-full transition-all duration-200",
                  "bg-transparent border-0 outline-none focus:ring-0 focus:outline-none text-lg",
                  "placeholder:text-gray-400 dark:placeholder:text-gray-600",
                  showResults && (
                    answers[index]?.toLowerCase() === conjugation.conjugation.toLowerCase()
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  ),
                  !showResults && "focus:text-violet-600 dark:focus:text-violet-400"
                )}
                placeholder={`Type the ${exercise.tense} form...`}
                disabled={showResults}
              />
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                  className="flex items-center gap-2 mt-2"
                >
                  {answers[index]?.toLowerCase() === conjugation.conjugation.toLowerCase() ? (
                    <motion.span
                      initial={{ rotate: -180 }}
                      animate={{ rotate: 0 }}
                      className="inline-flex items-center justify-center w-5 h-5 bg-green-500 rounded-full"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.span>
                  ) : (
                    <>
                      <motion.span
                        initial={{ rotate: 180 }}
                        animate={{ rotate: 0 }}
                        className="inline-flex items-center justify-center w-5 h-5 bg-red-500 rounded-full"
                      >
                        <X className="w-3 h-3 text-white" />
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        Correct: <span className="font-medium text-gray-900 dark:text-gray-200">
                          {conjugation.conjugation}
                        </span>
                      </motion.span>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Button
          onClick={checkAnswers}
          disabled={showResults || answers.some(answer => !answer?.trim())}
          className={cn(
            "w-full sm:w-auto transition-all duration-200",
            !showResults && !answers.some(answer => !answer?.trim()) &&
            "bg-violet-600 hover:bg-violet-700 text-white"
          )}
        >
          {showResults ? 'Answers Checked' : 'Check Answers'}
        </Button>
      </div>

    
    </div>
  );
}

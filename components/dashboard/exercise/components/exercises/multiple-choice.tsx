"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MultipleChoiceProps } from '@/types/exercises';

export default function MultipleChoice({ exercise, onComplete }: MultipleChoiceProps) {
  const [answers, setAnswers] = useState<number[]>(new Array(exercise.questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
    
    // Check if all questions are answered
    if (!newAnswers.includes(-1)) {
      checkAnswers();
    }
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correctAnswers = answers.reduce((count, answer, index) => {
      return answer === exercise.questions[index].correctAnswer ? count + 1 : count;
    }, 0);
    const score = Math.round((correctAnswers / exercise.questions.length) * 100);
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-8">
      {exercise.questions.map((question, questionIndex) => (
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

          <RadioGroup
            value={answers[questionIndex].toString()}
            onValueChange={(value) => handleAnswerChange(questionIndex, parseInt(value))}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {question.options.map((option, optionIndex) => (
              <div 
                key={optionIndex} 
                className={cn(
                  "relative flex items-center",
                  "p-4 rounded-lg transition-all duration-200",
                  "border-2 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50",
                  !showResults && "hover:border-violet-500/50 hover:from-violet-50 hover:to-violet-50/50 dark:hover:from-violet-900/10 dark:hover:to-violet-900/5",
                  showResults ? (
                    optionIndex === question.correctAnswer
                      ? "border-green-500 from-green-50 to-green-50/50 dark:from-green-900/20 dark:to-green-900/10"
                      : answers[questionIndex] === optionIndex
                        ? "border-red-500 from-red-50 to-red-50/50 dark:from-red-900/20 dark:to-red-900/10"
                        : "border-gray-200 dark:border-gray-700"
                  ) : "border-gray-200 dark:border-gray-700"
                )}
              >
                <RadioGroupItem
                  value={optionIndex.toString()}
                  id={`q${questionIndex}-o${optionIndex}`}
                  disabled={showResults}
                  className={cn(
                    "transition-colors",
                    showResults && (
                      optionIndex === question.correctAnswer
                        ? "border-green-500 text-green-500"
                        : answers[questionIndex] === optionIndex
                          ? "border-red-500 text-red-500"
                          : ""
                    )
                  )}
                />
                <Label
                  htmlFor={`q${questionIndex}-o${optionIndex}`}
                  className={cn(
                    "flex-1 ml-3 text-base font-medium leading-relaxed",
                    !showResults && "text-gray-800 dark:text-gray-200",
                    showResults && (
                      optionIndex === question.correctAnswer
                        ? "text-green-700 dark:text-green-300"
                        : answers[questionIndex] === optionIndex
                          ? "text-red-700 dark:text-red-300"
                          : "text-gray-600 dark:text-gray-400"
                    )
                  )}
                >
                  {option}
                </Label>
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-4"
                  >
                    {optionIndex === question.correctAnswer ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Correct!</span>
                        <motion.div
                          initial={{ rotate: -180, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: "spring", duration: 0.5 }}
                        >
                          <Check className="w-5 h-5 text-green-500" />
                        </motion.div>
                      </div>
                    ) : answers[questionIndex] === optionIndex && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">Try Again</span>
                        <motion.div
                          initial={{ rotate: 180, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: "spring", duration: 0.5 }}
                        >
                          <X className="w-5 h-5 text-red-500" />
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </RadioGroup>

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
              answer === exercise.questions[index].correctAnswer ? count + 1 : count, 0
            )} out of {exercise.questions.length}
          </div>
        </motion.div>
      )}
    </div>
  );
}

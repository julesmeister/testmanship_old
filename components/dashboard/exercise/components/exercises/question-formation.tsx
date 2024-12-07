"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, HelpCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestionFormationProps } from '@/types/exercises';

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  if (s1 === '' || s2 === '') return 0;
  
  // Calculate common characters
  const chars1 = s1.split('');
  const chars2 = s2.split('');
  const common = chars1.filter(char => chars2.includes(char)).length;
  
  // Calculate similarity percentage
  return Math.round((common / Math.max(s1.length, s2.length)) * 100);
}

export default function QuestionFormation({ exercise, onComplete }: QuestionFormationProps) {
  const [answers, setAnswers] = useState<string[]>(new Array(exercise.statements.length).fill(''));
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState<boolean[]>(new Array(exercise.statements.length).fill(false));

  const similarities = useMemo(() => 
    answers.map((answer, index) => 
      calculateSimilarity(answer, exercise.statements[index].expectedQuestion)
    ), [answers, exercise.statements]
  );

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const toggleHint = (index: number) => {
    const newHints = [...showHints];
    newHints[index] = !newHints[index];
    setShowHints(newHints);
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correctAnswers = answers.reduce((count, answer, index) => {
      return answer.toLowerCase().trim() === exercise.statements[index].expectedQuestion.toLowerCase().trim()
        ? count + 1 : count;
    }, 0);
    const score = Math.round((correctAnswers / exercise.statements.length) * 100);
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3 text-violet-600 dark:text-violet-400">
        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
          <HelpCircle className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium">Form questions based on the given statements</p>
        {!showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-auto"
          >
            <Button
              onClick={checkAnswers}
              className="px-6 font-medium transition-colors bg-violet-500 hover:bg-violet-600 text-white"
            >
              Check Answers
            </Button>
          </motion.div>
        )}
      </div>

      <div className="space-y-8">
        {exercise.statements.map((statement, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative space-y-4 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div className="absolute -left-3 top-6 flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-sm font-medium">
              {index + 1}
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-medium tracking-wide uppercase">
                    Statement
                  </div>
                </div>
                <div className="relative overflow-hidden">
                  <motion.div 
                    className={cn(
                      "absolute top-0 left-0 h-full transition-colors",
                      similarities[index] === 0
                        ? "bg-violet-400 dark:bg-violet-600"
                        : similarities[index] < 30
                        ? "bg-orange-400 dark:bg-orange-600"
                        : similarities[index] < 60
                        ? "bg-yellow-400 dark:bg-yellow-600"
                        : similarities[index] < 90
                        ? "bg-lime-400 dark:bg-lime-600"
                        : "bg-emerald-400 dark:bg-emerald-600"
                    )}
                    initial={{ width: "1.5px" }}
                    animate={{ 
                      width: showResults 
                        ? "1.5px" 
                        : `${Math.max(1.5, similarities[index])}%`
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="relative pl-6 pr-4 py-4">
                    <div 
                      className={cn(
                        "relative transition-colors",
                        similarities[index] > 0
                          ? "text-gray-900 dark:text-gray-50"
                          : "text-gray-700 dark:text-gray-200"
                      )}
                    >
                      {statement.text}
                    </div>
                  </div>
                </div>
              </div>
              {statement.hint && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleHint(index)}
                  className="mt-8 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/30 dark:hover:text-violet-400"
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showHints[index] && statement.hint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-3 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{statement.hint}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Your question
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </label>
              {(!showResults || 
                (showResults && 
                  answers[index].toLowerCase().trim() === statement.expectedQuestion.toLowerCase().trim()
                )) && (
                <Textarea
                  value={answers[index]}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className={cn(
                    "resize-none transition-colors",
                    showResults && (
                      answers[index].toLowerCase().trim() === statement.expectedQuestion.toLowerCase().trim()
                        ? "border-green-500 bg-green-50 dark:bg-green-950/50 focus-visible:ring-green-500"
                        : "border-red-500 bg-red-50 dark:bg-red-950/50 focus-visible:ring-red-500"
                    )
                  )}
                  placeholder="Type your question here..."
                  disabled={showResults}
                  rows={2}
                />
              )}
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  {answers[index].toLowerCase().trim() === statement.expectedQuestion.toLowerCase().trim() ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">Correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600 dark:text-red-400">
                        Correct answer: {statement.expectedQuestion}
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

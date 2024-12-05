"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConjugationTablesProps {
  exercise: {
    id: string;
    verb: string;
    tense: string;
    pronouns: string[];
    conjugations: string[];
  };
  onComplete: (score: number) => void;
}

export default function ConjugationTables({ exercise, onComplete }: ConjugationTablesProps) {
  const [answers, setAnswers] = useState<string[]>(new Array(exercise.pronouns.length).fill(''));
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correctAnswers = answers.reduce((count, answer, index) => {
      return answer.toLowerCase() === exercise.conjugations[index].toLowerCase() ? count + 1 : count;
    }, 0);
    const score = Math.round((correctAnswers / exercise.pronouns.length) * 100);
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Conjugate: 
            <span className="ml-2 text-violet-600 dark:text-violet-400">{exercise.verb}</span>
          </h3>
          <span className="px-2 py-1 text-sm bg-violet-50 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 rounded-md">
            {exercise.tense}
          </span>
        </div>

        <div className="grid gap-4">
          {exercise.pronouns.map((pronoun, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-24 text-right">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{pronoun}</span>
              </div>
              <Input
                type="text"
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={cn(
                  "max-w-[200px]",
                  showResults && (
                    answers[index].toLowerCase() === exercise.conjugations[index].toLowerCase()
                      ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                      : "border-red-500 bg-red-50 dark:bg-red-950/50"
                  )
                )}
                placeholder="Type conjugation..."
                disabled={showResults}
              />
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  {answers[index].toLowerCase() === exercise.conjugations[index].toLowerCase() ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  ) : (
                    <>
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 rounded-full">
                        <X className="w-3 h-3 text-white" />
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Correct: <span className="font-medium text-gray-900 dark:text-gray-200">{exercise.conjugations[index]}</span>
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {!showResults && (
        <Button
          onClick={checkAnswers}
          className="w-full sm:w-auto"
          disabled={answers.some(answer => !answer)}
        >
          Check Answers
        </Button>
      )}

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Study the correct conjugations:
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {exercise.pronouns.map((pronoun, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">{pronoun}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {exercise.conjugations[index]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

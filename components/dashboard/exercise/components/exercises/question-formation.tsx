"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionFormationProps {
  exercise: {
    id: string;
    statements: {
      text: string;
      expectedQuestion: string;
      hint?: string;
    }[];
  };
  onComplete: (score: number) => void;
}

export default function QuestionFormation({ exercise, onComplete }: QuestionFormationProps) {
  const [answers, setAnswers] = useState<string[]>(new Array(exercise.statements.length).fill(''));
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState<boolean[]>(new Array(exercise.statements.length).fill(false));

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
      // Simple string comparison - could be enhanced with more sophisticated matching
      return answer.toLowerCase().trim() === exercise.statements[index].expectedQuestion.toLowerCase().trim()
        ? count + 1 : count;
    }, 0);
    const score = Math.round((correctAnswers / exercise.statements.length) * 100);
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-8">
        {exercise.statements.map((statement, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-gray-900 dark:text-gray-100 font-medium mb-2">
                  Statement {index + 1}:
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">
                  {statement.text}
                </div>
              </div>
              {statement.hint && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleHint(index)}
                  className="mt-8"
                >
                  <HelpCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </Button>
              )}
            </div>

            {showHints[index] && statement.hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm rounded-lg"
              >
                💡 Hint: {statement.hint}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Form a question:
              </label>
              <Textarea
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={cn(
                  "resize-none",
                  showResults && (
                    answers[index].toLowerCase().trim() === statement.expectedQuestion.toLowerCase().trim()
                      ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                      : "border-red-500 bg-red-50 dark:bg-red-950/50"
                  )
                )}
                placeholder="Type your question here..."
                disabled={showResults}
                rows={2}
              />
            </div>

            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  {answers[index].toLowerCase().trim() === statement.expectedQuestion.toLowerCase().trim() ? (
                    <>
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                      <span className="text-sm text-green-600 dark:text-green-400">Perfect!</span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 rounded-full">
                        <X className="w-3 h-3 text-white" />
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Expected: <span className="font-medium text-gray-900 dark:text-gray-200">{statement.expectedQuestion}</span>
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
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
    </div>
  );
}

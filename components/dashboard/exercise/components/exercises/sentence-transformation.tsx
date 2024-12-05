"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, ArrowLeftRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SentenceTransformationProps {
  exercise: {
    id: string;
    sentences: {
      original: string;
      transformation: string;
      expectedResult: string;
      hint?: string;
    }[];
  };
  onComplete: (score: number) => void;
}

export default function SentenceTransformation({ exercise, onComplete }: SentenceTransformationProps) {
  const [answers, setAnswers] = useState<string[]>(new Array(exercise.sentences.length).fill(''));
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState<boolean[]>(new Array(exercise.sentences.length).fill(false));

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
      return answer.toLowerCase().trim() === exercise.sentences[index].expectedResult.toLowerCase().trim()
        ? count + 1 : count;
    }, 0);
    const score = Math.round((correctAnswers / exercise.sentences.length) * 100);
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-8">
      {exercise.sentences.map((sentence, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-4"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Original Sentence:
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100">
                  {sentence.original}
                </div>
              </div>
              {sentence.hint && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleHint(index)}
                >
                  <HelpCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400">
              <ArrowLeftRight className="w-4 h-4" />
              <span>Transform using: {sentence.transformation}</span>
            </div>

            {showHints[index] && sentence.hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm rounded-lg"
              >
                💡 Hint: {sentence.hint}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your transformed sentence:
              </label>
              <Textarea
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={cn(
                  "resize-none",
                  showResults && (
                    answers[index].toLowerCase().trim() === sentence.expectedResult.toLowerCase().trim()
                      ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                      : "border-red-500 bg-red-50 dark:bg-red-950/50"
                  )
                )}
                placeholder="Type your transformed sentence here..."
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
                  {answers[index].toLowerCase().trim() === sentence.expectedResult.toLowerCase().trim() ? (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">Perfect transformation!</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Expected: <span className="font-medium text-gray-900 dark:text-gray-200">{sentence.expectedResult}</span>
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}

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
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Review your transformations:</h4>
          <div className="space-y-4">
            {exercise.sentences.map((sentence, index) => (
              <div key={index} className="text-sm space-y-1">
                <div className="text-gray-600 dark:text-gray-400">Original: {sentence.original}</div>
                <div className="text-gray-600 dark:text-gray-400">Transform using: {sentence.transformation}</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Expected: {sentence.expectedResult}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

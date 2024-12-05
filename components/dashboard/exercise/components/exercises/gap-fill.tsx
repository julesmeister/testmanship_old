"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GapFillProps {
  exercise: {
    id: string;
    text: string;
    gaps: {
      id: string;
      answer: string;
      hint?: string;
      acceptableAnswers?: string[];
    }[];
  };
  onComplete: (score: number) => void;
}

export default function GapFill({ exercise, onComplete }: GapFillProps) {
  const [answers, setAnswers] = useState<{ [key: string]: string }>(
    exercise.gaps.reduce((acc, gap) => ({ ...acc, [gap.id]: '' }), {})
  );
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState<{ [key: string]: boolean }>(
    exercise.gaps.reduce((acc, gap) => ({ ...acc, [gap.id]: false }), {})
  );

  const handleAnswerChange = (gapId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [gapId]: value }));
  };

  const toggleHint = (gapId: string) => {
    setShowHints(prev => ({ ...prev, [gapId]: !prev[gapId] }));
  };

  const isAnswerCorrect = (gapId: string) => {
    const gap = exercise.gaps.find(g => g.id === gapId);
    if (!gap) return false;

    const userAnswer = answers[gapId].toLowerCase().trim();
    const correctAnswers = [gap.answer, ...(gap.acceptableAnswers || [])].map(a => a.toLowerCase().trim());
    return correctAnswers.includes(userAnswer);
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correctCount = exercise.gaps.reduce((count, gap) => 
      isAnswerCorrect(gap.id) ? count + 1 : count, 0
    );
    const score = Math.round((correctCount / exercise.gaps.length) * 100);
    onComplete(score);
  };

  // Split text into segments with gaps
  const textSegments = exercise.text.split(/\{\{(\d+)\}\}/);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="text-gray-900 dark:text-gray-100 leading-relaxed">
          {textSegments.map((segment, index) => {
            // Even indices are text segments, odd indices are gap IDs
            if (index % 2 === 0) {
              return <span key={index}>{segment}</span>;
            }

            const gapId = segment;
            const gap = exercise.gaps.find(g => g.id === gapId);
            if (!gap) return null;

            return (
              <span key={index} className="inline-block mx-1">
                <div className="inline-flex flex-col">
                  <Input
                    type="text"
                    value={answers[gapId]}
                    onChange={(e) => handleAnswerChange(gapId, e.target.value)}
                    className={cn(
                      "w-32 text-center",
                      showResults && (
                        isAnswerCorrect(gapId)
                          ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                          : "border-red-500 bg-red-50 dark:bg-red-950/50"
                      )
                    )}
                    disabled={showResults}
                  />
                  {gap.hint && !showResults && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleHint(gapId)}
                      className="text-xs text-violet-600 dark:text-violet-400 mt-1"
                    >
                      {showHints[gapId] ? "Hide Hint" : "Show Hint"}
                    </Button>
                  )}
                  {showHints[gapId] && gap.hint && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-violet-600 dark:text-violet-400 mt-1"
                    >
                      💡 {gap.hint}
                    </motion.div>
                  )}
                  {showResults && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-1 mt-1"
                    >
                      {isAnswerCorrect(gapId) ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <>
                          <X className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {gap.answer}
                          </span>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              </span>
            );
          })}
        </div>
      </div>

      {!showResults && (
        <Button
          onClick={checkAnswers}
          className="w-full sm:w-auto"
          disabled={Object.values(answers).some(answer => !answer)}
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
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Correct Answers:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {exercise.gaps.map((gap) => (
              <div key={gap.id} className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Gap {gap.id}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{gap.answer}</span>
                {gap.acceptableAnswers?.length > 0 && (
                  <span className="text-gray-500 dark:text-gray-500">
                    (also accept: {gap.acceptableAnswers.join(", ")})
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

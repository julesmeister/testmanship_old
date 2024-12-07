"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WordBuildingProps } from '@/types/exercises';

export default function WordBuilding({ exercise, onComplete }: WordBuildingProps) {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState<{ [key: string]: boolean }>({});

  const handleAnswerChange = (wordId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [wordId]: value }));
  };

  const toggleHint = (wordId: string) => {
    setShowHints(prev => ({ ...prev, [wordId]: !prev[wordId] }));
  };

  const isAnswerCorrect = (answer: string, target: string) => {
    return answer.trim().toLowerCase() === target.trim().toLowerCase();
  };

  const checkAnswers = () => {
    setShowResults(true);
    let correctCount = 0;
    let totalWords = exercise.words.length;

    exercise.words.forEach(word => {
      if (answers[word.id] && isAnswerCorrect(answers[word.id], word.target)) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalWords) * 100);
    onComplete(score, totalWords);
  };

  return (
    <div className="p-6 space-y-8">
      {exercise.words.map((word) => (
        <motion.div
          key={word.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
              <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Root Word:
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-900 dark:text-gray-100">
                    {word.root}
                  </span>
                  {word.type && (
                    <span className="px-2 py-1 text-xs font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30 rounded">
                      Add {word.type}
                    </span>
                  )}
                </div>

                {(word.prefix || word.suffix) && (
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {word.prefix && (
                      <span>Prefix available: <span className="font-medium">{word.prefix}</span></span>
                    )}
                    {word.suffix && (
                      <span>Suffix available: <span className="font-medium">{word.suffix}</span></span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  value={answers[word.id] || ''}
                  onChange={(e) => handleAnswerChange(word.id, e.target.value)}
                  placeholder="Build the new word..."
                  className={cn(
                    showResults && (
                      isAnswerCorrect(answers[word.id] || '', word.target)
                        ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                        : "border-red-500 bg-red-50 dark:bg-red-950/50"
                    )
                  )}
                  disabled={showResults}
                />

                {word.hint && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHint(word.id)}
                    className="text-violet-600 dark:text-violet-400"
                  >
                    {showHints[word.id] ? "Hide Hint" : "Show Hint"}
                  </Button>
                )}

                {showHints[word.id] && word.hint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm rounded"
                  >
                    💡 {word.hint}
                  </motion.div>
                )}

                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      {isAnswerCorrect(answers[word.id] || '', word.target) ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">
                            Correct word!
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-600 dark:text-red-400">
                            Not quite right
                          </span>
                        </>
                      )}
                    </div>

                    {!isAnswerCorrect(answers[word.id] || '', word.target) && (
                      <div className="space-y-3">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Correct Word:
                          </h4>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {word.target}
                          </p>
                        </div>

                        {word.explanation && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                              Explanation:
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              {word.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {!showResults && (
        <Button
          onClick={checkAnswers}
          className="w-full sm:w-auto"
          disabled={Object.keys(answers).length === 0}
        >
          Check Words
        </Button>
      )}
    </div>
  );
}

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SentenceCorrectionProps } from '@/types/exercises';

export default function SentenceCorrection({ exercise, onComplete }: SentenceCorrectionProps) {
  const [corrections, setCorrections] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState<{ [key: string]: boolean }>({});

  const handleCorrectionChange = (sentenceId: string, value: string) => {
    setCorrections(prev => ({ ...prev, [sentenceId]: value }));
  };

  const toggleHint = (sentenceId: string) => {
    setShowHints(prev => ({ ...prev, [sentenceId]: !prev[sentenceId] }));
  };

  const isCorrectionCorrect = (correction: string, expected: string) => {
    return correction.trim().toLowerCase() === expected.trim().toLowerCase();
  };

  const checkAnswers = () => {
    setShowResults(true);
    let correctCount = 0;
    let totalSentences = exercise.sentences.length;

    exercise.sentences.forEach(sentence => {
      if (corrections[sentence.id] && isCorrectionCorrect(corrections[sentence.id], sentence.correction)) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalSentences) * 100);
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-8">
      {exercise.sentences.map((sentence) => (
        <motion.div
          key={sentence.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
              <Edit3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                {sentence.focus && (
                  <span className="inline-block px-2 py-1 text-xs font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30 rounded">
                    Focus: {sentence.focus}
                  </span>
                )}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-900 dark:text-gray-100">{sentence.text}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Textarea
                  value={corrections[sentence.id] || ''}
                  onChange={(e) => handleCorrectionChange(sentence.id, e.target.value)}
                  placeholder="Write the corrected sentence..."
                  className={cn(
                    "resize-none",
                    showResults && (
                      isCorrectionCorrect(corrections[sentence.id] || '', sentence.correction)
                        ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                        : "border-red-500 bg-red-50 dark:bg-red-950/50"
                    )
                  )}
                  disabled={showResults}
                  rows={2}
                />

                {sentence.hint && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHint(sentence.id)}
                    className="text-violet-600 dark:text-violet-400"
                  >
                    {showHints[sentence.id] ? "Hide Hint" : "Show Hint"}
                  </Button>
                )}

                {showHints[sentence.id] && sentence.hint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm rounded"
                  >
                    💡 {sentence.hint}
                  </motion.div>
                )}

                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      {isCorrectionCorrect(corrections[sentence.id] || '', sentence.correction) ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">
                            Perfect correction!
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

                    {!isCorrectionCorrect(corrections[sentence.id] || '', sentence.correction) && (
                      <div className="space-y-3">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Correct Version:
                          </h4>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {sentence.correction}
                          </p>
                        </div>

                        {sentence.explanation && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                              Explanation:
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              {sentence.explanation}
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
          disabled={Object.keys(corrections).length === 0}
        >
          Check Corrections
        </Button>
      )}
    </div>
  );
}

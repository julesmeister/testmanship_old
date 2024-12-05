"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, SplitSquareHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SentenceSplittingProps {
  exercise: {
    id: string;
    sentences: {
      id: string;
      text: string;
      expectedSplits: string[];
      hint?: string;
    }[];
  };
  onComplete: (score: number) => void;
}

export default function SentenceSplitting({ exercise, onComplete }: SentenceSplittingProps) {
  const [responses, setResponses] = useState<{ [key: string]: string[] }>({});
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState<{ [key: string]: boolean }>({});

  const handleResponseChange = (sentenceId: string, value: string) => {
    const splits = value.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    setResponses(prev => ({ ...prev, [sentenceId]: splits }));
  };

  const toggleHint = (sentenceId: string) => {
    setShowHints(prev => ({ ...prev, [sentenceId]: !prev[sentenceId] }));
  };

  const isResponseCorrect = (response: string[], expected: string[]) => {
    if (response.length !== expected.length) return false;
    return response.every((split, index) => 
      split.toLowerCase() === expected[index].toLowerCase()
    );
  };

  const checkAnswers = () => {
    setShowResults(true);
    let correctCount = 0;
    let totalSentences = exercise.sentences.length;

    exercise.sentences.forEach(sentence => {
      if (responses[sentence.id] && isResponseCorrect(responses[sentence.id], sentence.expectedSplits)) {
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
              <SplitSquareHorizontal className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-900 dark:text-gray-100">{sentence.text}</p>
              </div>

              <div className="space-y-2">
                <Textarea
                  value={responses[sentence.id]?.join('. ') || ''}
                  onChange={(e) => handleResponseChange(sentence.id, e.target.value)}
                  placeholder="Split the sentence into smaller ones. Use periods (.) to separate them."
                  className={cn(
                    "resize-none",
                    showResults && (
                      isResponseCorrect(responses[sentence.id] || [], sentence.expectedSplits)
                        ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                        : "border-red-500 bg-red-50 dark:bg-red-950/50"
                    )
                  )}
                  disabled={showResults}
                  rows={3}
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
                      {isResponseCorrect(responses[sentence.id] || [], sentence.expectedSplits) ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">
                            Perfect splits!
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

                    {!isResponseCorrect(responses[sentence.id] || [], sentence.expectedSplits) && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Expected Splits:
                        </h4>
                        <div className="space-y-2">
                          {sentence.expectedSplits.map((split, index) => (
                            <div
                              key={index}
                              className="p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                            >
                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                {split}
                              </p>
                            </div>
                          ))}
                        </div>
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
          disabled={Object.keys(responses).length === 0}
        >
          Check Splits
        </Button>
      )}
    </div>
  );
}

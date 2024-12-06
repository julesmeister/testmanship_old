"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DialogueCompletionProps } from '@/types/exercises';

export default function DialogueCompletion({ exercise, onComplete }: DialogueCompletionProps) {
  const [answers, setAnswers] = useState<string[]>(
    exercise.dialogue.filter(d => d.isResponse).map(() => '')
  );
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState<boolean[]>(
    exercise.dialogue.filter(d => d.isResponse).map(() => false)
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
    const responseDialogues = exercise.dialogue.filter(d => d.isResponse);
    const correctAnswers = answers.reduce((count, answer, index) => {
      return answer.toLowerCase().trim() === responseDialogues[index].expectedResponse?.toLowerCase().trim()
        ? count + 1 : count;
    }, 0);
    const score = Math.round((correctAnswers / responseDialogues.length) * 100);
    onComplete(score);
  };

  let responseIndex = -1;

  return (
    <div className="p-6 space-y-6">
      {exercise.context && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Context:</h3>
          <p className="text-gray-900 dark:text-gray-100">{exercise.context}</p>
        </div>
      )}

      <div className="space-y-4">
        {exercise.dialogue.map((line, index) => {
          if (line.isResponse) responseIndex++;
          const currentResponseIndex = responseIndex;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: line.speaker === 'User' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex gap-4",
                line.speaker === 'User' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[80%] space-y-2",
                line.speaker === 'User' ? "items-end" : "items-start"
              )}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {line.speaker}
                  </span>
                </div>

                {line.isResponse ? (
                  <div className="space-y-2">
                    <Textarea
                      value={answers[currentResponseIndex]}
                      onChange={(e) => handleAnswerChange(currentResponseIndex, e.target.value)}
                      className={cn(
                        "resize-none min-w-[300px]",
                        showResults && (
                          answers[currentResponseIndex].toLowerCase().trim() === line.expectedResponse?.toLowerCase().trim()
                            ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                            : "border-red-500 bg-red-50 dark:bg-red-950/50"
                        )
                      )}
                      placeholder="Type your response..."
                      disabled={showResults}
                      rows={2}
                    />
                    
                    {line.hint && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHint(currentResponseIndex)}
                        className="text-violet-600 dark:text-violet-400"
                      >
                        {showHints[currentResponseIndex] ? "Hide Hint" : "Show Hint"}
                      </Button>
                    )}

                    {showHints[currentResponseIndex] && line.hint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm rounded"
                      >
                        💡 {line.hint}
                      </motion.div>
                    )}

                    {showResults && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2"
                      >
                        {answers[currentResponseIndex].toLowerCase().trim() === line.expectedResponse?.toLowerCase().trim() ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400">Perfect response!</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Expected: <span className="font-medium text-gray-900 dark:text-gray-200">{line.expectedResponse}</span>
                            </span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className={cn(
                    "p-3 rounded-lg",
                    line.speaker === 'User'
                      ? "bg-violet-100 dark:bg-violet-900/50 text-violet-900 dark:text-violet-100"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  )}>
                    {line.text}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
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

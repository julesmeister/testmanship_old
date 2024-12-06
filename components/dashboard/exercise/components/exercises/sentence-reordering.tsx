"use client";

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, MoveHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SentenceReorderingProps } from '@/types/exercises';

export default function SentenceReordering({ exercise, onComplete }: SentenceReorderingProps) {
  const [sentences, setSentences] = useState(() =>
    exercise.sentences.map(sentence => ({
      ...sentence,
      segments: [...sentence.segments].sort(() => Math.random() - 0.5),
      showHint: false
    }))
  );
  const [showResults, setShowResults] = useState(false);

  const handleReorder = (newOrder: typeof exercise.sentences[0]['segments'], sentenceIndex: number) => {
    const newSentences = [...sentences];
    newSentences[sentenceIndex] = {
      ...newSentences[sentenceIndex],
      segments: newOrder
    };
    setSentences(newSentences);
  };

  const toggleHint = (sentenceIndex: number) => {
    const newSentences = [...sentences];
    newSentences[sentenceIndex] = {
      ...newSentences[sentenceIndex],
      showHint: !newSentences[sentenceIndex].showHint
    };
    setSentences(newSentences);
  };

  const isSentenceCorrect = (sentenceIndex: number) => {
    return sentences[sentenceIndex].segments.every(
      (segment, index) => segment.position === index
    );
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correctSentences = sentences.reduce(
      (count, _, index) => isSentenceCorrect(index) ? count + 1 : count,
      0
    );
    const score = Math.round((correctSentences / sentences.length) * 100);
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-8">
      {sentences.map((sentence, sentenceIndex) => (
        <motion.div
          key={sentence.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sentenceIndex * 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Sentence {sentenceIndex + 1}
            </h3>
            {sentence.hint && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleHint(sentenceIndex)}
                className="text-violet-600 dark:text-violet-400"
              >
                {sentence.showHint ? "Hide Hint" : "Show Hint"}
              </Button>
            )}
          </div>

          {sentence.showHint && sentence.hint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm rounded-lg"
            >
              💡 {sentence.hint}
            </motion.div>
          )}

          <Reorder.Group
            axis="x"
            values={sentence.segments}
            onReorder={(newOrder) => handleReorder(newOrder, sentenceIndex)}
            className="flex flex-wrap gap-2"
          >
            {sentence.segments.map((segment) => (
              <Reorder.Item
                key={segment.id}
                value={segment}
                className={cn(
                  "px-4 py-2 rounded-lg shadow-sm cursor-grab active:cursor-grabbing",
                  "border transition-colors",
                  !showResults && "hover:border-violet-300 dark:hover:border-violet-700",
                  showResults
                    ? segment.position === sentence.segments.indexOf(segment)
                      ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300"
                      : "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{segment.text}</span>
                  {showResults && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {segment.position === sentence.segments.indexOf(segment) ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </motion.span>
                  )}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {showResults && !isSentenceCorrect(sentenceIndex) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Correct Order:
              </h4>
              <div className="flex flex-wrap gap-2">
                {[...sentence.segments]
                  .sort((a, b) => a.position - b.position)
                  .map((segment) => (
                    <span
                      key={segment.id}
                      className="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-lg text-sm"
                    >
                      {segment.text}
                    </span>
                  ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}

      {!showResults && (
        <Button
          onClick={checkAnswers}
          className="w-full sm:w-auto"
        >
          Check Order
        </Button>
      )}
    </div>
  );
}

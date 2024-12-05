"use client";

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchingProps {
  exercise: {
    id: string;
    pairs: {
      left: string;
      right: string;
    }[];
  };
  onComplete: (score: number) => void;
}

export default function Matching({ exercise, onComplete }: MatchingProps) {
  const [leftItems] = useState(exercise.pairs.map(p => p.left));
  const [rightItems, setRightItems] = useState(() => {
    // Shuffle right items
    return exercise.pairs
      .map(p => p.right)
      .sort(() => Math.random() - 0.5);
  });
  const [matches, setMatches] = useState<number[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleMatch = (rightIndex: number) => {
    if (selectedLeft === null) return;

    const newMatches = [...matches];
    // Remove any existing matches for these items
    const leftMatch = matches.findIndex(m => m === rightIndex);
    if (leftMatch !== -1) {
      newMatches[leftMatch] = -1;
    }
    newMatches[selectedLeft] = rightIndex;
    setMatches(newMatches);
    setSelectedLeft(null);
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correctMatches = matches.reduce((count, rightIndex, leftIndex) => {
      return exercise.pairs[leftIndex].right === rightItems[rightIndex] ? count + 1 : count;
    }, 0);
    const score = Math.round((correctMatches / exercise.pairs.length) * 100);
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-4">
          {leftItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !showResults && setSelectedLeft(index)}
              className={cn(
                "p-4 rounded-lg cursor-pointer transition-all duration-200",
                selectedLeft === index 
                  ? "bg-violet-100 dark:bg-violet-900 ring-2 ring-violet-500"
                  : "bg-white dark:bg-gray-800 hover:shadow-md",
                matches[index] !== undefined && matches[index] !== -1 && (
                  showResults
                    ? exercise.pairs[index].right === rightItems[matches[index]]
                      ? "bg-green-50 dark:bg-green-900/50 ring-2 ring-green-500"
                      : "bg-red-50 dark:bg-red-900/50 ring-2 ring-red-500"
                    : "bg-violet-50 dark:bg-violet-900/50 ring-1 ring-violet-200 dark:ring-violet-700"
                )
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">{item}</span>
                {showResults && matches[index] !== -1 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "inline-flex items-center justify-center w-5 h-5 rounded-full",
                      exercise.pairs[index].right === rightItems[matches[index]]
                        ? "bg-green-500"
                        : "bg-red-500"
                    )}
                  >
                    {exercise.pairs[index].right === rightItems[matches[index]] ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <X className="w-3 h-3 text-white" />
                    )}
                  </motion.span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {rightItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectedLeft !== null && !showResults && handleMatch(index)}
              className={cn(
                "p-4 rounded-lg cursor-pointer transition-all duration-200",
                "bg-white dark:bg-gray-800 hover:shadow-md",
                selectedLeft !== null && !showResults && "hover:ring-2 hover:ring-violet-300",
                matches.includes(index) && (
                  showResults
                    ? exercise.pairs[matches.indexOf(index)].right === item
                      ? "bg-green-50 dark:bg-green-900/50 ring-2 ring-green-500"
                      : "bg-red-50 dark:bg-red-900/50 ring-2 ring-red-500"
                    : "bg-violet-50 dark:bg-violet-900/50 ring-1 ring-violet-200 dark:ring-violet-700"
                )
              )}
            >
              <span className="text-gray-900 dark:text-gray-100">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {!showResults && matches.filter(m => m !== -1).length === exercise.pairs.length && (
        <Button
          onClick={checkAnswers}
          className="w-full sm:w-auto"
        >
          Check Answers
        </Button>
      )}

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Correct Pairs:</h4>
            <div className="space-y-2">
              {exercise.pairs.map((pair, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-900 dark:text-gray-100">{pair.left}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-100">{pair.right}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

"use client";

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DragAndDropProps } from '@/types/exercises';

export default function DragAndDrop({ exercise, onComplete }: DragAndDropProps) {
  const [items, setItems] = useState(() => 
    [...exercise.items].sort(() => Math.random() - 0.5)
  );
  const [showResults, setShowResults] = useState(false);

  const checkAnswers = () => {
    setShowResults(true);
    const correctPositions = items.reduce((count, item, index) => {
      const correctItem = exercise.items.find(i => i.correctPosition === index);
      return item.id === correctItem?.id ? count + 1 : count;
    }, 0);
    const score = Math.round((correctPositions / exercise.items.length) * 100);
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="text-gray-900 dark:text-gray-100 font-medium">
          {exercise.instruction}
        </div>

        <Reorder.Group
          axis="y"
          values={items}
          onReorder={setItems}
          className="space-y-2"
        >
          {items.map((item) => (
            <Reorder.Item
              key={item.id}
              value={item}
              className={cn(
                "relative flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm",
                "border transition-colors cursor-grab active:cursor-grabbing",
                !showResults && "hover:border-violet-300 dark:hover:border-violet-700",
                showResults && (
                  item.correctPosition === items.indexOf(item)
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-red-500 bg-red-50 dark:bg-red-900/20"
                )
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700">
                <GripVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>

              <span className="flex-1 text-gray-900 dark:text-gray-100">
                {item.content}
              </span>

              {showResults && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-3"
                >
                  {item.correctPosition === items.indexOf(item) ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">Correct!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <X className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-600 dark:text-red-400">
                        Should be at position {item.correctPosition + 1}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {!showResults && (
        <Button
          onClick={checkAnswers}
          className="w-full sm:w-auto"
        >
          Check Order
        </Button>
      )}

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Correct Order:</h4>
          <div className="space-y-2">
            {[...exercise.items]
              .sort((a, b) => a.correctPosition - b.correctPosition)
              .map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-900 dark:text-violet-100">
                    {index + 1}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">{item.content}</span>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

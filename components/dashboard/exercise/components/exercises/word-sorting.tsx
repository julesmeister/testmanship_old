"use client";

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, SortAsc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WordSortingProps {
  exercise: {
    id: string;
    categories: {
      id: string;
      name: string;
      description?: string;
    }[];
    words: {
      id: string;
      text: string;
      category: string;
    }[];
  };
  onComplete: (score: number) => void;
}

interface SortedWords {
  [categoryId: string]: {
    id: string;
    text: string;
    category: string;
  }[];
}

export default function WordSorting({ exercise, onComplete }: WordSortingProps) {
  const [sortedWords, setSortedWords] = useState<SortedWords>(() => {
    // Initialize with shuffled words in "unsorted" category
    const initialState: SortedWords = { unsorted: [...exercise.words].sort(() => Math.random() - 0.5) };
    exercise.categories.forEach(category => {
      initialState[category.id] = [];
    });
    return initialState;
  });
  
  const [showResults, setShowResults] = useState(false);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);

  const moveWord = (word: typeof exercise.words[0], fromCategory: string, toCategory: string) => {
    setSortedWords(prev => {
      const newState = { ...prev };
      newState[fromCategory] = prev[fromCategory].filter(w => w.id !== word.id);
      newState[toCategory] = [...prev[toCategory], word];
      return newState;
    });
  };

  const isWordCorrect = (word: typeof exercise.words[0], categoryId: string) => {
    return word.category === categoryId;
  };

  const checkAnswers = () => {
    setShowResults(true);
    let correctCount = 0;
    let totalWords = 0;

    exercise.categories.forEach(category => {
      sortedWords[category.id].forEach(word => {
        if (isWordCorrect(word, category.id)) {
          correctCount++;
        }
        totalWords++;
      });
    });

    const score = Math.round((correctCount / totalWords) * 100);
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unsorted Words */}
        {sortedWords.unsorted.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Words to Sort
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[100px]">
              <div className="flex flex-wrap gap-2">
                {sortedWords.unsorted.map((word) => (
                  <motion.div
                    key={word.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 bg-white dark:bg-gray-700 rounded-full shadow-sm cursor-grab
                             border border-gray-200 dark:border-gray-600 hover:border-violet-300 dark:hover:border-violet-700"
                    draggable
                    onDragStart={() => setDraggedWord(word.id)}
                  >
                    {word.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="space-y-4">
          {exercise.categories.map((category) => (
            <motion.div
              key={category.id}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{category.name}</h4>
                {category.description && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {category.description}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "p-4 rounded-lg min-h-[100px] transition-colors",
                  "border-2 border-dashed",
                  draggedWord
                    ? "border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedWord) {
                    const word = exercise.words.find(w => w.id === draggedWord);
                    if (word) {
                      moveWord(word, 'unsorted', category.id);
                    }
                    setDraggedWord(null);
                  }
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {sortedWords[category.id].map((word) => (
                    <motion.div
                      key={word.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "px-3 py-1.5 rounded-full shadow-sm",
                        "border",
                        showResults
                          ? isWordCorrect(word, category.id)
                            ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300"
                            : "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300"
                          : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>{word.text}</span>
                        {showResults && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            {isWordCorrect(word, category.id) ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {!showResults && sortedWords.unsorted.length === 0 && (
        <Button
          onClick={checkAnswers}
          className="w-full sm:w-auto"
        >
          Check Categories
        </Button>
      )}

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Correct Categories:</h4>
          <div className="space-y-4">
            {exercise.categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {category.name}:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {exercise.words
                    .filter(word => word.category === category.id)
                    .map(word => (
                      <span
                        key={word.id}
                        className="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-full text-sm"
                      >
                        {word.text}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

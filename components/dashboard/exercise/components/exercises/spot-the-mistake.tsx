import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Quote, RefreshCw } from 'lucide-react';
import type { SpotTheMistakeProps } from '@/types/exercises';
import { cn } from '@/lib/utils';

export default function SpotTheMistake({ exercise, onComplete }: SpotTheMistakeProps) {
  // Add null checks and provide default values
  const safeExercise = exercise ?? {
    id: 'default-spot-the-mistake',
    paragraph: '',
    focus_words: []
  };

  const [selectedWordIndices, setSelectedWordIndices] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [correctlyIdentifiedMistakes, setCorrectlyIdentifiedMistakes] = useState<number[]>([]);

  const checkAnswer = useCallback(() => {
    if (showResults) return;

    setIsAnimating(true);
    setTimeout(() => {
      setShowResults(true);

      const correctMistakes = safeExercise.focus_words?.filter(fw => fw.isMistake)
        .map(fw => fw.position) ?? [];

      const totalMistakes = correctMistakes.length;
      const correctlySelectedMistakes = selectedWordIndices.filter(index => correctMistakes.includes(index));
      const incorrectlySelectedWords = selectedWordIndices.filter(index => !correctMistakes.includes(index));

      // Calculate score with penalty for incorrect selections
      const score = totalMistakes > 0
        ? Math.round(
          (correctlySelectedMistakes.length / totalMistakes) * 100 -
          (incorrectlySelectedWords.length * 20) // Penalty for each incorrect selection
        )
        : 0;

      // Ensure score doesn't go below 0
      const finalScore = Math.max(score, 0);

      if (correctlySelectedMistakes.length > 0) {
        setCorrectlyIdentifiedMistakes(prev =>
          [...prev, ...correctlySelectedMistakes]
        );
      }

      onComplete?.(finalScore, totalMistakes);
    }, 300);
  }, [safeExercise.focus_words, selectedWordIndices, onComplete, showResults]);

  // Color palette for random hover backgrounds
  const colors = useMemo(() => [
    { bg: "bg-gray-100 dark:bg-gray-900/30", hover: "hover:bg-gray-200 dark:hover:bg-gray-800/30", text: "text-gray-700 dark:text-gray-300", hoverText: "hover:text-gray-700 dark:hover:text-gray-300" },
    { bg: "bg-pink-100 dark:bg-pink-900/30", hover: "hover:bg-pink-200 dark:hover:bg-pink-800/30", text: "text-pink-700 dark:text-pink-300", hoverText: "hover:text-pink-700 dark:hover:text-pink-300" },
    { bg: "bg-blue-100 dark:bg-blue-900/30", hover: "hover:bg-blue-200 dark:hover:bg-blue-800/30", text: "text-blue-700 dark:text-blue-300", hoverText: "hover:text-blue-700 dark:hover:text-blue-300" },
    { bg: "bg-green-100 dark:bg-green-900/30", hover: "hover:bg-green-200 dark:hover:bg-green-800/30", text: "text-green-700 dark:text-green-300", hoverText: "hover:text-green-700 dark:hover:text-green-300" },
    { bg: "bg-purple-100 dark:bg-purple-900/30", hover: "hover:bg-purple-200 dark:hover:bg-purple-800/30", text: "text-purple-700 dark:text-purple-300", hoverText: "hover:text-purple-700 dark:hover:text-purple-300" },
    { bg: "bg-yellow-100 dark:bg-yellow-900/30", hover: "hover:bg-yellow-200 dark:hover:bg-yellow-800/30", text: "text-yellow-700 dark:text-yellow-300", hoverText: "hover:text-yellow-700 dark:hover:text-yellow-300" },
    { bg: "bg-red-100 dark:bg-red-900/30", hover: "hover:bg-red-200 dark:hover:bg-red-800/30", text: "text-red-700 dark:text-red-300", hoverText: "hover:text-red-700 dark:hover:text-red-300" },
  ], []);

  const getColorForWord = useCallback((index: number) => {
    // Use the first color (gray) as default for unselected words
    return colors[Math.min(Math.max(0, index % colors.length), colors.length - 1)];
  }, [colors]);



  const renderParagraphWithWords = () => {
    const words = (safeExercise.paragraph ?? '').split(/\s+/);

    return (!safeExercise.focus_words?.length) ? (
      <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center">
        <motion.div
          initial={{ y: 0 }}
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-5xl mb-4"
        >
          🔍
        </motion.div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 
          bg-gray-100 dark:bg-gray-800 
          px-3 py-1 
          rounded-full 
          inline-block 
          shadow-sm 
          hover:bg-gray-200 dark:hover:bg-gray-700 
          transition-all duration-300 
          cursor-default
          select-none"
        >
          No mistakes to spot in this exercise
        </p>
      </div>
    ) : (
      <div className="text-lg leading-relaxed space-y-6">
        {words.map((word, index) => (
          <motion.span
            key={index}
            className="inline-block m-0 p-0"
            initial={false}
            animate={isAnimating ? { scale: [1, 0.9, 1], y: [0, -2, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              className={cn(
                "relative text-lg font-semibold rounded-lg transition-all duration-300 ease-out",
                "inline-block px-1 py-0.5 whitespace-normal",
                "group cursor-pointer",
                "border-2 border-transparent",
                "text-gray-600",
                "font-['Ubuntu', 'Nunito', 'Poppins', 'Arial', 'sans-serif']",
                !selectedWordIndices.includes(index)
                  ? cn(
                    `hover:border-${getColorForWord(index).bg.split('-')[1]}-200 dark:hover:border-${getColorForWord(index).bg.split('-')[1]}-800/50`,
                    getColorForWord(index).hoverText
                  )
                  : cn(
                    `hover:border-${getColorForWord(index).bg.split('-')[1]}-200 dark:hover:border-${getColorForWord(index).bg.split('-')[1]}-800/50`,
                    getColorForWord(index).hoverText
                  ),
                "hover:bg-violet-50 dark:hover:bg-violet-900/20",
                "hover:scale-[1.02] hover:shadow-sm",
                selectedWordIndices.includes(index)
                  ? cn(
                    `bg-${getColorForWord(index).bg.split('-')[1]}-100 dark:bg-${getColorForWord(index).bg.split('-')[1]}-900/30`,
                    `text-${getColorForWord(index).bg.split('-')[1]}-700 dark:text-${getColorForWord(index).bg.split('-')[1]}-300`,
                    `border-${getColorForWord(index).bg.split('-')[1]}-200 dark:border-${getColorForWord(index).bg.split('-')[1]}-800/50`
                  )
                  : cn(
                    getColorForWord(index).hoverText,
                    getColorForWord(index).hover
                  ),
                showResults && safeExercise.focus_words?.some(fw => fw.position === index && fw.isMistake)
                  ? (correctlyIdentifiedMistakes.includes(index)
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/50"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50")
                  : ""
              )}
              onClick={() => {
                if (!showResults) {
                  setSelectedWordIndices(prev =>
                    prev.includes(index)
                      ? prev.filter(i => i !== index)
                      : [...prev, index]
                  );
                }
              }}
              whileTap={{ scale: 0.95 }}
              style={{ position: 'relative' }}
            >
              {word}
              {showResults && safeExercise.focus_words?.some(fw => fw.position === index && fw.isMistake && !correctlyIdentifiedMistakes.includes(index)) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: -50 }}
                  className="absolute left-1/2 transform -translate-x-1/2 px-2 py-1 font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-2xl border border-green-200 dark:border-green-800/50 z-10"
                >
                  {safeExercise.focus_words.find(fw => fw.position === index && fw.isMistake)?.correctWord}
                </motion.div>
              )}
            </motion.button>
          </motion.span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">Click on the word or words that are mistakes in the sentence.</p>
          </div>
          {!showResults && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={checkAnswer}
                disabled={selectedWordIndices.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Check Answer
              </Button>
            </motion.div>
          )}
        </div>
        {/* Mistakes Counter */}
        <div className="w-full max-w-sm mx-auto mb-4">
          <div className="bg-gradient-to-br from-violet-50/50 to-violet-100/50 dark:from-violet-900/20 dark:to-violet-900/30 
            border border-violet-200/50 dark:border-violet-700/30 
            rounded-2xl shadow-xl shadow-violet-100/30 dark:shadow-violet-900/20 
            overflow-hidden 
            transform transition-all duration-300 
            hover:scale-[1.01] hover:shadow-2xl">
            <div className="flex items-center justify-between p-5 space-x-4">
              <div className="bg-violet-100/50 dark:bg-violet-800/30 
                rounded-full p-3 
                shadow-inner 
                border border-violet-200/50 dark:border-violet-700/30">
                <AlertTriangle className="w-8 h-8 text-violet-600 dark:text-violet-300 
                  transition-transform duration-300 
                  group-hover:rotate-6" />
              </div>
              <div className="flex-grow text-center">
                <p className="text-xs uppercase tracking-widest 
                  text-violet-800 dark:text-violet-200 
                  mb-1 opacity-70 
                  transition-all duration-300 
                  group-hover:opacity-100">
                  Mistakes to Spot
                </p>
                <p className="text-4xl font-black 
                  text-violet-700 dark:text-violet-300 
                  leading-tight 
                  tracking-tighter
                  transition-all duration-300 
                  group-hover:text-violet-900 dark:group-hover:text-violet-100">
                  {safeExercise.focus_words?.filter(word => word.isMistake).length ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Paragraph with Clickable Words */}
        <div className="text-center relative flex items-start justify-center gap-3 w-full">
          <div className="self-start mt-1">
            <Quote className="w-8 h-8 text-gray-400 dark:text-gray-500 opacity-100 transform scale-x-[-1]" />
          </div>
          <div className="flex-grow">
            {renderParagraphWithWords()}
          </div>
          <div className="self-end mt-1">
            <Quote className="w-8 h-8 text-gray-400 dark:text-gray-500 opacity-100" />
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/30 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-800/50"
            >
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  Mistakes Identified
                </h3>
              </div>
              {safeExercise.focus_words?.filter(word => word?.isMistake)
                .map((mistakeWord, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-blue-900/60 p-4 rounded-xl mb-3 border border-blue-100 dark:border-blue-800/50 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-700 dark:text-blue-300 font-medium">
                          Mistake at position {mistakeWord.position}
                        </p>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                          {mistakeWord.word}
                        </p>
                      </div>
                      <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
                    </div>
                  </motion.div>
                ))}
              {safeExercise.focus_words?.filter(word => word?.isMistake).length === 0 && (
                <div className="text-center text-green-600 dark:text-green-400 font-medium">
                  No mistakes found! Great job! 🎉
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

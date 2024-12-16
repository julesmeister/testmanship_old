import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, AlertCircle } from 'lucide-react';
import type { FillInTheBlanksProps } from '@/types/exercises';
import { cn } from '@/lib/utils';

export default function FillInTheBlanks({ exercise, onComplete }: FillInTheBlanksProps) {
  // Add null checks and provide default values
  const safeExercise = exercise ?? {
    id: 'default-fill-in-the-blanks',
    sentence: '',
    blanks: []
  };

  const [answers, setAnswers] = useState<string[]>(
    new Array((safeExercise.blanks?.filter(blank => blank.position !== 0) ?? []).length).fill('')
  );
  const [showResults, setShowResults] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentBlankIndex, setCurrentBlankIndex] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);

  useEffect(() => {
    // Reset answers when the exercise changes
    setAnswers(new Array(safeExercise.blanks.length).fill(''));
  }, [safeExercise.blanks]);

  const colors = useMemo(() => [
    { bg: "bg-pink-100 dark:bg-pink-900/30", hover: "hover:bg-pink-200 dark:hover:bg-pink-800/30", text: "text-pink-700 dark:text-pink-300", disabled: "bg-pink-50 dark:bg-pink-900/10 text-pink-300 dark:text-pink-700" },
    { bg: "bg-blue-100 dark:bg-blue-900/30", hover: "hover:bg-blue-200 dark:hover:bg-blue-800/30", text: "text-blue-700 dark:text-blue-300", disabled: "bg-blue-50 dark:bg-blue-900/10 text-blue-300 dark:text-blue-700" },
    { bg: "bg-green-100 dark:bg-green-900/30", hover: "hover:bg-green-200 dark:hover:bg-green-800/30", text: "text-green-700 dark:text-green-300", disabled: "bg-green-50 dark:bg-green-900/10 text-green-300 dark:text-green-700" },
    { bg: "bg-purple-100 dark:bg-purple-900/30", hover: "hover:bg-purple-200 dark:hover:bg-purple-800/30", text: "text-purple-700 dark:text-purple-300", disabled: "bg-purple-50 dark:bg-purple-900/10 text-purple-300 dark:text-purple-700" },
    { bg: "bg-yellow-100 dark:bg-yellow-900/30", hover: "hover:bg-yellow-200 dark:hover:bg-yellow-800/30", text: "text-yellow-700 dark:text-yellow-300", disabled: "bg-yellow-50 dark:bg-yellow-900/10 text-yellow-300 dark:text-yellow-700" },
    { bg: "bg-red-100 dark:bg-red-900/30", hover: "hover:bg-red-200 dark:hover:bg-red-800/30", text: "text-red-700 dark:text-red-300", disabled: "bg-red-50 dark:bg-red-900/10 text-red-300 dark:text-red-700" },
  ], []);

  const getColorForChoice = useCallback((index: number) => {
    return colors[index % colors.length];
  }, [colors]);

  const handleAnswerChange = (index: number, value: string) => {
    if (index < 0 || index >= (safeExercise.blanks?.length ?? 0)) return;

    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    setCurrentBlankIndex(null);
  };

  const handleBlankClick = (index: number) => {
    if (showResults) return;

    // If there's an answer and we click the same blank, clear it
    if (answers[index]?.trim()) {
      const newAnswers = [...answers];
      newAnswers[index] = '';
      setAnswers(newAnswers);
      return;
    }

    setCurrentBlankIndex(currentBlankIndex === index ? null : index);
  };

  const handleChoiceClick = (choice: string) => {
    if (showResults) return;

    // If a blank is selected, fill that one
    if (currentBlankIndex !== null) {
      handleAnswerChange(currentBlankIndex, choice);
      return;
    }

    // Otherwise, find the first empty blank
    const firstEmptyIndex = answers.findIndex(answer => !answer.trim());
    if (firstEmptyIndex !== -1) {
      handleAnswerChange(firstEmptyIndex, choice);
    }
  };

  const choices = useMemo(() => {
    return safeExercise.blanks?.map(blank => blank.word).sort(() => Math.random() - 0.5) ?? [];
  }, [safeExercise.blanks]);

  const checkAnswers = useCallback(() => {
    if (!safeExercise.blanks?.length) {
      onComplete?.(0, 0);
      return;
    }

    setIsAnimating(true);
    setTimeout(() => {
      setShowResults(true);
      console.log('Safe Exercise Blanks:', safeExercise.blanks?.filter(blank => blank.position !== 0));
      console.log('User Answers:', answers);

      const scoreDetails = safeExercise.blanks?.filter(blank => blank.position !== 0).map((blank, index) => {
        const correctWord = blank.word.toLowerCase().trim();
        const userAnswer = answers[index]?.toLowerCase().trim();
        const isCorrect = blank.word.toLowerCase() === userAnswer;

        return {
          index,
          correctWord,
          userAnswer,
          isCorrect
        };
      }) || [];

      console.log('Score Details:', scoreDetails);

      const score = scoreDetails.reduce((acc, detail) => {
        return acc + (detail.isCorrect ? 1 : 0);
      }, 0);

      const totalBlanks = safeExercise.blanks?.filter(blank => blank.position !== 0).length ?? 0;
      const scorePercentage = totalBlanks > 0
        ? Math.round((score / totalBlanks) * 100)
        : 0;

      console.log('Calculated Score:', {
        score,
        totalBlanks,
        scorePercentage
      });

      const correct = scoreDetails.filter(detail => detail.isCorrect).map(detail => detail.correctWord);
      setCorrectAnswers(correct);
      onComplete?.(scorePercentage, totalBlanks);
    }, 300);
  }, [safeExercise.blanks, answers, onComplete]);


  const parts = safeExercise && safeExercise.sentence ? safeExercise.sentence.split(/(_+)/g) : [];
  let blankIndex = 0;

  const renderSentenceWithBlanks = () => {
    return (!safeExercise || !safeExercise.sentence || !safeExercise.blanks?.length) ? (
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
          No sentence available for this exercise
        </p>
      </div>
    ) : (
      // Split by one or more underscores
      <div className="text-lg leading-relaxed space-y-6">
        {parts.map((part, index) => {
          if (part.match(/_+/)) {
            const currentBlankIndex = blankIndex;
            const answer = answers[currentBlankIndex];
            const colorSet = getColorForChoice(currentBlankIndex);
            blankIndex++;

            return (
              <motion.span
                key={index}
                className="inline-block mx-1"
                initial={false}
                animate={isAnimating ? { scale: [1, 0.9, 1], y: [0, -2, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                {answer ? (
                  <motion.div className="relative">
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-lg",
                        [colorSet.bg, colorSet.hover, colorSet.text]
                      )}
                      onClick={() => handleBlankClick(currentBlankIndex)}
                    >
                      {answer}
                    </motion.button>
                    {showResults && answer.toLowerCase() !== safeExercise.blanks?.find(blank => blank.position === currentBlankIndex + 1)?.word.toLowerCase() && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: -50 }}
                        className="absolute left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded"
                      >
                        {safeExercise.blanks?.find(blank => blank.position === currentBlankIndex + 1)?.word}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.button
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-dashed",
                      currentBlankIndex === currentBlankIndex
                        ? "border-violet-400 dark:border-violet-500"
                        : "border-gray-300 dark:border-gray-600",
                      "text-gray-500 dark:text-gray-400"
                    )}
                    onClick={() => handleBlankClick(currentBlankIndex)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {currentBlankIndex + 1}
                  </motion.button>
                )}
              </motion.span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
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
            <p className="text-sm font-medium">Fill in the blanks with the correct words to complete the sentence.</p>
          </div>
          {!showResults && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={checkAnswers}
                disabled={answers.some(answer => !answer.trim())}
                className={cn(
                  "px-6 font-medium transition-colors",
                  answers.some(answer => !answer.trim())
                    ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                    : "px-6 font-medium transition-colors bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-500"
                )}
              >
                Check Answers
              </Button>
            </motion.div>
          )}
        </div>
        {/* Show choices which are clickable */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[...new Set(choices)].map((choice, index) => {
            const colorSet = getColorForChoice(index);
            return (
              <button
                key={index}
                onClick={() => handleChoiceClick(choice)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  [colorSet.bg, colorSet.hover, colorSet.text]
                )}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {renderSentenceWithBlanks()}
      </div>

    </div>
  );
}

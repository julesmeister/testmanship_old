import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, Sparkles, CloudRain, ClipboardList } from "lucide-react";
import useSaveScore from '@/hooks/useSaveScore';
import { SupabaseClient } from "@supabase/supabase-js";

interface ExerciseGradeProps {
  showResults: boolean;
  correctCount: number;
  totalQuestions: number;
  onTryAgain: () => void;
  userId: string;
  exerciseId?: string | null;
  supabase: SupabaseClient;
  difficulty: string;
  onScoreSaved?: () => void;
}

export function ExerciseGrade({ showResults, correctCount, totalQuestions, onTryAgain, userId, exerciseId, supabase, difficulty, onScoreSaved }: ExerciseGradeProps) {
  const { saveScore } = useSaveScore(supabase, onScoreSaved);

  const [hasSavedScore, setHasSavedScore] = useState(false);

  useEffect(() => {
    console.log('Resetting hasSavedScore to false');
    console.log('hasSavedScore changed to:', false);
    setHasSavedScore(false);
  }, [exerciseId, showResults]);

  useEffect(() => {
    if (showResults && exerciseId && !hasSavedScore) {
      // Assuming correctCount is already a percentage
      let score = correctCount;
      // Clamp score between 0 and 100
      score = Math.max(0, Math.min(100, score));
      saveScore(userId, exerciseId, score, difficulty);
      setHasSavedScore(true); // Mark score as saved
    }
  }, [showResults, exerciseId, correctCount]);

  if (!showResults || totalQuestions === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="p-8 bg-white/50 dark:bg-gray-800/50 rounded-3xl backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-6 text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              animate={{ scale: 1.05, rotate: -5 }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <ClipboardList className="w-12 h-12" />
            </motion.div>
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              animate={{ scale: 1.05, rotate: 5 }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <span className="text-3xl">📝</span>
            </motion.div>
          </div>
          
          <div className="space-y-2 text-center">
            <p className="text-base font-medium">Complete an exercise to see your results</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Track your progress and earn achievements as you learn
            </p>
          </div>

          <div className="flex gap-3 text-2xl opacity-50">
            <motion.span
              initial={{ y: 0 }}
              animate={{ y: [-2, 2, -2] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎯
            </motion.span>
            <motion.span
              initial={{ y: 0 }}
              animate={{ y: [-2, 2, -2] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
            >
              ⭐
            </motion.span>
            <motion.span
              initial={{ y: 0 }}
              animate={{ y: [-2, 2, -2] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6
              }}
            >
              🏆
            </motion.span>
          </div>
        </div>
      </motion.div>
    );
  }

  const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 relative overflow-hidden"
    >
      <AnimatePresence>
        {correctCount >= 50 && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                  x: [0, Math.random() * 200 - 100],
                  y: [0, Math.random() * -200]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              >
                <Sparkles className={cn(
                  "w-6 h-6",
                  i % 2 === 0 ? "text-yellow-400" : "text-amber-400"
                )} />
              </motion.div>
            ))}
          </>
        )}
        {correctCount < 50 && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -20 }}
                animate={{ 
                  opacity: [0, 0.3, 0],
                  y: [-20, 100],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "linear"
                }}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                }}
              >
                <CloudRain className="w-4 h-4 text-blue-400/50" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="space-y-10 relative z-10">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Exercise Complete!
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Here's how you did on this exercise
          </p>
        </div>

        <div className="flex justify-center">
          <div className="text-center space-y-1">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Final Score
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {correctCount}/100
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "relative flex flex-col items-center gap-2 p-6",
              "before:absolute before:inset-0 before:-skew-y-2 before:rounded-lg before:opacity-10",
              correctCount >= 80 
                ? "text-emerald-700 dark:text-emerald-400 before:bg-emerald-500" 
                : correctCount >= 60 
                ? "text-amber-700 dark:text-amber-400 before:bg-amber-500"
                : "text-rose-700 dark:text-rose-400 before:bg-rose-500"
            )}
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-3xl relative"
            >
              {correctCount >= 80 ? "🏆" : correctCount >= 60 ? "🌟" : "💪"}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base font-semibold relative"
            >
              {correctCount >= 80 ? (
                <span className="flex items-center gap-2">
                  Excellent! <span className="text-lg">🎉</span>
                </span>
              ) : correctCount >= 60 ? (
                <span className="flex items-center gap-2">
                  Good Job! <span className="text-lg">✨</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Keep Going! <span className="text-lg">🎯</span>
                </span>
              )}
            </motion.div>
          </motion.div>
          <Button
            variant="outline"
            size="lg"
            onClick={onTryAgain}
            className="min-w-[200px]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

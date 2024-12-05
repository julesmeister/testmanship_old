"use client";

import { motion } from 'framer-motion';
import { BookOpen, Clock, Star, ArrowRight, Trophy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ExerciseDetailsProps {
  exercise?: {
    id: string;
    title: string;
    description: string;
    duration: number;
    difficulty: string;
    completed?: boolean;
    score?: number;
    objectives: string[];
    progress?: number;
  };
  onStart?: () => void;
  onContinue?: () => void;
}

export default function ExerciseDetails({ exercise, onStart, onContinue }: ExerciseDetailsProps) {
  if (!exercise) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{exercise.title}</h2>
            <p className="text-gray-500 mt-1">{exercise.description}</p>
          </div>
          {exercise.completed && (
            <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-full">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">{exercise.score}% Score</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{exercise.duration} minutes</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(getDifficultyStars(exercise.difficulty))].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
          </div>
        </div>

        {exercise.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-violet-600">{exercise.progress}%</span>
            </div>
            <Progress value={exercise.progress} className="h-2" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Learning Objectives</h3>
        <div className="space-y-2">
          {exercise.objectives.map((objective, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <span className="text-gray-600">{objective}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {exercise.progress ? (
          <Button
            onClick={onContinue}
            className="flex items-center gap-2"
          >
            Continue Exercise
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={onStart}
            className="flex items-center gap-2"
          >
            Start Exercise
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function getDifficultyStars(difficulty: string): number {
  switch (difficulty.toLowerCase()) {
    case 'a1': return 1;
    case 'a2': return 2;
    case 'b1': return 3;
    case 'b2': return 4;
    case 'c1': return 5;
    case 'c2': return 6;
    default: return 1;
  }
}

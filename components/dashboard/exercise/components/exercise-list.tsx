"use client";

import { motion } from 'framer-motion';
import { BookOpen, Clock, Star, ChevronRight, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: string;
  completed?: boolean;
  score?: number;
}

interface ExerciseListProps {
  exercises: Exercise[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

export default function ExerciseList({ exercises, selectedId, onSelect }: ExerciseListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Available Exercises</h3>
        <span className="text-sm text-gray-500">{exercises.length} exercises</span>
      </div>

      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(exercise.id)}
            className={cn(
              "group cursor-pointer rounded-xl p-4 transition-all duration-200",
              "hover:bg-violet-50 hover:shadow-md",
              selectedId === exercise.id ? "bg-violet-50 shadow-md" : "bg-white/50",
              "border border-gray-100"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 group-hover:text-violet-700 transition-colors">
                    {exercise.title}
                  </h4>
                  {exercise.completed && (
                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                      <Trophy className="w-3 h-3" />
                      <span>{exercise.score}%</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{exercise.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exercise.duration}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(getDifficultyStars(exercise.difficulty))].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <ChevronRight className={cn(
                "w-5 h-5 transition-all duration-200",
                "text-gray-400 group-hover:text-violet-500",
                "group-hover:translate-x-1",
                selectedId === exercise.id && "text-violet-500 translate-x-1"
              )} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
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

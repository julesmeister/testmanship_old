"use client";

import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Trophy, CheckCircle2, BookOpenCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exercise {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
  score?: number;
  progress?: number;
}

interface ExerciseListProps {
  exercises: Exercise[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

export default function ExerciseList({ exercises, selectedId, onSelect }: ExerciseListProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Available Exercises</h3>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 rounded-md border border-violet-100 dark:border-violet-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="font-medium">{exercises.length} exercises</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-300 rounded-md border border-green-100 dark:border-green-500/20">
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span className="font-medium">{exercises.filter(e => e.completed).length} completed</span>
          </div>
        </div>
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
              "relative group cursor-pointer rounded-xl transition-all duration-300",
              "border border-transparent hover:border-violet-200 dark:hover:border-violet-500/30",
              "bg-white/50 dark:bg-gray-800/50 hover:bg-gradient-to-r from-violet-50/50 to-white dark:hover:bg-gradient-to-r dark:from-violet-500/10 dark:to-gray-800/50",
              selectedId === exercise.id 
                ? "bg-gradient-to-r from-violet-50/80 to-white dark:from-violet-500/20 dark:to-gray-800/50 border-violet-200 dark:border-violet-500/30 shadow-[0_2px_8px_-1px_rgba(107,70,193,0.1)]" 
                : "hover:shadow-[0_2px_8px_-1px_rgba(107,70,193,0.05)]"
            )}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "font-medium transition-colors duration-300",
                      selectedId === exercise.id 
                        ? "text-violet-700 dark:text-violet-300" 
                        : "text-gray-900 dark:text-gray-100 group-hover:text-violet-600 dark:group-hover:text-violet-300"
                    )}>
                      {exercise.title}
                    </h4>
                    {exercise.completed && exercise.score && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full text-xs font-medium">
                        <Trophy className="w-3 h-3" />
                        <span>{exercise.score}%</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 pr-6">{exercise.description}</p>
                  
                  {exercise.progress !== undefined && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Progress</span>
                        <span className="text-xs font-medium text-violet-600 dark:text-violet-300">{exercise.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-300",
                            selectedId === exercise.id 
                              ? "bg-violet-500 dark:bg-violet-400" 
                              : "bg-violet-400 dark:bg-violet-500 group-hover:bg-violet-500 dark:group-hover:bg-violet-400"
                          )}
                          style={{ width: `${exercise.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <ChevronRight className={cn(
                  "w-5 h-5 transition-all duration-300 mt-1",
                  selectedId === exercise.id 
                    ? "text-violet-500 dark:text-violet-400 translate-x-1" 
                    : "text-gray-400 dark:text-gray-500 group-hover:text-violet-400 dark:group-hover:text-violet-300 group-hover:translate-x-1"
                )} />
              </div>
            </div>
            
            {exercise.progress !== undefined && !exercise.completed && (
              <div className="h-0.5 bg-gray-100/50 dark:bg-gray-700/50">
                <div 
                  className={cn(
                    "h-full transition-all duration-300",
                    selectedId === exercise.id 
                      ? "bg-violet-500 dark:bg-violet-400" 
                      : "bg-violet-400 dark:bg-violet-500 group-hover:bg-violet-500 dark:group-hover:bg-violet-400"
                  )}
                  style={{ width: `${exercise.progress}%` }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

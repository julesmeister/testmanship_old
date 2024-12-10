"use client";

import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Trophy, CheckCircle2, BookOpenCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTextFit } from '@/hooks/useTextFit';
import { Exercise } from '@/hooks/useExercises';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface ExerciseListProps {
  exercises: Exercise[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

export default function ExerciseList({ exercises, selectedId, onSelect }: ExerciseListProps) {
  const exercisesCount = useTextFit();
  const completedCount = useTextFit();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div ref={exercisesCount.containerRef} 
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-b from-violet-50 to-violet-100/80 dark:from-violet-950 dark:to-violet-900 rounded-lg ring-1 ring-violet-200 dark:ring-violet-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <BookOpen className="w-3.5 h-3.5 text-violet-500 dark:text-violet-300" />
              <span ref={exercisesCount.textRef} 
                className={`font-semibold text-${exercisesCount.fontSize} text-violet-700 dark:text-violet-200`}>
                {exercises.length}
              </span>
            </div>
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-violet-700 dark:bg-violet-800 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg">
              Total Exercises
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform rotate-45 w-2 h-2 bg-violet-700 dark:bg-violet-800"></div>
            </div>
          </div>

          <div className="relative group">
            <div ref={completedCount.containerRef} 
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-b from-emerald-50 to-emerald-100/80 dark:from-emerald-950 dark:to-emerald-900 rounded-lg ring-1 ring-emerald-200 dark:ring-emerald-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <BookOpenCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-300" />
              <span ref={completedCount.textRef} 
                className={`font-semibold text-${completedCount.fontSize} text-emerald-700 dark:text-emerald-200`}>
                {exercises.filter(e => e.completed).length}
              </span>
            </div>
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-emerald-700 dark:bg-emerald-800 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg">
              Completed Exercises
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform rotate-45 w-2 h-2 bg-emerald-700 dark:bg-emerald-800"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {exercises
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative group cursor-pointer rounded-xl transition-all duration-300",
              "border border-transparent hover:border-violet-200 dark:hover:border-violet-700",
              "bg-white/50 hover:bg-gradient-to-r from-violet-50/50 to-white dark:bg-gray-900/50 dark:hover:bg-gradient-to-r dark:from-violet-950/50 dark:to-gray-900",
              selectedId === exercise.id 
                ? "bg-gradient-to-r from-violet-50/80 to-white border-violet-200 shadow-[0_2px_8px_-1px_rgba(107,70,193,0.1)] dark:from-violet-950/80 dark:to-gray-900 dark:border-violet-700 dark:shadow-[0_2px_8px_-1px_rgba(139,92,246,0.15)]" 
                : "border-violet-100 hover:shadow-[0_2px_8px_-1px_rgba(107,70,193,0.05)] dark:border-violet-900/50 dark:hover:shadow-[0_2px_8px_-1px_rgba(139,92,246,0.1)]",
            )}
          >
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <div className="p-4" onClick={() => onSelect(exercise.id)}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h4 className={cn(
                          "font-medium transition-colors duration-300",
                          selectedId === exercise.id 
                            ? "text-violet-700 dark:text-violet-300" 
                            : "text-gray-900 group-hover:text-violet-600 dark:text-gray-100 dark:group-hover:text-violet-300"
                        )}>
                          {exercise.topic}
                        </h4>
                        <div className="flex items-center gap-1 text-sm">
                          {exercise.completed && exercise.score && (
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-950/50 px-2 py-0.5 rounded-full text-xs font-medium">
                              <Trophy className="w-3 h-3" />
                              <span>{exercise.score}%</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 pr-6">{exercise.description}</p>
                        
                        {exercise.progress !== undefined && (
                          <div className="mt-3 space-y-1">
                            <Progress value={exercise.progress} className="h-2 rounded-full bg-gray-100/30 dark:bg-gray-800/30 mt-2 mb-1" />
                          </div>
                        )}
                      </div>
                      
                      <ChevronRight className={cn(
                        "w-5 h-5 transition-all duration-300 mt-1",
                        selectedId === exercise.id 
                          ? "text-violet-500 dark:text-violet-400 translate-x-1" 
                          : "text-gray-400 group-hover:text-violet-400 dark:text-gray-500 dark:group-hover:text-violet-400 group-hover:translate-x-1"
                      )} />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  className={cn(
                    "max-w-[300px] p-4 backdrop-blur-lg border shadow-lg",
                    "bg-white/90 dark:bg-gray-900/90",
                    "border-violet-100 dark:border-violet-800",
                    "text-gray-700 dark:text-gray-200",
                    "rounded-xl"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm font-medium">Description</span>
                    </div>
                    <p className="text-sm leading-relaxed">{exercise.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

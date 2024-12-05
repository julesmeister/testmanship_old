"use client";

import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Trophy, CheckCircle2, BookOpenCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTextFit } from '@/hooks/useTextFit';

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  completed?: boolean;
  score?: number;
  progress?: number;
  objectives: string[];
}

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
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-gray-900">Available Exercises</h3>
          <div className="flex-1 flex justify-end">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
              {exercises.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div ref={exercisesCount.containerRef} className="flex items-center gap-1.5 px-2 py-0.5 bg-violet-50 text-violet-600 rounded-md border border-violet-100 h-[26px]">
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span ref={exercisesCount.textRef} className={`font-medium text-${exercisesCount.fontSize} whitespace-nowrap`}>
              {exercises.length} exercises
            </span>
          </div>
          <div ref={completedCount.containerRef} className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-md border border-green-100 h-[26px]">
            <BookOpenCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span ref={completedCount.textRef} className={`font-medium text-${completedCount.fontSize} whitespace-nowrap`}>
              {exercises.filter(e => e.completed).length} completed
            </span>
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
              "border border-transparent hover:border-violet-200",
              "bg-white/50 hover:bg-gradient-to-r from-violet-50/50 to-white",
              selectedId === exercise.id 
                ? "bg-gradient-to-r from-violet-50/80 to-white border-violet-200 shadow-[0_2px_8px_-1px_rgba(107,70,193,0.1)]" 
                : "border-violet-100 hover:shadow-[0_2px_8px_-1px_rgba(107,70,193,0.05)]",
            )}
          >
            {/* {exercise.completed && (
              <div className="absolute top-0 right-0 w-16 h-16">
                <div className="absolute transform rotate-45 bg-green-500 text-white text-xs font-semibold py-1 right-[-35px] top-[32px] w-[170px] text-center">
                  Completed
                </div>
              </div>
            )} */}
            
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "font-medium transition-colors duration-300",
                      selectedId === exercise.id 
                        ? "text-violet-700" 
                        : "text-gray-900 group-hover:text-violet-600"
                    )}>
                      {exercise.title}
                    </h4>
                    {exercise.completed && exercise.score && (
                      <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        <Trophy className="w-3 h-3" />
                        <span>{exercise.score}%</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 pr-6">{exercise.description}</p>
                  
                  {exercise.progress !== undefined && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">Progress</span>
                        <span className="text-xs font-medium text-violet-600">{exercise.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-500 rounded-full transition-all duration-300"
                          style={{ width: `${exercise.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <ChevronRight className={cn(
                  "w-5 h-5 transition-all duration-300 mt-1",
                  selectedId === exercise.id 
                    ? "text-violet-500 translate-x-1" 
                    : "text-gray-400 group-hover:text-violet-400 group-hover:translate-x-1"
                )} />
              </div>
            </div>
            
            {exercise.progress !== undefined && !exercise.completed && (
              <div className="h-0.5 bg-gray-100/50">
                <div 
                  className={cn(
                    "h-full transition-all duration-300",
                    selectedId === exercise.id 
                      ? "bg-violet-500" 
                      : "bg-violet-400 group-hover:bg-violet-500"
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

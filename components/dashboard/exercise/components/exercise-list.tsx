"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Trophy, CheckCircle2, BookOpenCheck, AlertTriangle, Frown, Slash } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from '@/components/ui/slider';

interface ExerciseListProps {
  exercises: Exercise[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

export default function ExerciseList({ exercises, selectedId, onSelect }: ExerciseListProps) {
  const exercisesCount = useTextFit();
  const completedCount = useTextFit();
  const [showAll, setShowAll] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [progressThreshold, setProgressThreshold] = useState(30);

  return (
    exercises.length === 0 ? (
      <motion.div
        className="placeholder flex flex-col items-center justify-center p-5 space-y-4 text-center bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-700 transition-all duration-300 mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex space-x-6">
          <Frown className="w-12 h-12 text-violet-500/70 dark:text-violet-400/70" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          No Topics Yet
        </h2>
        <p className="text-md text-gray-600 dark:text-gray-300 pb-5">
          There are currently no topics created for this level in the language you're trying to learn.
        </p>
      </motion.div>
    ) : (
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
                  {exercises.filter(e => e.progress >= progressThreshold).length}
                </span>
              </div>
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-emerald-700 dark:bg-emerald-800 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg">
                Completed Exercises
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform rotate-45 w-2 h-2 bg-emerald-700 dark:bg-emerald-800"></div>
              </div>
            </div>

            <div className="flex-grow"></div>

            <div className="relative group">
              <Tabs defaultValue="all" className="relative" onValueChange={(value) => setShowAll(value === 'all')}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <TabsTrigger
                    value="all"
                    className={cn(
                      "text-sm font-medium transition-all",
                      { "bg-blue-500 text-white": showAll, "text-gray-600 dark:text-gray-300": !showAll }
                    )}
                  >
                    <BookOpen className="w-5 h-5" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="threshold"
                    className={cn(
                      "text-sm font-medium transition-all",
                      { "bg-blue-500 text-white": !showAll, "text-gray-600 dark:text-gray-300": showAll }
                    )}
                  >
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                        <div style={{ position: 'relative' }}>
                          <Trophy className="w-5 h-5" />
                          <Slash className="w-5 h-5 absolute" style={{ left: 0, top: 0, transform: 'translateY(0%) rotate(90deg)' }} />
                        </div></TooltipTrigger>
                       <TooltipContent side="top" className="bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 text-xs rounded-lg py-2 px-3">
                         <div className="flex flex-col">
                         <span className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                             Hide scores above: <strong>{progressThreshold}</strong>
                           </span>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[progressThreshold]}
                            onValueChange={([value]) => {
                              console.log("Updating progressThreshold to:", value); // Add this line
                              setProgressThreshold(value);
                            }}
                            className="w-full"
                          />
                         </div>
                       </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>



        <div className="space-y-3">
          {exercises.filter(e => e.progress == 0 || e.progress == null || showAll || (!showAll && e.progress <= progressThreshold))
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
                          <div className="flex-1">
                            <h4 className={cn(
                              "font-medium transition-colors duration-300 mb-1",
                              selectedId === exercise.id
                                ? "text-violet-700 dark:text-violet-300"
                                : "text-gray-900 group-hover:text-violet-600 dark:text-gray-100 dark:group-hover:text-violet-300"
                            )}>
                              {exercise.topic}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 pr-6">{exercise.description}</p>

                            {exercise.progress !== undefined && exercise.progress > 0 && (
                              <div className="mt-3 space-y-1 relative bg-gray-200 rounded-lg p-1 ease-in-out">
                                <div className="h-3 rounded-lg bg-gray-300 flex items-center">
                                  <div className="h-full rounded-lg bg-gradient-to-r from-violet-400 to-violet-600 transition-all duration-300 ease-in-out" style={{ width: `${exercise.progress}%` }}>
                                    <div className="relative flex items-center justify-center h-full">
                                      <TooltipProvider>
                                        <Tooltip delayDuration={300}>
                                          <TooltipTrigger asChild>
                                            <div className="absolute" style={{
                                              right: exercise.progress === 100 ? '0' : 'auto',
                                              left: exercise.progress === 100 ? 'auto' : '100%',
                                              transform: exercise.progress === 100 ? 'none' : 'translateX(-50%)'
                                            }}>
                                              <div className="w-3 h-3 rounded-full bg-white border-2 border-violet-600 shadow-md">
                                              </div>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent side="right" className="bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 text-xs rounded-lg py-2 px-3">
                                            <div className="flex items-center gap-3">
                                              <div className="flex flex-col">
                                                <div className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-medium">Progress</div>
                                                <div className="text-gray-900 dark:text-gray-100 font-semibold">{exercise.progress.toFixed(0)}%</div>
                                              </div>
                                              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                                              <div className="flex flex-col">
                                                <div className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-medium">Attempts</div>
                                                <div className="text-gray-900 dark:text-gray-100 font-semibold">{exercise.attempts}</div>
                                              </div>
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                </div>
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
    )
  );
}

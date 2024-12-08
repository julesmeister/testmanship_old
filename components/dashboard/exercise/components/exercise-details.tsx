"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Star, 
  ArrowRight, 
  Trophy, 
  CheckCircle2, 
  Square, 
  ArrowRightLeft, 
  Table, 
  HelpCircle, 
  MessageSquare, 
  ListChecks, 
  ArrowLeftRight, 
  GripVertical, 
  SortAsc, 
  MoveHorizontal, 
  Users, 
  Scissors, 
  CheckSquare, 
  Blocks,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFetchExerciseContent } from '@/hooks/useFetchExerciseContent';

// Import exercise components
import FillInTheBlanks from './exercises/fill-in-the-blanks';
import Matching from './exercises/matching';
import ConjugationTables from './exercises/conjugation-tables';
import QuestionFormation from './exercises/question-formation';
import DialogueSorting from './exercises/dialogue-sorting';
import MultipleChoice from './exercises/multiple-choice';
import SentenceTransformation from './exercises/sentence-transformation';
import DragAndDrop from './exercises/drag-and-drop';
import GapFill from './exercises/gap-fill';
import WordSorting from './exercises/word-sorting';
import SentenceReordering from './exercises/sentence-reordering';
import RolePlaying from './exercises/role-playing';
import SentenceSplitting from './exercises/sentence-splitting';
import SentenceCorrection from './exercises/sentence-correction';
import WordBuilding from './exercises/word-building';
import EmptyExercise from './exercises/empty-exercise';
import { SupabaseClient } from '@supabase/supabase-js';

interface ExerciseDetailsProps {
  exerciseId: string;
  exercise?: {
    id: string;
    title: string;
    description: string;
    completed?: boolean;
    score?: number;
    exercise_types: string[];
    progress?: number;
    content: Array<any>;
  };
  exerciseData?: any; 
  onStart?: () => void;
  onContinue?: () => void;
  onComplete: (score: number, total: number) => void;
  supabase: SupabaseClient;
  setShowResults: (show: boolean) => void;
}

const getExerciseTypeIcon = (type: string) => {
  const iconClass = "w-4 h-4";
  switch (type.toLowerCase()) {
    case 'fill-in-the-blanks':
      return <Square className={iconClass} />;
    case 'matching':
      return <ArrowRightLeft className={iconClass} />;
    case 'conjugation-tables':
    case 'verb-conjugation-table':
      return <Table className={iconClass} />;
    case 'question-formation':
      return <HelpCircle className={iconClass} />;
    case 'dialogue-sorting':
      return <MessageSquare className={iconClass} />;
    case 'multiple-choice':
      return <ListChecks className={iconClass} />;
    case 'sentence-transformation':
      return <ArrowLeftRight className={iconClass} />;
    case 'drag-and-drop':
      return <GripVertical className={iconClass} />;
    case 'gap-fill':
      return <Square className={iconClass} />;
    case 'word-sorting':
      return <SortAsc className={iconClass} />;
    case 'sentence-reordering':
      return <MoveHorizontal className={iconClass} />;
    case 'role-playing':
      return <Users className={iconClass} />;
    case 'sentence-splitting':
      return <Scissors className={iconClass} />;
    case 'sentence-correction':
      return <CheckSquare className={iconClass} />;
    case 'word-building':
      return <Blocks className={iconClass} />;
    default:
      return <BookOpen className={iconClass} />;
  }
};

export default function ExerciseDetails({ 
  exerciseId, 
  exercise, 
  exerciseData, 
  onStart, 
  onContinue, 
  onComplete,
  supabase,
  setShowResults
}: ExerciseDetailsProps) {
  if (!exercise) return null;

  const [selectedType, setSelectedType] = useState<string>('');

  const { isLoading, exerciseContent, fetchContent } = useFetchExerciseContent();

  useEffect(() => {
    if (exercise?.id && selectedType) {
      fetchContent({
        supabase,
        exerciseId: exercise.id,
        exerciseType: selectedType
      });
      setShowResults(false);
    }
  }, [exercise?.id, selectedType, supabase]);

  // Memoize the filtered exercises and random index
  const filteredContent = useMemo(() => {
    if (exerciseContent.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * exerciseContent.length);
    return exerciseContent[randomIndex];
  }, [exerciseContent]);

  useEffect(() => {
    // Set the first type as default when exercise types change
    if (exercise?.exercise_types?.length > 0 && !selectedType) {
      setSelectedType(exercise.exercise_types[0]);
    }
  }, [exercise?.exercise_types]);

  const handleSubmit = (score: number, total: number) => {
    onComplete(score, total);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      

      <div className="space-y-3">
        <div className="flex flex-wrap gap-3 p-2 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
          {exercise?.exercise_types?.map((type, index) => (
            <motion.button
              key={index}
              onClick={() => {
                // Only allow changing to a different type, not deselecting
                if (type !== selectedType) {
                  setSelectedType(type);
                }
              }}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200",
                "rounded-lg backdrop-blur-sm",
                selectedType === type
                  ? "bg-white text-violet-600 shadow-lg shadow-violet-100/50 ring-1 ring-violet-100"
                  : "text-gray-600 hover:text-violet-600 hover:bg-white/80 hover:ring-1 hover:ring-violet-100/50"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 400 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-lg opacity-50",
                  selectedType === type && "bg-gradient-to-r from-violet-50/50 to-violet-100/30"
                )}
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
              {selectedType === type && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 bg-violet-50/30 rounded-lg animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/10 to-transparent rounded-lg animate-shimmer" 
                       style={{ backgroundSize: '200% 100%' }} />
                </motion.div>
              )}
              <span className="relative flex items-center gap-2">
                <motion.span
                  animate={selectedType === type ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 10, 0],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  {getExerciseTypeIcon(type.replace(/\s/g, "-"))}
                </motion.span>
                {type.replace(/-/g, " ").split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
              {selectedType === type && (
                <motion.div
                  className="absolute -right-1 -top-1 flex items-center justify-center w-4 h-4 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full ring-2 ring-white"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    boxShadow: [
                      "0 0 0 0 rgba(139, 92, 246, 0)",
                      "0 0 0 4px rgba(139, 92, 246, 0.3)",
                      "0 0 0 0 rgba(139, 92, 246, 0)"
                    ]
                  }}
                  transition={{ 
                    scale: { type: "spring", stiffness: 400, damping: 15 },
                    boxShadow: { duration: 1.5, repeat: Infinity }
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {selectedType && !isLoading && (
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Dynamic Exercise Component */}
              {(() => {
                if (filteredContent?.content == null || filteredContent.exercise_type !== selectedType) {
                  return <EmptyExercise exerciseType={selectedType} />;
                }

                const exerciseContentJson = {
                  ...filteredContent.content,
                  id: exercise.id,
                  onComplete: handleSubmit
                } as any;

                switch (selectedType.toLowerCase().replace(/\s+/g, '-')) {
                  case 'fill-in-the-blanks':
                    return <FillInTheBlanks exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'matching':
                    return <Matching exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'conjugation-tables':
                    return <ConjugationTables exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'question-formation':
                    return <QuestionFormation exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'dialogue-sorting':
                    return <DialogueSorting exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'multiple-choice':
                    return <MultipleChoice exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'sentence-transformation':
                    return <SentenceTransformation exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'drag-and-drop':
                    return <DragAndDrop exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'gap-fill':
                    return <GapFill exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'word-sorting':
                    return <WordSorting exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'sentence-reordering':
                    return <SentenceReordering exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'role-playing':
                    return <RolePlaying exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'sentence-splitting':
                    return <SentenceSplitting exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'sentence-correction':
                    return <SentenceCorrection exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  case 'word-building':
                    return <WordBuilding exercise={exerciseContentJson} onComplete={exerciseContentJson.onComplete} />;
                  default:
                    return <EmptyExercise exerciseType={selectedType} />;
                }
              })()}
            </div>
          </motion.div>
        )}
      </div>

    
    </motion.div>
  );
}

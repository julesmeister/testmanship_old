"use client";

import { useState } from 'react';
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
  Blocks 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ExerciseDetailsProps {
  exercise?: {
    id: string;
    title: string;
    description: string;
    completed?: boolean;
    score?: number;
    exercise_types: string[];
    progress?: number;
  };
  onStart?: () => void;
  onContinue?: () => void;
}

const getExerciseTypeIcon = (type: string) => {
  const iconClass = "w-4 h-4";
  switch (type.toLowerCase()) {
    case 'fill-in-the-blanks':
      return <Square className={iconClass} />;
    case 'matching':
      return <ArrowRightLeft className={iconClass} />;
    case 'conjugation tables':
    case 'verb conjugation table':
      return <Table className={iconClass} />;
    case 'question formation':
      return <HelpCircle className={iconClass} />;
    case 'dialogue completion':
      return <MessageSquare className={iconClass} />;
    case 'multiple-choice':
      return <ListChecks className={iconClass} />;
    case 'sentence transformation':
      return <ArrowLeftRight className={iconClass} />;
    case 'drag-and-drop':
      return <GripVertical className={iconClass} />;
    case 'gap-fill exercises':
      return <Square className={iconClass} />;
    case 'word sorting':
      return <SortAsc className={iconClass} />;
    case 'sentence reordering':
      return <MoveHorizontal className={iconClass} />;
    case 'role-playing':
      return <Users className={iconClass} />;
    case 'sentence splitting':
      return <Scissors className={iconClass} />;
    case 'sentence correction':
      return <CheckSquare className={iconClass} />;
    case 'word building':
      return <Blocks className={iconClass} />;
    default:
      return <BookOpen className={iconClass} />;
  }
};

export default function ExerciseDetails({ exercise, onStart, onContinue }: ExerciseDetailsProps) {
  if (!exercise) return null;

  const [selectedType, setSelectedType] = useState(exercise.exercise_types[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Exercise Types</h3>
        <div className="flex flex-wrap gap-3 p-2 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
          {exercise?.exercise_types?.map((type, index) => (
            <motion.button
              key={index}
              onClick={() => setSelectedType(type)}
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
                  {getExerciseTypeIcon(type)}
                </motion.span>
                {type.replace(/-/g, " ")}
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

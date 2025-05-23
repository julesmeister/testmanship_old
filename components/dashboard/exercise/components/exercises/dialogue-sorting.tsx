"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DialogueSortingProps } from '@/types/exercises';
import { AlertCircle, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import cn from 'classnames';

const speakerColors = {
  box: {
    1: 'bg-blue-500 text-white',
    2: 'bg-violet-500 text-white',
    3: 'bg-emerald-500 text-white',
    4: 'bg-amber-500 text-white',
    default: 'bg-gray-100 dark:bg-gray-800'
  },
  speaker: {
    1: 'text-blue-50',
    2: 'text-violet-50',
    3: 'text-emerald-50',
    4: 'text-amber-50',
    default: 'text-gray-600 dark:text-gray-300'
  },
  text: {
    1: 'text-white',
    2: 'text-white',
    3: 'text-white',
    4: 'text-white',
    default: 'text-gray-700 dark:text-gray-400'
  }
};

export default function DialogueSorting({ exercise, onComplete }: DialogueSortingProps) {
  // Store the original order
  const [originalLines] = useState([...exercise.dialogueLines].map((line, index) => ({
    ...line,
    correctPosition: index
  })));
  
  // Create randomized version for the exercise
  const [dialogueLines, setDialogueLines] = useState(() => 
    [...originalLines].sort(() => Math.random() - 0.5)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const speakerIndices = useMemo(() => {
    const speakers = new Set(exercise.dialogueLines.map(line => line.speaker));
    return Object.fromEntries([...speakers].map((speaker, index) => [speaker, (index + 1) > 4 ? 'default' : (index + 1).toString()]));
  }, [exercise.dialogueLines]);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (isSubmitted) return;
    const newLines = [...dialogueLines];
    const [movedItem] = newLines.splice(fromIndex, 1);
    newLines.splice(toIndex, 0, movedItem);
    setDialogueLines(newLines);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const correctCount = dialogueLines.reduce((count, line, index) => 
      line.correctPosition === index ? count + 1 : count, 0
    );
    const newScore = Math.round((correctCount / dialogueLines.length) * 100);
    setScore(newScore);
    onComplete(newScore, dialogueLines.length);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between gap-3">
        {exercise.context && (
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">{exercise.context}</p>
          </div>
        )}
        {!isSubmitted && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0"
          >
            <Button
              onClick={handleSubmit}
              className="px-6 font-medium transition-colors bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-500"
            >
              Check Order
            </Button>
          </motion.div>
        )}
      </div>

      <div className="w-full flex flex-col gap-3">
        {dialogueLines.map((line, index) => (
          <div key={index} className="group flex items-center gap-3">
            {!isSubmitted && (
              <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                <Button
                  onClick={() => moveItem(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 rounded-full transition-all hover:scale-110 
                    ${index === 0 ? 'opacity-0 !cursor-default' : 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'}`}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => moveItem(index, Math.min(dialogueLines.length - 1, index + 1))}
                  disabled={index === dialogueLines.length - 1}
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 rounded-full transition-all hover:scale-110
                    ${index === dialogueLines.length - 1 ? 'opacity-0 !cursor-default' : 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'}`}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div 
              className={`flex-grow transition-all ${
                isSubmitted
                  ? line.correctPosition === index
                    ? 'border-l-4 border-green-500 pl-3'
                    : 'border-l-4 border-red-500 pl-3'
                  : ''
              }`}
            >
              <div className="relative">
                {isSubmitted && line.correctPosition !== index && (
                  <div className="absolute -left-36 top-1/2 -translate-y-1/2 flex items-center">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
                      <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        Position {line.correctPosition + 1}
                      </span>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                )}
                <div className={cn(
                  "p-4 rounded-2xl",
                  speakerColors.box[speakerIndices[line.speaker] as keyof typeof speakerColors.box],
                  line.speaker === exercise.dialogueLines[0].speaker 
                    ? 'ml-auto rounded-br-sm max-w-[80%]' 
                    : 'mr-auto rounded-bl-sm max-w-[80%]'
                )}>
                  <div className="flex flex-col gap-1">
                    <span className={cn(
                      "text-sm font-medium",
                      speakerColors.speaker[speakerIndices[line.speaker] as keyof typeof speakerColors.speaker]
                    )}>
                      {line.speaker}
                    </span>
                    <span className={cn(
                      speakerColors.text[speakerIndices[line.speaker] as keyof typeof speakerColors.text]
                    )}>
                      {line.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

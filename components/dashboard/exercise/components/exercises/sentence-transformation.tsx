"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowLeftRight, HelpCircle, Quote, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SentenceTransformationProps } from '@/types/exercises';

export default function SentenceTransformation({ exercise, onComplete }: SentenceTransformationProps) {
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState<boolean[]>(new Array(exercise.sentences.length).fill(false));
  const [results, setResults] = useState<boolean[]>(new Array(exercise.sentences.length).fill(false));
  const [wordOrders, setWordOrders] = useState<string[][]>(
    exercise.sentences.map(sentence => sentence.transformation.split(' ').sort(() => Math.random() - 0.5))
  );

  const handleDragEnd = (result: any, index: number) => {
    if (!result.destination) return;

    const newWordOrders = [...wordOrders];
    const words = Array.from(newWordOrders[index]);
    const [reorderedWord] = words.splice(result.source.index, 1);
    words.splice(result.destination.index, 0, reorderedWord);
    newWordOrders[index] = words;
    setWordOrders(newWordOrders);
  };

  const toggleHint = (index: number) => {
    const newShowHints = [...showHints];
    newShowHints[index] = !newShowHints[index];
    setShowHints(newShowHints);
  };

  const checkAnswers = () => {
    const newResults = [...results];
    exercise.sentences.forEach((sentence, index) => {
      if (wordOrders[index].join(' ') === sentence.transformation) {
        newResults[index] = true;
      } else {
        newResults[index] = false;
      }
    });
    setResults(newResults);
    setShowResults(true);

    const score = Math.round((newResults.filter(r => r).length / exercise.sentences.length) * 100);
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-violet-600 dark:text-violet-400">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">{exercise.instruction}</p>
        </div>
        {!showResults && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={checkAnswers}
              className="px-6 font-medium transition-colors bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-500"
            >
              Check Answers
            </Button>
          </motion.div>
        )}
      </div>

      {exercise.sentences.map((sentence, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-4"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Quote className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-medium leading-relaxed">
                    {sentence.original}
                  </p>
                </div>
              </div>
              {sentence.hint && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleHint(index)}
                  className="text-gray-600 dark:text-violet-400"
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>
              )}
            </div>

            {showResults && (
              <div className="flex items-center gap-2 text-sm">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 rounded-md">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span className="font-medium">Correct answer:</span>
                  <span>{sentence.transformation}</span>
                </div>
              </div>
            )}

            <DragDropContext onDragEnd={(result) => handleDragEnd(result, index)}>
              <Droppable droppableId={`sentence-${index}`} direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex flex-wrap gap-2 p-2 min-h-[3rem] rounded-lg border-2 transition-colors",
                      results[index] && "border-green-500 bg-green-50 dark:bg-green-900/20",
                      !results[index] && showResults && "border-red-500 bg-red-50 dark:bg-red-900/20",
                      !showResults && "border-gray-200 dark:border-gray-700 hover:border-violet-500"
                    )}
                  >
                    {wordOrders[index].map((word, wordIndex) => (
                      <Draggable
                        key={word + wordIndex}
                        draggableId={word + wordIndex}
                        index={wordIndex}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              lineHeight: 1,
                              height: 'fit-content'
                            }}
                            className={cn(
                              "inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium leading-none transition-colors cursor-move",
                              !showResults && "bg-violet-100 dark:bg-violet-900/30 text-violet-900 dark:text-violet-100",
                              showResults && results[index] && "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100",
                              showResults && !results[index] && "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100"
                            )}
                          >
                            {word}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {showHints[index] && sentence.hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-sm text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 p-3 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>{sentence.hint}</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

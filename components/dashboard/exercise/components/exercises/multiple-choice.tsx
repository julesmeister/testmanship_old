"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MultipleChoiceProps } from '@/types/exercises';



export default function MultipleChoice({ exercise, onComplete }: MultipleChoiceProps) {
  const [answers, setAnswers] = useState<number[]>(new Array(exercise.questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correctAnswers = answers.reduce((count, answer, index) => {
      return answer === exercise.questions[index].correctAnswer ? count + 1 : count;
    }, 0);
    const score = Math.round((correctAnswers / exercise.questions.length) * 100);
    onComplete(score);
  };

  return (
    <div className="p-6 space-y-8">
      {exercise.questions.map((question, questionIndex) => (
        <motion.div
          key={questionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: questionIndex * 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-900 dark:text-violet-100 flex items-center justify-center text-sm font-medium">
              {questionIndex + 1}
            </span>
            <h3 className="text-gray-900 dark:text-gray-100 font-medium">{question.text}</h3>
          </div>

          <RadioGroup
            value={answers[questionIndex].toString()}
            onValueChange={(value) => handleAnswerChange(questionIndex, parseInt(value))}
            className="space-y-3"
          >
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={optionIndex.toString()}
                  id={`q${questionIndex}-o${optionIndex}`}
                  disabled={showResults}
                  className={cn(
                    showResults && (
                      optionIndex === question.correctAnswer
                        ? "border-green-500 text-green-500"
                        : answers[questionIndex] === optionIndex
                          ? "border-red-500 text-red-500"
                          : ""
                    )
                  )}
                />
                <Label
                  htmlFor={`q${questionIndex}-o${optionIndex}`}
                  className={cn(
                    "text-sm font-medium",
                    showResults && (
                      optionIndex === question.correctAnswer
                        ? "text-green-700 dark:text-green-300"
                        : answers[questionIndex] === optionIndex
                          ? "text-red-700 dark:text-red-300"
                          : "text-gray-700 dark:text-gray-300"
                    )
                  )}
                >
                  {option}
                </Label>
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-2"
                  >
                    {optionIndex === question.correctAnswer && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                    {answers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer && (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </RadioGroup>

          {showResults && question.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Explanation:</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{question.explanation}</p>
            </motion.div>
          )}
        </motion.div>
      ))}

      {!showResults && (
        <Button
          onClick={checkAnswers}
          className="w-full sm:w-auto"
          disabled={answers.some(answer => answer === -1)}
        >
          Check Answers
        </Button>
      )}

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Results:</h4>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Correct answers: {answers.reduce((count, answer, index) => 
              answer === exercise.questions[index].correctAnswer ? count + 1 : count, 0
            )} out of {exercise.questions.length}
          </div>
        </motion.div>
      )}
    </div>
  );
}

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';

interface FillInTheBlanksProps {
  exercise: {
    id: string;
    sentence: string;
    blanks: {
      word: string;
      position: number;
    }[];
  };
  onComplete: (score: number) => void;
}

export default function FillInTheBlanks({ exercise, onComplete }: FillInTheBlanksProps) {
  const [answers, setAnswers] = useState<string[]>(new Array(exercise.blanks.length).fill(''));
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correctAnswers = answers.reduce((count, answer, index) => {
      return answer.toLowerCase() === exercise.blanks[index].word.toLowerCase() ? count + 1 : count;
    }, 0);
    const score = Math.round((correctAnswers / exercise.blanks.length) * 100);
    onComplete(score);
  };

  const renderSentenceWithBlanks = () => {
    const words = exercise.sentence.split(' ');
    return words.map((word, index) => {
      const blank = exercise.blanks.find(b => b.position === index);
      if (blank) {
        const isCorrect = answers[exercise.blanks.indexOf(blank)]?.toLowerCase() === blank.word.toLowerCase();
        return (
          <span key={index} className="inline-block mx-1">
            <Input
              type="text"
              value={answers[exercise.blanks.indexOf(blank)] || ''}
              onChange={(e) => handleAnswerChange(exercise.blanks.indexOf(blank), e.target.value)}
              className={cn(
                "w-24 text-center",
                showResults && (
                  isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                    : "border-red-500 bg-red-50 dark:bg-red-950/50"
                )
              )}
              disabled={showResults}
            />
            {showResults && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "inline-flex items-center justify-center w-5 h-5 rounded-full ml-1",
                  isCorrect ? "bg-green-500" : "bg-red-500"
                )}
              >
                {isCorrect ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <X className="w-3 h-3 text-white" />
                )}
              </motion.span>
            )}
          </span>
        );
      }
      return <span key={index} className="mx-1">{word}</span>;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
        {renderSentenceWithBlanks()}
      </div>
      
      {!showResults && (
        <Button
          onClick={checkAnswers}
          className="w-full sm:w-auto"
          disabled={answers.some(answer => !answer)}
        >
          Check Answers
        </Button>
      )}

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Correct Answers:</h4>
            <div className="space-y-2">
              {exercise.blanks.map((blank, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Blank {index + 1}:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{blank.word}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

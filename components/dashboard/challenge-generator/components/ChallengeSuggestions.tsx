'use client';

import { Button } from '@/components/ui/button';
import { Check, Clock, Award, FileText, BrainCircuit } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Suggestion } from '@/types/challenge-generator';
import { formSchema } from '../schema';
import { toast } from 'sonner';

interface ChallengeSuggestionsProps {
  suggestions: Suggestion[];
  setSuggestions: (suggestions: Suggestion[]) => void;
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function ChallengeSuggestions({ suggestions, setSuggestions, form }: ChallengeSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
        AI-Generated Suggestions
      </h3>
      {suggestions.map((suggestion, index) => (
        <div 
          key={index} 
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition-all duration-200 hover:shadow-md hover:border-blue-500/50"
        >
          <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            {suggestion.title}
          </h4>
          <p className="text-base text-zinc-700 dark:text-zinc-300 mb-4 leading-relaxed">
            {suggestion.description}
          </p>
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-blue-500" />
              Key Learning Points
            </h5>
            <ul className="space-y-2">
              {suggestion.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                  <BrainCircuit className="mt-1 h-4 w-4 flex-shrink-0 text-blue-500" />
                  <span className="text-sm leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Clock className="h-4 w-4" />
              <span>{form.getValues('timeAllocation')} minutes</span>
              <Award className="h-4 w-4 ml-2" />
              <span>{form.getValues('difficulty')}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="transition-all duration-200 hover:border-blue-500 hover:text-blue-500"
              onClick={() => {
                const timeAllocation = form.getValues('timeAllocation');
                const formattedInstructions = `${suggestion.description}\n\nKey Points:\n${suggestion.keyPoints.map(point => `• ${point}`).join('\n')}\n• Time Allocation: ${timeAllocation} minutes`;
                form.setValue('title', suggestion.title);
                form.setValue('instructions', formattedInstructions);
                form.trigger('title');
                form.trigger('instructions');
                setSuggestions([]);
                toast.success('Challenge updated', {
                  description: 'Title and instructions have been added to the form.',
                });
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Use This Challenge
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

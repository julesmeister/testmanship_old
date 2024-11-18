'use client';

import { Button } from '@/components/ui/button';
import { Check, Clock, Award, FileText, BrainCircuit, GraduationCap, BookOpen, ListTodo } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Suggestion } from '@/types/challenge-generator';
import { formSchema } from '../schema';
import { toast } from 'sonner';
import { Icon } from '@/components/ui/icon';

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
            <Icon icon={FileText} size="md" className="text-blue-500" />
            {suggestion.title}
          </h4>
          <p className="text-base text-zinc-700 dark:text-zinc-300 mb-4 leading-relaxed">
            {suggestion.description}
          </p>
          <div className="grid gap-6 mb-4">
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Icon icon={BrainCircuit} size="sm" className="text-blue-500" />
                Key Learning Points
              </h5>
              <ul className="space-y-2">
                {suggestion.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                    <Icon icon={ListTodo} size="sm" className="mt-1 flex-shrink-0 text-blue-500" />
                    <span className="text-sm leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {suggestion.grammarFocus && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Icon icon={GraduationCap} size="sm" className="text-blue-500" />
                  Grammar Focus
                </h5>
                <ul className="space-y-2">
                  {suggestion.grammarFocus.map((grammar, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                      <Icon icon={BrainCircuit} size="sm" className="mt-1 flex-shrink-0 text-blue-500" />
                      <span className="text-sm leading-relaxed">{grammar}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestion.vocabularyThemes && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Icon icon={BookOpen} size="sm" className="text-blue-500" />
                  Vocabulary Themes
                </h5>
                <ul className="space-y-2">
                  {suggestion.vocabularyThemes.map((theme, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                      <Icon icon={BrainCircuit} size="sm" className="mt-1 flex-shrink-0 text-blue-500" />
                      <span className="text-sm leading-relaxed">{theme}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Icon icon={Clock} size="sm" />
                <span>{form.getValues('timeAllocation')} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon={Award} size="sm" />
                <span>{form.getValues('difficulty')}</span>
              </div>
              {suggestion.wordCount && (
                <div className="flex items-center gap-2">
                  <Icon icon={FileText} size="sm" />
                  <span>{suggestion.wordCount} words minimum</span>
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="transition-all duration-200 hover:border-blue-500 hover:text-blue-500"
              onClick={() => {
                const timeAllocation = form.getValues('timeAllocation');
                const formattedInstructions = `${suggestion.description}

Key Points:
${suggestion.keyPoints.map(point => `• ${point}`).join('\n')}

Time Allocation: ${timeAllocation} minutes
Word Count: ${suggestion.wordCount} words minimum`;

                form.setValue('title', suggestion.title);
                form.setValue('instructions', formattedInstructions);
                form.setValue('wordCount', suggestion.wordCount);
                if (suggestion.grammarFocus) {
                  form.setValue('grammarFocus', suggestion.grammarFocus);
                }
                if (suggestion.vocabularyThemes) {
                  form.setValue('vocabularyThemes', suggestion.vocabularyThemes);
                }
                form.trigger('title');
                form.trigger('instructions');
                form.trigger('wordCount');
                form.trigger('grammarFocus');
                form.trigger('vocabularyThemes');
                setSuggestions([]);
                toast.success('Challenge updated', {
                  description: 'Challenge details have been added to the form.',
                });
              }}
            >
              <Icon icon={Check} size="sm" className="mr-2" />
              Use This Challenge
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

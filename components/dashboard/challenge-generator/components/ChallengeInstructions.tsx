'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PenTool, BrainCircuit, List, Clock, Loader2, Sparkles } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '../schema';
import { TagInput } from '@/components/ui/tag-input';
import { Slider } from '@/components/ui/slider';
import React from 'react';

interface ChallengeInstructionsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  isGeneratingInstructions: boolean;
  isSaving: boolean;
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  handleGenerateInstructions: (title: string) => Promise<void>;
}

export function ChallengeInstructions({
  form,
  isGeneratingInstructions,
  isSaving,
  onSubmit,
  handleGenerateInstructions
}: ChallengeInstructionsProps) {

  // Initialize the array fields if they don't exist
  React.useEffect(() => {
    const currentValues = form.getValues();
    if (!currentValues.grammarFocus) {
      form.setValue('grammarFocus', []);
    }
    if (!currentValues.vocabularyThemes) {
      form.setValue('vocabularyThemes', []);
    }
  }, [form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
          <PenTool className="h-5 w-5" />
          Challenge Instructions
        </CardTitle>
        <CardDescription className="space-y-2">
          <p>Create clear and engaging instructions for your challenge:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <BrainCircuit className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
              <span>Use AI-generated suggestions as inspiration</span>
            </li>
            <li className="flex items-start gap-2">
              <List className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
              <span>Include specific requirements or constraints</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
              <span>Consider the allocated time frame</span>
            </li>
          </ul>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-zinc-900 dark:text-white">
                      Challenge Title
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2 relative group">
                        <Input 
                          placeholder="e.g., Describing Your Dream Vacation" 
                          {...field}
                          className="bg-white dark:bg-zinc-900 h-11 text-base transition-shadow duration-200 focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('title');
                          }}
                        />
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="flex-shrink-0 h-11 w-11 transition-all duration-200 enabled:hover:border-blue-500 enabled:hover:text-blue-500 enabled:group-hover:border-blue-500"
                                disabled={!field.value || !form.getValues('format') || isGeneratingInstructions}
                                onClick={() => handleGenerateInstructions(field.value)}
                              >
                                {isGeneratingInstructions ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Sparkles className="h-5 w-5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="right"
                              className="bg-zinc-900 text-white border-zinc-800"
                              sideOffset={5}
                            >
                              <p className="text-sm font-medium">Generate Instructions</p>
                              <p className="text-xs text-zinc-400 mt-1">AI will create instructions based on your title</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                      A clear, concise title that describes the writing task.
                    </FormDescription>
                    <FormMessage className="text-sm font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-zinc-900 dark:text-white">
                      Instructions
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide clear instructions for the writing challenge..."
                        className="min-h-[200px] resize-none bg-white dark:bg-zinc-900 text-base leading-relaxed transition-shadow duration-200 focus:ring-2 focus:ring-blue-500"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          form.trigger('instructions');
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                      Write detailed instructions that guide the student through the writing task.
                    </FormDescription>
                    <FormMessage className="text-sm font-medium" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="grammarFocus"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-base font-semibold text-zinc-900 dark:text-white">
                      Grammar Focus
                    </FormLabel>
                    <FormControl>
                      <TagInput
                        placeholder="Add grammar points and press Enter"
                        tags={field.value}
                        className="border-0 shadow-none bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-500"
                        onTagsChange={(tags) => field.onChange(tags)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-zinc-600 dark:text-zinc-400">
                      Add specific grammar points to focus on.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vocabularyThemes"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-base font-semibold text-zinc-900 dark:text-white">
                      Vocabulary Themes
                    </FormLabel>
                    <FormControl>
                      <TagInput
                        placeholder="Add vocabulary themes and press Enter"
                        tags={field.value}
                        className="border-0 shadow-none bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-500"
                        onTagsChange={(tags) => field.onChange(tags)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-zinc-600 dark:text-zinc-400">
                      Add vocabulary themes for the writing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="wordCount"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-semibold text-zinc-900 dark:text-white">
                        Minimum Word Count
                      </FormLabel>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {value} words
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        min={50}
                        max={500}
                        step={25}
                        value={[value]}
                        onValueChange={(values) => onChange(values[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-zinc-600 dark:text-zinc-400">
                      Set the minimum number of words required for this challenge.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button 
                type="submit" 
                variant="emerald"
                className="w-full h-11 text-base font-medium" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving Challenge...
                  </>
                ) : (
                  <>
                    Save Challenge
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

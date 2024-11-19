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
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [suggestions, setSuggestions] = useState<null | { vocabulary_themes?: string[], grammar_focus?: string[], title?: string, instructions?: string }>(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Check if either vocabulary themes or grammar focus is empty
      if (!data.vocabularyThemes?.length || !data.grammarFocus?.length) {
        const missingFields: string[] = [];
        if (!data.vocabularyThemes?.length) missingFields.push("vocabulary themes");
        if (!data.grammarFocus?.length) missingFields.push("grammar focus");
        
        toast.error("Missing Important Details", {
          description: (
            <div className="mt-2 flex flex-col space-y-2">
              <p>The following fields are empty:</p>
              <p className="font-medium">{missingFields.join(" and ")}</p>
              <div className="mt-2">
                <Button
                  variant="outline"
                  disabled={isLoadingAI}
                  onClick={async () => {
                    try {
                      setIsLoadingAI(true);
                      const formValues = form.getValues();
                      console.log('Current form values:', formValues);
                      

                      // Validate required fields for API request
                      if (!formValues.difficulty) {
                        toast.error("Please select a difficulty level first");
                        return;
                      }

                      // Prepare API request payload
                      const payload = {
                        difficulty: formValues.difficulty,
                        format: formValues.format,
                        timeAllocation: formValues.timeAllocation || 30,
                        topics: formValues.vocabularyThemes || []
                      };
                      

                      console.log('Sending API request with payload:', payload);

                      const response = await fetch("/api/challenge-suggestions", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                      });
                      

                      if (!response.ok) {
                        const errorText = await response.text();
                        console.error('API Error:', {
                          status: response.status,
                          statusText: response.statusText,
                          body: errorText
                        });
                        throw new Error(`API Error: ${response.status} ${response.statusText}`);
                      }

                      const result = await response.json();
                      console.log('Raw API Response:', result);
                      

                      if (!result || !result.suggestions) {
                        throw new Error('Invalid API response: missing suggestions');
                      }

                      const suggestions = result.suggestions;
                      if (!Array.isArray(suggestions) || suggestions.length === 0) {
                        throw new Error('No suggestions returned from API');
                      }

                      // Get the first suggestion
                      const suggestion = suggestions[0];
                      console.log('Selected suggestion:', suggestion);
                      

                      // Validate suggestion structure
                      if (!suggestion.grammarFocus || !suggestion.vocabularyThemes) {
                        throw new Error('Suggestion missing required fields');
                      }

                      // Map the fields from the suggestion to the form fields
                      const updates: Partial<typeof formValues> = {};
                      

                      if (!formValues.grammarFocus?.length && Array.isArray(suggestion.grammarFocus)) {
                        updates.grammarFocus = suggestion.grammarFocus;
                        console.log('Will update grammar focus to:', updates.grammarFocus);
                      }
                      

                      if (!formValues.vocabularyThemes?.length && Array.isArray(suggestion.vocabularyThemes)) {
                        updates.vocabularyThemes = suggestion.vocabularyThemes;
                        console.log('Will update vocabulary themes to:', updates.vocabularyThemes);
                      }

                      if (Object.keys(updates).length === 0) {
                        toast.info('No empty fields to update');
                        return;
                      }

                      // Apply all updates at once
                      Object.entries(updates).forEach(([field, value]) => {
                        console.log(`Setting form field "${field}" to:`, value);
                        form.setValue(field as any, value);
                      });

                      // Store suggestions for preview
                      setSuggestions({
                        vocabulary_themes: updates.vocabularyThemes,
                        grammar_focus: updates.grammarFocus
                      });
                      

                      setShowPreview(true);
                      toast.success("AI suggestions have been applied to your form.");
                    } catch (error) {
                      console.error('Error processing suggestions:', error);
                      toast.error(error instanceof Error ? error.message : 'Failed to process suggestions');
                    } finally {
                      setIsLoadingAI(false);
                    }
                  }}
                >
                  {isLoadingAI ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting AI suggestions...
                    </>
                  ) : (
                    "Let AI help fill these in"
                  )}
                </Button>
              </div>
            </div>
          ),
          duration: 10000,
        });
        return; // Stop form submission
      }

      // Continue with normal form submission if all fields are filled
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  };

  return (
    <>
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
                <span>Use AI-generated suggestions to craft engaging and level-appropriate writing prompts</span>
              </li>
              <li className="flex items-start gap-2">
                <List className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                <span>Include specific requirements that align with the student's learning goals and proficiency level</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                <span>Set an appropriate time limit that allows students to complete the task effectively</span>
              </li>
            </ul>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Suggestions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {suggestions?.vocabulary_themes && (
              <div className="space-y-2">
                <h4 className="font-medium">Added Vocabulary Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.vocabulary_themes.map((theme, i) => (
                    <div
                      key={i}
                      className="rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 text-sm"
                    >
                      {theme}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {suggestions?.grammar_focus && (
              <div className="space-y-2">
                <h4 className="font-medium">Added Grammar Focus</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.grammar_focus.map((focus, i) => (
                    <div
                      key={i}
                      className="rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 text-sm"
                    >
                      {focus}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {suggestions?.title && (
              <div className="space-y-2">
                <h4 className="font-medium">Added Title</h4>
                <div className="text-sm">{suggestions.title}</div>
              </div>
            )}
            {suggestions?.instructions && (
              <div className="space-y-2">
                <h4 className="font-medium">Added Instructions</h4>
                <div className="text-sm">{suggestions.instructions}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowPreview(false);
                setSuggestions(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

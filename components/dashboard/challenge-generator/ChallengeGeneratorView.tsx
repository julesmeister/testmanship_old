'use client';

import { useEffect, useRef } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { BookOpen, PenTool, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChallengeGeneratorViewProps } from '@/types/challenge-generator';
import { useInstructionGenerator } from '@/hooks/useInstructionGenerator';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useChallengeFormats } from '@/hooks/useChallengeFormats';
import { useChallengeSuggestions } from '@/hooks/useChallengeSuggestions';
import { useChallengeSubmission } from '@/hooks/useChallengeSubmission';
import { formSchema } from './schema';
import { ChallengeSettings } from './components/ChallengeSettings';
import { ChallengeInstructions } from './components/ChallengeInstructions';
import { ChallengeSuggestions } from './components/ChallengeSuggestions';
import { GuideContent } from './components/GuideContent';
import { z } from 'zod';
import { Button } from '@/components/ui/button';

type FormValues = z.infer<typeof formSchema>;

export default function ChallengeGeneratorView({ user, userDetails }: ChallengeGeneratorViewProps) {
  const { supabase } = useSupabase();
  const typedSupabase = supabase as SupabaseClient;
  const router = useRouter();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      instructions: '',
      format: '',
      difficulty: 'A1',
      timeAllocation: 30,
      wordCount: 150,
      grammarFocus: [],
      vocabularyThemes: []
    }
  });

  // Use custom hooks
  useAuthCheck({ user, userDetails, supabase });
  const { formats, groupedFormats, loadFormats } = useChallengeFormats(typedSupabase);
  const { suggestions, setSuggestions, isGenerating, generateSuggestions, resetUsedTitles } = useChallengeSuggestions(
    form.getValues,
    formats
  );
  const { isSaving, submitChallenge } = useChallengeSubmission(typedSupabase);
  const { isGenerating: isGeneratingInstructions, generateInstructions } = useInstructionGenerator();

  // Reset used titles when difficulty or format changes
  useEffect(() => {
    resetUsedTitles();
  }, [form.watch('difficulty'), form.watch('format')]);

  // Update formats when difficulty changes
  useEffect(() => {
    const difficulty = form.watch('difficulty');
    if (difficulty) {
      loadFormats(difficulty);
    }
  }, [form.watch('difficulty')]);

  const handleGenerateInstructions = async (title: string) => {
    const difficulty = form.getValues('difficulty');
    const formatId = form.getValues('format');
    const format = formats.find(f => f.id === formatId);
    const timeAllocation = form.getValues('timeAllocation');

    if (!formatId) {
      toast.error('Please select a format');
      return;
    }

    if (!format) {
      toast.error(`Format not found (ID: ${formatId})`);
      return;
    }

    const instructions = await generateInstructions({
      title,
      difficulty,
      format,
      timeAllocation,
    });

    if (instructions) {
      form.setValue('instructions', instructions);
      form.trigger('instructions');
    }
  };

  const handleSubmit = async (values: FormValues) => {
    const success = await submitChallenge({
      title: values.title,
      instructions: values.instructions,
      difficulty: values.difficulty,
      formatId: values.format,
      timeAllocation: values.timeAllocation,
      wordCount: values.wordCount,
      grammarFocus: values.grammarFocus,
      vocabularyThemes: values.vocabularyThemes
    });

    if (success) {
      form.reset();
      setSuggestions([]);
    }
  };

  const scrollToSuggestions = () => {
    suggestionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Challenge Generator"
      description="Create writing challenges based on difficulty levels"
    >
      <div className="min-h-screen w-full">
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="generator" className="w-full">Generator</TabsTrigger>
            <TabsTrigger value="guide" className="w-full">Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6 w-full">
            <div className="w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Challenge Generator</h2>
                  <p className="text-muted-foreground">Create and customize writing challenges for different proficiency levels.</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <ChallengeSettings
                  form={form}
                  formats={formats}
                  groupedFormats={groupedFormats}
                  loadFormats={loadFormats}
                  isGenerating={isGenerating}
                  generateSuggestions={generateSuggestions}
                />

                <div className="space-y-6">
                  <ChallengeInstructions
                    form={form}
                    isGeneratingInstructions={isGeneratingInstructions}
                    isSaving={isSaving}
                    onSubmit={handleSubmit}
                    handleGenerateInstructions={handleGenerateInstructions}
                  />

                  {suggestions.length > 0 && (
                    <div
                      className="fixed bottom-8 right-8 z-50"
                      onClick={scrollToSuggestions}
                    >
                      <Button
                        type="button"
                        size="icon"
                        variant="default"
                        className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <ArrowDown className="h-5 w-5" />
                      </Button>
                    </div>
                  )}

                  <div ref={suggestionsRef}>
                    <ChallengeSuggestions
                      suggestions={suggestions}
                      setSuggestions={setSuggestions}
                      form={form}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guide" className="space-y-6">
            <GuideContent />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

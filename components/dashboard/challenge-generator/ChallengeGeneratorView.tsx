'use client';

import { useEffect } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { BookOpen, PenTool } from 'lucide-react';
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

type FormValues = z.infer<typeof formSchema>;

export default function ChallengeGeneratorView({ user, userDetails }: ChallengeGeneratorViewProps) {
  const { supabase } = useSupabase();
  const typedSupabase = supabase as SupabaseClient;
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      instructions: '',
      format: '',
      difficulty: '',
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

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Challenge Generator"
      description="Create writing challenges based on difficulty levels"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Challenge Generator</h2>
            <p className="text-muted-foreground">Create and customize writing challenges for different proficiency levels.</p>
          </div>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="create" 
              className="flex items-center gap-2 data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300"
            >
              <PenTool className="h-4 w-4" />
              Create Challenge
            </TabsTrigger>
            <TabsTrigger 
              value="guide" 
              className="flex items-center gap-2 data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300"
            >
              <BookOpen className="h-4 w-4" />
              Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
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

                <ChallengeSuggestions
                  suggestions={suggestions}
                  setSuggestions={setSuggestions}
                  form={form}
                />
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

/**
 * ⚠️ DOCUMENTATION NOTICE
 * Before making any changes to this file, please review the DOCUMENTATION.md in this directory.
 * After making changes, update the DOCUMENTATION.md file accordingly.
 * This helps maintain accurate and up-to-date documentation of the challenge generator system.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { ArrowDown } from 'lucide-react';
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
import { Challenge } from '@/types/challenge';

type FormValues = z.infer<typeof formSchema>;

interface ChallengeGeneratorProps extends ChallengeGeneratorViewProps {
  challengeToEdit?: Challenge;
}

export const ChallengeGeneratorView = ({ 
  user, 
  userDetails, 
  challengeToEdit
}: ChallengeGeneratorProps) => {
  const { supabase } = useSupabase();
  const typedSupabase = supabase as SupabaseClient;
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isEditMode = !!challengeToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: challengeToEdit?.title || '',
      instructions: challengeToEdit?.instructions || '',
      format: challengeToEdit?.format_id || '',
      difficulty: (challengeToEdit?.difficulty_level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2') || 'A1',
      timeAllocation: challengeToEdit?.time_allocation || 30,
      wordCount: challengeToEdit?.word_count || 150,
      grammarFocus: challengeToEdit?.grammar_focus || [],
      vocabularyThemes: challengeToEdit?.vocabulary_themes || []
    }
  });

  // Use custom hooks
  useAuthCheck({ user, userDetails, supabase });
  const { formats, groupedFormats, loadFormats } = useChallengeFormats(typedSupabase);
  const { suggestions, setSuggestions, isGenerating: isGeneratingSuggestions, generateSuggestions } = useChallengeSuggestions(
    form.getValues,
    formats
  );
  const { isGenerating: isGeneratingInstructions, generateInstructions } = useInstructionGenerator();
  const { isSaving, submitChallenge } = useChallengeSubmission();

  // Reset used titles when difficulty or format changes
  useEffect(() => {
    // Removed resetUsedTitles() call
  }, [form.watch('difficulty'), form.watch('format')]);

  // Update formats when difficulty changes
  useEffect(() => {
    const difficulty = form.watch('difficulty');
    if (difficulty) {
      loadFormats(difficulty);
    }
  }, [form.watch('difficulty'), loadFormats]);

  const handleGenerateInstructions = async (title: string) => {
    const difficulty = form.getValues('difficulty');
    const formatId = form.getValues('format');

    if (!formatId) {
      toast.error('Please select a format');
      return;
    }

    if (!formats || formats.length === 0) {
      await loadFormats(difficulty);
    }

    const format = formats.find(f => f.id === formatId);
    const timeAllocation = form.getValues('timeAllocation');

    if (!format) {
      toast.error('Format not found. Please try selecting the format again.');
      return;
    }

    const instructions = await generateInstructions({
      title,
      difficulty,
      format,
      timeAllocation
    });

    if (instructions) {
      form.setValue('instructions', instructions);
      form.trigger('instructions');
    }
  };

  const onSubmit = async (data: FormValues) => {
    const { success } = await submitChallenge({
      supabase: typedSupabase,
      data: {
        ...data,
        creator_id: user?.id,
        difficulty_level: data.difficulty,
        time_allocation: data.timeAllocation,
        word_count: data.wordCount,
        grammar_focus: data.grammarFocus,
        vocabulary_themes: data.vocabularyThemes,
        format_id: data.format
      },
      isEditMode,
      challengeId: challengeToEdit?.id
    });

    if (success) {
      toast.success(isEditMode ? 'Challenge updated successfully!' : 'Challenge created successfully!');
      router.push('/dashboard/challenges');
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

          <TabsContent value="generator" className="w-full">
            <div className="flex flex-col w-full space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{isEditMode ? 'Edit Challenge' : 'Challenge Generator'}</h2>
                  <p className="text-muted-foreground">Create and customize writing challenges for different proficiency levels.</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 w-full">
                <div className="w-full">
                  <ChallengeSettings
                    form={form}
                    formats={formats}
                    groupedFormats={groupedFormats}
                    loadFormats={loadFormats}
                    isGenerating={isGeneratingSuggestions}
                    generateSuggestions={generateSuggestions}
                  />
                </div>

                <div className="w-full space-y-6">
                  <ChallengeInstructions
                    form={form}
                    isGeneratingInstructions={isGeneratingInstructions}
                    isSaving={isSaving}
                    onSubmit={onSubmit}
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

                  <div ref={suggestionsRef} className="w-full">
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
};

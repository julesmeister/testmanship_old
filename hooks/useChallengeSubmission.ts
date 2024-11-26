import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useLanguageStore } from '@/stores/language';
import { getLanguageName } from '@/types/language';

interface SubmitChallengeParams {
  supabase: SupabaseClient;
  data: {
    title: string;
    instructions: string;
    creator_id: string;
    difficulty_level: string;
    time_allocation: number;
    word_count: number;
    grammar_focus: string[];
    vocabulary_themes: string[];
    checklist: string[];
    [key: string]: any;
  };
  isEditMode?: boolean;
  challengeId?: string;
}

export const useChallengeSubmission = () => {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { languages, selectedLanguageId } = useLanguageStore();

  const submitChallenge = async ({ supabase, data, isEditMode, challengeId }: SubmitChallengeParams) => {
    setIsSaving(true);
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const selectedLanguage = languages.find(lang => lang.id === selectedLanguageId);

      if (!session?.user) {
        toast.error('Please sign in to save challenges', {
          id: 'saving-challenge',
        });
        router.push('/signin');
        return { success: false };
      }

      if (isEditMode && challengeId) {
        const { error } = await supabase
          .from('challenges')
          .update({
            title: data.title,
            instructions: data.instructions,
            difficulty_level: data.difficulty_level,
            time_allocation: data.time_allocation,
            word_count: data.word_count,
            grammar_focus: data.grammar_focus,
            vocabulary_themes: data.vocabulary_themes,
            updated_at: new Date().toISOString(),
            checklist: data.checklist,
            lang: getLanguageName(selectedLanguage?.code?.toUpperCase() || 'EN')
          })
          .eq('id', challengeId);

        if (error) throw error;
      } else {
        const challengeData = {
          title: data.title,
          instructions: data.instructions,
          difficulty_level: data.difficulty_level,
          format_id: data.format_id,
          created_by: session.user.id,
          time_allocation: data.time_allocation,
          word_count: data.word_count,
          grammar_focus: data.grammar_focus,
          vocabulary_themes: data.vocabulary_themes,
          checklist: data.checklist,
          lang: getLanguageName(selectedLanguage?.code?.toUpperCase() || 'EN')
        };

        const { error } = await supabase
          .from('challenges')
          .insert([{
            ...challengeData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      toast.success('Challenge saved successfully!', {
        id: 'saving-challenge',
      });

      return { success: true };
    } catch (error) {
      console.error('Save process error:', error);
      toast.error('Failed to save challenge', {
        id: 'saving-challenge',
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    submitChallenge,
    isSaving
  };
};

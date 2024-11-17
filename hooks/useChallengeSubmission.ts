import { useState } from 'react';
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface SubmitChallengeParams {
  title: string;
  instructions: string;
  difficulty: string;
  formatId: string;
  timeAllocation: number;
}

export function useChallengeSubmission(supabase: SupabaseClient) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const submitChallenge = async (data: SubmitChallengeParams) => {
    console.log('Starting save process...');
    try {
      setIsSaving(true);
      toast.loading('Saving challenge...', {
        id: 'saving-challenge',
      });

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Please sign in to save challenges', {
          id: 'saving-challenge',
        });
        router.push('/signin');
        return false;
      }

      // Validate required fields
      console.log('Validating form data:', data);
      if (!data.title || !data.instructions || !data.difficulty || !data.formatId) {
        throw new Error('Please fill in all required fields');
      }

      const challengeData = {
        title: data.title,
        instructions: data.instructions,
        difficulty_level: data.difficulty,
        format_id: data.formatId,
        created_by: session.user.id,
        time_allocation: data.timeAllocation
      };

      // Log the data being saved
      console.log('Attempting to save challenge to Supabase:', challengeData);

      const { data: savedData, error } = await supabase
        .from('challenges')
        .insert(challengeData)
        .select()
        .single();

      console.log('Supabase response:', { savedData, error });

      if (error) {
        console.error('Error saving challenge:', error);
        throw new Error(`Failed to save challenge: ${error.message}`);
      }

      if (!savedData) {
        throw new Error('No data returned from save operation');
      }

      toast.success('Challenge saved successfully!', {
        id: 'saving-challenge',
      });

      return true;
    } catch (error) {
      console.error('Save process error:', error);
      toast.error('Failed to save challenge', {
        id: 'saving-challenge',
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    submitChallenge
  };
}

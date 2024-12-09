import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { calculateStreak } from '@/utils/helpers';
import { challengeAttemptsCache } from '@/lib/db/challenge-attempts-cache';

interface EvaluationSubmissionParams {
  supabase: SupabaseClient;
  data: {
    challengeId: string;
    content: string;
    timeSpent: number;
    evaluation: {
      metrics: {
        grammar: number;
        vocabulary: number;
        fluency: number;
        overall: number;
      };
      skills: {
        writingComplexity: number;
        accuracy: number;
        coherence: number;
        style: number;
      };
      improvedEssay: string;
    };
    performanceMetrics: {
      wordCount: number;
      paragraphCount: number;
    };
    insights: {
      insights: {
        strengths: string[];
        weaknesses: string[];
      };
    };
    difficulty_level: string;
  };
}

export const useEvaluationSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEvaluation = async ({ supabase, data }: EvaluationSubmissionParams) => {
    setIsSubmitting(true);
    try {
      console.log('Starting evaluation submission with data:', JSON.stringify(data, null, 2));
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }
      
      if (!session?.user) {
        console.error('No user session found');
        toast.error('Please sign in to save evaluation', {
          id: 'saving-evaluation',
        });
        return { success: false };
      }

      console.log('Creating challenge attempt record...');

      // First check if the table exists and has the correct structure
      const { data: tableInfo, error: tableError } = await supabase
        .from('challenge_attempts')
        .select('*')
        .limit(1);

      if (tableError) {
        console.error('Error checking challenge_attempts table:', tableError);
        throw new Error('Database table access error: ' + tableError.message);
      }

      // Create the challenge attempt record
      const attemptData = {
        user_id: session.user.id,
        challenge_id: data.challengeId,
        content: data.content,
        word_count: data.performanceMetrics.wordCount,
        paragraph_count: data.performanceMetrics.paragraphCount,
        time_spent: data.timeSpent,
        performance_score: data.evaluation.metrics.overall,
        feedback: data.evaluation.improvedEssay,
        difficulty_level: data.difficulty_level
      };

      console.log('Attempting to insert record with data:', attemptData);

      const { data: attemptRecord, error: attemptError } = await supabase
        .from('challenge_attempts')
        .insert([attemptData])
        .select()
        .single();

      if (attemptError) {
        console.error('Challenge attempt error:', attemptError);
        throw new Error(`Failed to create challenge attempt: ${attemptError.message}`);
      }

      if (!attemptRecord) {
        console.error('No attempt record created');
        throw new Error('Failed to create attempt record - no data returned');
      }

      console.log('Challenge attempt created successfully:', attemptRecord);

      // 2. Store performance metrics (all metrics in one row)
      const metricsData = {
        grammar: parseFloat(data.evaluation.metrics.grammar.toString()),
        vocabulary: parseFloat(data.evaluation.metrics.vocabulary.toString()),
        fluency: parseFloat(data.evaluation.metrics.fluency.toString()),
        overall: parseFloat(data.evaluation.metrics.overall.toString()),
        writing_complexity: parseFloat(data.evaluation.skills.writingComplexity.toString()),
        accuracy: parseFloat(data.evaluation.skills.accuracy.toString()),
        coherence: parseFloat(data.evaluation.skills.coherence.toString()),
        style: parseFloat(data.evaluation.skills.style.toString())
      };


      // 3. Update user progress with insights and metrics
      // First, get the current progress
      const { data: currentProgress, error: progressFetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (progressFetchError && progressFetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error fetching current progress:', progressFetchError);
        throw new Error(`Failed to fetch current progress: ${progressFetchError.message}`);
      }

      // Combine current skills with new insights
      const currentStrengths = new Set(currentProgress?.strongest_skills || []);
      const currentWeaknesses = new Set(currentProgress?.weakest_skills || []);
      
      // Add new insights
      data.insights?.insights?.strengths?.forEach(skill => currentStrengths.add(skill));
      data.insights?.insights?.weaknesses?.forEach(skill => currentWeaknesses.add(skill));

      // Calculate streaks
      const { updated_streak, updated_longest_streak } = calculateStreak(currentProgress);
      
      const userProgressUpdate = {
        user_id: session.user.id,
        strongest_skills: Array.from(currentStrengths),
        weakest_skills: Array.from(currentWeaknesses),
        last_active_level: data.difficulty_level,
        average_performance: currentProgress 
          ? ((currentProgress.average_performance || 0) * (currentProgress.total_challenges_completed || 0) + metricsData.overall) / ((currentProgress.total_challenges_completed || 0) + 1)
          : metricsData.overall,
        total_challenges_completed: (currentProgress?.total_challenges_completed || 0) + 1,
        total_words_written: (currentProgress?.total_words_written || 0) + data.performanceMetrics.wordCount,
        total_time_spent: (currentProgress?.total_time_spent || 0) + data.timeSpent,
        updated_at: new Date().toISOString(),
        current_streak: updated_streak,
        longest_streak: updated_longest_streak
      };

      console.log('Updating user progress:', {
        current: currentProgress,
        update: userProgressUpdate,
        changes: {
          challenges: `${currentProgress?.total_challenges_completed || 0} -> ${userProgressUpdate.total_challenges_completed}`,
          words: `${currentProgress?.total_words_written || 0} -> ${userProgressUpdate.total_words_written}`,
          time: `${currentProgress?.total_time_spent || 0} -> ${userProgressUpdate.total_time_spent}`,
          performance: `${currentProgress?.average_performance || 0} -> ${userProgressUpdate.average_performance}`
        }
      });

      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert(userProgressUpdate, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (progressError) {
        console.error('User progress error:', {
          error: progressError,
          code: progressError.code,
          message: progressError.message,
          details: progressError.details,
          hint: progressError.hint
        });
        throw new Error(`Failed to update user progress: ${progressError.message}`);
      }

      // Clear challenge attempts cache for the user
      await challengeAttemptsCache.clear(session.user.id);

      setIsSubmitting(false);
      toast.success('Evaluation submitted successfully!', {
        id: 'saving-evaluation',
      });

      console.log('Evaluation submission completed successfully');
      return { 
        success: true, 
        data: attemptRecord 
      };
    } catch (error) {
      console.error('Evaluation submission error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      toast.error('Failed to save evaluation', {
        id: 'saving-evaluation',
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitEvaluation,
    isSubmitting
  };
};

import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

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
  };
}

export const useEvaluationSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEvaluation = async ({ supabase, data }: EvaluationSubmissionParams) => {
    setIsSubmitting(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Please sign in to save evaluation', {
          id: 'saving-evaluation',
        });
        return { success: false };
      }

      // 1. Create challenge attempt record
      const { data: attemptRecord, error: attemptError } = await supabase
        .from('challenge_attempts')
        .insert({
          user_id: session.user.id,
          challenge_id: data.challengeId,
          content: data.content,
          word_count: data.performanceMetrics.wordCount,
          paragraph_count: data.performanceMetrics.paragraphCount,
          time_spent: data.timeSpent,
          performance_score: data.evaluation.metrics.overall,
          feedback: data.evaluation.improvedEssay
        })
        .select()
        .single();

      if (attemptError) {
        throw attemptError;
      }

      if (attemptRecord) {
        // 2. Store performance metrics
        const performanceMetricsToInsert = [
          { metric_name: 'grammar', metric_value: data.evaluation.metrics.grammar },
          { metric_name: 'vocabulary', metric_value: data.evaluation.metrics.vocabulary },
          { metric_name: 'fluency', metric_value: data.evaluation.metrics.fluency },
          { metric_name: 'overall', metric_value: data.evaluation.metrics.overall },
          { metric_name: 'writing_complexity', metric_value: data.evaluation.skills.writingComplexity },
          { metric_name: 'accuracy', metric_value: data.evaluation.skills.accuracy },
          { metric_name: 'coherence', metric_value: data.evaluation.skills.coherence },
          { metric_name: 'style', metric_value: data.evaluation.skills.style }
        ].map(metric => ({
          attempt_id: attemptRecord.id,
          user_id: session.user.id,
          ...metric
        }));

        const { error: metricsError } = await supabase
          .from('performance_metrics')
          .insert(performanceMetricsToInsert);

        if (metricsError) {
          console.error('Error storing performance metrics:', metricsError);
        }

        // 3. Update skill metrics
        const skillMetricsToUpsert = [
          { category: 'language', skill_name: 'grammar', proficiency_level: data.evaluation.metrics.grammar },
          { category: 'language', skill_name: 'vocabulary', proficiency_level: data.evaluation.metrics.vocabulary },
          { category: 'writing', skill_name: 'complexity', proficiency_level: data.evaluation.skills.writingComplexity }
        ].map(metric => ({
          user_id: session.user.id,
          ...metric,
          last_assessed: new Date().toISOString()
        }));

        const { error: skillsError } = await supabase
          .from('skill_metrics')
          .upsert(skillMetricsToUpsert, {
            onConflict: 'user_id,category,skill_name'
          });

        if (skillsError) {
          console.error('Error updating skill metrics:', skillsError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Evaluation submission error:', error);
      toast.error('Failed to save evaluation', {
        id: 'saving-evaluation',
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitEvaluation,
    isSubmitting
  };
};

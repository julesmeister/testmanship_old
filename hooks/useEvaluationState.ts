import { useState, useEffect } from 'react';
import { type Challenge } from '@/types/challenge';
import { type EvaluationState, type PerformanceMetrics, type SkillMetrics, type Insights } from '@/types/evaluation';
import { useLanguageStore } from '@/stores/language';
import { useEvaluationSubmission } from './useEvaluationSubmission';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const defaultState: EvaluationState = {
  showEvaluation: false,
  performanceMetrics: {
    wordCount: 0,
    paragraphCount: 0,
    timeSpent: 0,
    performanceScore: 0,
    improvedEssay: '',
    metrics: {
      grammar: 0,
      vocabulary: 0,
      fluency: 0,
      overall: 0
    }
  },
  skillMetrics: {
    writingComplexity: 0,
    accuracy: 0,
    coherence: 0,
    style: 0
  },
  insights: {
    strengths: [],
    weaknesses: [],
    tips: []
  },
  isLoading: false,
  error: null
};

export function useEvaluationState(
  challenge: Challenge | null,
  isTimeUp: boolean,
  content?: string,
  performanceMetrics?: PerformanceMetrics,
  skillMetrics?: SkillMetrics,
  insights?: Insights
): EvaluationState {
  const [state, setState] = useState<EvaluationState>(defaultState);
  const { selectedLanguageId, languages } = useLanguageStore();
  const { submitEvaluation, isSubmitting } = useEvaluationSubmission();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const evaluateChallenge = async () => {
      if (!challenge || !content || !isTimeUp) {
        setState(prev => ({ ...prev, showEvaluation: false }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const selectedLanguage = languages.find(lang => lang.id === selectedLanguageId);
        console.log('[useEvaluationState] Starting evaluation:', {
          selectedLanguage,
          challengeId: challenge.id,
          contentLength: content?.length
        });

        const response = await fetch('/api/challenge-evaluation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId: challenge.id,
            challenge,
            content,
            timeSpent: challenge.time_allocation || 1800,
            targetLanguage: selectedLanguage?.code?.toUpperCase() || 'EN'
          })
        });

        const data = await response.json();
        console.log('[useEvaluationState] API Response:', {
          status: response.status,
          ok: response.ok,
          hasPerformanceMetrics: !!data.performanceMetrics,
          hasSkillMetrics: !!data.skillMetrics,
          error: data.error
        });

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Failed to evaluate challenge');
        }

        // Validate required data
        if (!data.performanceMetrics?.metrics || !data.skillMetrics) {
          console.error('[useEvaluationState] Invalid response data:', {
            hasPerformanceMetrics: !!data.performanceMetrics,
            hasMetrics: !!data.performanceMetrics?.metrics,
            hasSkillMetrics: !!data.skillMetrics
          });
          throw new Error('Evaluation response is missing required data');
        }

        console.log('[useEvaluationState] Attempting to submit evaluation:', {
          challengeId: challenge.id,
          hasContent: !!content,
          timeSpent: challenge.time_allocation || 1800,
          metrics: data.performanceMetrics.metrics,
          skills: data.skillMetrics
        });

        const submissionResult = await submitEvaluation({
          supabase,
          data: {
            challengeId: challenge.id,
            content,
            timeSpent: challenge.time_allocation || 1800,
            evaluation: {
              metrics: data.performanceMetrics.metrics,
              skills: data.skillMetrics,
              improvedEssay: data.performanceMetrics.improvedEssay || ''
            },
            performanceMetrics: {
              wordCount: data.performanceMetrics.wordCount || 0,
              paragraphCount: data.performanceMetrics.paragraphCount || 0
            }
          }
        });

        console.log('[useEvaluationState] Submission result:', submissionResult);

        setState(prev => ({
          ...prev,
          showEvaluation: true,
          performanceMetrics: data.performanceMetrics,
          skillMetrics: data.skillMetrics,
          insights: data.insights,
          isLoading: false,
          error: null
        }));
      } catch (error) {
        console.error('[useEvaluationState] Evaluation error:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to evaluate challenge', 
          isLoading: false 
        }));
      }
    };

    evaluateChallenge();
  }, [challenge, isTimeUp, content, selectedLanguageId, languages]);

  return state;
};

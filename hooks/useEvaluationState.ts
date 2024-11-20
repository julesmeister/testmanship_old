import { useState, useEffect } from 'react';
import { type Challenge } from '@/types/challenge';
import { type EvaluationState, type PerformanceMetrics, type SkillMetrics, type Insights } from '@/types/evaluation';

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

  useEffect(() => {
    const evaluateChallenge = async () => {
      if (!challenge || !content || !isTimeUp) {
        setState(prev => ({ ...prev, showEvaluation: false }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch('/api/challenge-evaluation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId: challenge.id, content })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to evaluate challenge');
        }

        setState(prev => ({
          ...prev,
          showEvaluation: true,
          performanceMetrics: data.performanceMetrics,
          skillMetrics: data.skillMetrics,
          insights: data.insights,
          isLoading: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to evaluate challenge',
          isLoading: false
        }));
      }
    };

    evaluateChallenge();
  }, [challenge, isTimeUp, content]);

  return state;
};

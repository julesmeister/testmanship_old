import { useState, useEffect, useCallback } from 'react';
import { type Challenge } from '@/types/challenge';

interface PerformanceMetrics {
  wordCount: number;
  paragraphCount: number;
  timeSpent: number;
  performanceScore: number;
  improvedEssay?: string;
  metrics: {
    grammar: number;
    vocabulary: number;
    fluency: number;
    overall: number;
  };
}

interface SkillMetrics {
  writingComplexity: number;
  accuracy: number;
  coherence: number;
  style: number;
}

export interface EvaluationState {
  showEvaluation: boolean;
  performanceMetrics: PerformanceMetrics;
  skillMetrics: SkillMetrics;
  isLoading: boolean;
  error: string | null;
}

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
  isLoading: false,
  error: null
};

export const useEvaluationState = (
  challenge: Challenge | null,
  isTimeUp: boolean,
  content?: string
) => {
  const [state, setState] = useState<EvaluationState>(defaultState);

  const fetchEvaluation = useCallback(async () => {
    if (!challenge?.id || !content) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/challenge-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          content: content,
          timeSpent: challenge.time_allocation || 1800 // default to 30 minutes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch evaluation');
      }

      const data = await response.json();
      
      setState({
        showEvaluation: true,
        performanceMetrics: data.performanceMetrics,
        skillMetrics: data.skillMetrics,
        isLoading: false,
        error: null
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false
      }));
    }
  }, [challenge, content]);

  useEffect(() => {
    if (challenge && isTimeUp && content) {
      fetchEvaluation();
    }
  }, [challenge, isTimeUp, content, fetchEvaluation]);

  return state;
};

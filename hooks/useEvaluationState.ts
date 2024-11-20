import { useState, useEffect, useCallback } from 'react';
import { type Challenge } from '@/types/challenge';

interface PerformanceMetrics {
  wordCount: number;
  paragraphCount: number;
  timeSpent: number;
  performanceScore: number;
  feedback?: string;
}

interface SkillMetrics {
  category: string;
  skillName: string;
  proficiencyLevel: number;
  improvementRate?: number;
}

interface UserProgress {
  totalChallengesCompleted: number;
  totalWordsWritten: number;
  totalTimeSpent: number;
  averagePerformance: number;
  strongestSkills: string[];
  weakestSkills: string[];
  preferredTopics: string[];
  lastActiveLevel: string;
}

export interface EvaluationState {
  showEvaluation: boolean;
  performanceMetrics: PerformanceMetrics;
  skillMetrics: SkillMetrics[];
  userProgress: UserProgress;
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
    feedback: ''
  },
  skillMetrics: [],
  userProgress: {
    totalChallengesCompleted: 0,
    totalWordsWritten: 0,
    totalTimeSpent: 0,
    averagePerformance: 0,
    strongestSkills: [],
    weakestSkills: [],
    preferredTopics: [],
    lastActiveLevel: ''
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
          timeSpent: challenge.timeAllocation || 1800 // default to 30 minutes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch evaluation');
      }

      const data = await response.json();
      
      // Transform API response to match component expectations
      const transformedData: Partial<EvaluationState> = {
        showEvaluation: true,
        performanceMetrics: {
          wordCount: data.performanceMetrics.wordCount,
          paragraphCount: data.performanceMetrics.paragraphCount,
          timeSpent: data.performanceMetrics.timeSpent,
          performanceScore: data.performanceMetrics.performanceScore,
          feedback: data.performanceMetrics.feedback
        },
        skillMetrics: [
          {
            category: 'Writing',
            skillName: 'Grammar',
            proficiencyLevel: data.skillMetrics.grammar,
            improvementRate: 0
          },
          {
            category: 'Writing',
            skillName: 'Vocabulary',
            proficiencyLevel: data.skillMetrics.vocabulary,
            improvementRate: 0
          },
          {
            category: 'Writing',
            skillName: 'Structure',
            proficiencyLevel: data.skillMetrics.structure,
            improvementRate: 0
          },
          {
            category: 'Writing',
            skillName: 'Creativity',
            proficiencyLevel: data.skillMetrics.creativity,
            improvementRate: 0
          },
          {
            category: 'Writing',
            skillName: 'Clarity',
            proficiencyLevel: data.skillMetrics.clarity,
            improvementRate: 0
          }
        ],
        userProgress: {
          totalChallengesCompleted: data.userProgress.totalChallenges,
          totalWordsWritten: data.userProgress.totalWords,
          totalTimeSpent: data.performanceMetrics.timeSpent,
          averagePerformance: data.userProgress.averageScore,
          strongestSkills: ['Grammar', 'Structure'],
          weakestSkills: ['Creativity'],
          preferredTopics: ['Writing'],
          lastActiveLevel: challenge.difficulty
        }
      };

      setState(prev => ({
        ...prev,
        ...transformedData,
        isLoading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false
      }));
    }
  }, [challenge, content]);

  // Fetch evaluation when time is up
  useEffect(() => {
    if (challenge && isTimeUp && content) {
      fetchEvaluation();
    }
  }, [challenge, isTimeUp, content, fetchEvaluation]);

  return state;
};

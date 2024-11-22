import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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

export function useEvaluationMetrics(challenge: Challenge | null) {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [skillMetrics, setSkillMetrics] = useState<SkillMetrics[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!challenge) return;

      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('Auth error:', userError);
          return;
        }

        // Fetch performance metrics
        const { data: performanceData, error: performanceError } = await supabase
          .from('challenge_attempts')
          .select('*')
          .eq('user_id', user.id)
          .eq('challenge_id', challenge.id)
          .single();

        if (performanceError) {
          console.error('Error fetching performance metrics:', performanceError);
        } else if (performanceData) {
          setPerformanceMetrics({
            wordCount: performanceData.word_count,
            paragraphCount: performanceData.paragraph_count,
            timeSpent: performanceData.time_spent,
            performanceScore: performanceData.performance_score,
            feedback: performanceData.feedback
          });
        }

        // Fetch skill metrics
        const { data: skillData, error: skillError } = await supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', user.id)
          .order('proficiency_level', { ascending: false });

        if (skillError) {
          console.error('Error fetching skill metrics:', skillError);
        } else if (skillData) {
          setSkillMetrics(skillData.map(skill => ({
            category: skill.category,
            skillName: skill.name,
            proficiencyLevel: skill.proficiency_level,
            improvementRate: skill.improvement_rate
          })));
        }

        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (progressError) {
          console.error('Error fetching user progress:', progressError);
        } else if (progressData) {
          setUserProgress({
            totalChallengesCompleted: progressData.total_challenges,
            totalWordsWritten: progressData.total_words,
            totalTimeSpent: progressData.total_time,
            averagePerformance: progressData.average_score,
            strongestSkills: progressData.strongest_skills || [],
            weakestSkills: progressData.weakest_skills || [],
            preferredTopics: progressData.preferred_topics || [],
            lastActiveLevel: progressData.last_level || challenge.difficulty_level
          });
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, [challenge, supabase]);

  return {
    performanceMetrics,
    skillMetrics,
    userProgress
  };
}

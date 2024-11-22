import { User } from '@supabase/auth-helpers-nextjs';

export interface RawWordsmithUser {
  id: string;
  full_name: string;
  avatar_url: string;
  credits: number;
  trial_credits: number;
  target_language: { name: string }[] | null;
  native_language: { name: string }[] | null;
  updated_at: string;
}

export interface ChallengeAttempt {
  id: string;
  challenge: {
    id: string;
    title: string;
    instructions: string;
    difficulty_level: string;
    time_allocation: number;
  };
  content: string;
  word_count: number;
  paragraph_count: number;
  time_spent: number;
  performance_score: number;
  completed_at: string;
  feedback: string | null;
}

export interface UserProgress {
  total_challenges_completed: number;
  total_words_written: number;
  total_time_spent: number;
  average_performance: number;
  strongest_skills: string[];
  weakest_skills: string[];
  preferred_topics: string[];
  last_active_level: string;
}

export interface WordsmithUser {
  id: string;
  full_name: string;
  avatar_url: string;
  credits: number;
  trial_credits: number;
  target_language?: { name: string };
  native_language?: { name: string };
  updated_at: string;
}

export interface WordsmithProps {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

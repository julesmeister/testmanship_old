export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type ChallengeFormat = 
  | 'Personal Information' | 'Daily Routine' | 'Simple Description'  // A1
  | 'Short Story' | 'Informal Email' | 'Simple Opinion'             // A2
  | 'Blog Post' | 'Formal Letter' | 'Review'                        // B1
  | 'Essay' | 'Report' | 'Article'                                  // B2
  | 'Academic Essay' | 'Proposal' | 'Critical Review'               // C1
  | 'Research Paper' | 'Technical Report' | 'Academic Thesis';      // C2

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  instructions: string;
  difficulty_level: string;
  format_id: string;
  time_allocation: number;
  word_count?: number;
  grammar_focus?: string[];
  vocabulary_themes?: string[];
  checklist?: string[];
  lang: string;
  example_response?: string;
  targetLanguage?: string;
  created_at?: string;
  created_by: string;
}

export interface ChallengeAttempt {
  id: string;
  challenge_id: string;
  user_id: string;
  title: string;
  difficulty: string;
  performance: number;
  paragraphs: number;
  word_count: number;
  completed_at: Date;
  time_spent: number;
  format: string;
  content: string;
  feedback?: string;
}

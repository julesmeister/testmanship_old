import { DifficultyLevel } from '@/utils/constants';

export interface ChallengeFormat {
  id: string;
  name: string;
  description: string | null;
  difficulty_level: DifficultyLevel;
  created_at: string;
}

export interface Suggestion {
  title: string;
  description: string;
  keyPoints: string[];
}

export interface ChallengeGeneratorViewProps {
  user: any; // Replace with proper User type if available
  userDetails: any;
}

import { z } from 'zod';
import { difficultyLevels, DifficultyLevel } from '@/utils/constants';

export const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  instructions: z.string().min(1, "Instructions are required"),
  format: z.string().min(1, "Format is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  timeAllocation: z.number().min(1, "Time allocation is required"),
  wordCount: z.number().min(50, "Word count must be at least 50").max(500, "Word count cannot exceed 500"),
  grammarFocus: z.array(z.string()),
  vocabularyThemes: z.array(z.string())
});

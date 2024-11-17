import { z } from 'zod';
import { difficultyLevels, DifficultyLevel } from '@/utils/constants';

export const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  instructions: z.string(),
  difficulty: z.enum(difficultyLevels, {
    required_error: 'Please select a difficulty level',
  }) satisfies z.ZodType<DifficultyLevel>,
  format: z.string().min(1, 'Please select a format'),
  timeAllocation: z.number().min(1).max(120)
});

/**
 * ⚠️ DOCUMENTATION NOTICE
 * Before making any changes to this file, please review the DOCUMENTATION.md in this directory.
 * After making changes, update the DOCUMENTATION.md file accordingly.
 * This helps maintain accurate and up-to-date documentation of the challenge generator system.
 * 
 * Key areas to update in documentation:
 * - Type definitions
 * - Validation rules
 * - Breaking changes
 */

import { z } from 'zod';
import { difficultyLevels, DifficultyLevel } from '@/utils/constants';

export const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  instructions: z.string().min(1, "Instructions are required"),
  format: z.string().min(1, "Format is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  timeAllocation: z.number()
    .min(5, "Time allocation must be at least 5 minutes")
    .max(120, "Time allocation cannot exceed 120 minutes")
    .refine(val => val % 5 === 0, {
      message: "Time allocation must be in multiples of 5 minutes"
    }),
  wordCount: z.number().min(50, "Word count must be at least 50").max(500, "Word count cannot exceed 500"),
  grammarFocus: z.array(z.string()),
  vocabularyThemes: z.array(z.string())
});

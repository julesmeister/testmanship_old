/**
 * CEFR Language Proficiency Levels
 * https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions
 */

export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const DEFAULT_DIFFICULTY: DifficultyLevel = 'B1';

export const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  'A1': 'Beginner - Basic phrases and expressions',
  'A2': 'Elementary - Simple, everyday language',
  'B1': 'Intermediate - Main points of clear standard input',
  'B2': 'Upper Intermediate - Complex text and technical discussion',
  'C1': 'Advanced - Complex and demanding texts',
  'C2': 'Mastery - Understanding with ease virtually everything'
} as const;

export const WORD_COUNT_RANGES: Record<DifficultyLevel, number> = {
  'A1': 50,
  'A2': 100,
  'B1': 150,
  'B2': 200,
  'C1': 250,
  'C2': 300
} as const;

/**
 * Get the recommended word count for a given difficulty level
 * @param difficulty Difficulty level (case insensitive)
 * @returns Word count target or default level word count if invalid
 */
export function getWordCountRange(difficulty: string): number {
  const upperDifficulty = difficulty.toUpperCase() as DifficultyLevel;
  return WORD_COUNT_RANGES[upperDifficulty] || WORD_COUNT_RANGES[DEFAULT_DIFFICULTY];
}

/**
 * Check if a difficulty level is valid
 * @param difficulty Difficulty level to check (case insensitive)
 * @returns true if difficulty is valid
 */
export function isValidDifficulty(difficulty: string): boolean {
  return difficulty.toUpperCase() in WORD_COUNT_RANGES;
}

/**
 * Get the description for a difficulty level
 * @param difficulty Difficulty level (case insensitive)
 * @returns Description or default level description if invalid
 */
export function getDifficultyDescription(difficulty: string): string {
  const upperDifficulty = difficulty.toUpperCase() as DifficultyLevel;
  return DIFFICULTY_DESCRIPTIONS[upperDifficulty] || DIFFICULTY_DESCRIPTIONS[DEFAULT_DIFFICULTY];
}

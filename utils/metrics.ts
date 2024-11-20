interface TextMetrics {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  paragraphCount: number;
  averageWordLength: number;
  avgSentenceLength: number;
  readingTime: number;
  vocabularyDiversity: number;
  readabilityScore: number;
  grammarScore: number;
  topicRelevance: number;
  improvementRate: number;
}

/**
 * Calculates various metrics for the given text
 * @param text - The text to analyze
 * @returns Object containing various text metrics
 */
export function calculateMetrics(text: string): TextMetrics {
  if (!text) {
    return {
      wordCount: 0,
      charCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      averageWordLength: 0,
      avgSentenceLength: 0,
      readingTime: 0,
      vocabularyDiversity: 0,
      readabilityScore: 0,
      grammarScore: 0,
      topicRelevance: 0,
      improvementRate: 0
    };
  }

  // Remove extra whitespace and normalize line endings
  const normalizedText = text.replace(/\r\n/g, '\n').trim();

  // Calculate character count (excluding whitespace)
  const charCount = normalizedText.replace(/\s/g, '').length;

  // Split into words (handling various whitespace and punctuation)
  const words = normalizedText
    .split(/[\s,.:;?!()[\]{}'"]+/)
    .filter(word => word.length > 0);
  const wordCount = words.length;

  // Calculate average word length
  const averageWordLength = wordCount > 0
    ? words.reduce((sum, word) => sum + word.length, 0) / wordCount
    : 0;

  // Count sentences and calculate average sentence length
  const sentences = normalizedText.match(/[^.!?]+[.!?]+/g) || [];
  const sentenceCount = sentences.length;
  const avgSentenceLength = sentenceCount > 0
    ? words.length / sentenceCount
    : 0;

  // Count paragraphs (separated by double newlines)
  const paragraphCount = (normalizedText.match(/\n\s*\n/g) || []).length + 1;

  // Calculate estimated reading time (words per minute)
  const WORDS_PER_MINUTE = 200;
  const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE);

  // Calculate vocabulary diversity
  const vocabularyDiversity = calculateVocabularyDiversity(normalizedText);

  // Calculate readability score
  const readabilityScore = calculateReadabilityScore(normalizedText);

  // Calculate grammar score (basic implementation)
  const grammarScore = calculateGrammarScore(normalizedText);

  // Placeholder values for metrics that require external context
  const topicRelevance = 0.75; // This should be calculated based on challenge context
  const improvementRate = 0.8; // This should be calculated based on user's history

  return {
    wordCount,
    charCount,
    sentenceCount,
    paragraphCount,
    averageWordLength,
    avgSentenceLength,
    readingTime,
    vocabularyDiversity,
    readabilityScore,
    grammarScore,
    topicRelevance,
    improvementRate
  };
}

/**
 * Calculates vocabulary diversity (Type-Token Ratio)
 * @param text - The text to analyze
 * @returns Ratio between unique words and total words
 */
function calculateVocabularyDiversity(text: string): number {
  const words = text.toLowerCase()
    .split(/[\s,.:;?!()[\]{}'"]+/)
    .filter(word => word.length > 0);
  
  const uniqueWords = new Set(words);
  return words.length > 0 ? uniqueWords.size / words.length : 0;
}

/**
 * Calculates the Flesch Reading Ease score
 * @param text - The text to analyze
 * @returns Score between 0 (very difficult) and 100 (very easy)
 */
export function calculateReadabilityScore(text: string): number {
  if (!text) return 0;

  // Direct text analysis without using calculateMetrics
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const words = text.split(/[\s,.:;?!()[\]{}'"]+/).filter(word => word.length > 0);
  
  if (words.length === 0 || sentences.length === 0) {
    return 0;
  }

  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWord = estimateSyllablesPerWord(text);

  // Flesch Reading Ease formula
  return 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
}

/**
 * Estimates the average number of syllables per word in a text
 * This is a basic implementation and might not be 100% accurate
 */
function estimateSyllablesPerWord(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  if (words.length === 0) return 0;

  const totalSyllables = words.reduce((sum, word) => {
    return sum + countSyllables(word);
  }, 0);

  return totalSyllables / words.length;
}

/**
 * Counts syllables in a word using a basic algorithm
 * This is a simplified version and might not be 100% accurate
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

/**
 * Basic grammar score calculation
 * This is a simplified implementation that should be replaced with a more sophisticated one
 */
function calculateGrammarScore(text: string): number {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  let score = 1.0;

  // Basic checks that would lower the score
  const issues = [
    /\s+,/g,  // Space before comma
    /\s+\./g, // Space before period
    /\s{2,}/g, // Multiple spaces
    /[A-Z]{2,}/g, // All caps words
    /[^.!?]\s+[a-z]/g // Sentence starting with lowercase
  ];

  issues.forEach(pattern => {
    const matches = text.match(pattern) || [];
    score -= matches.length * 0.05;
  });

  // Ensure score stays between 0 and 1
  return Math.max(0, Math.min(1, score));
}

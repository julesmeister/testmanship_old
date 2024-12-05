/**
 * API endpoint for generating one-line writing exercises based on given skills.
 * Uses AI to create contextual, focused practice exercises.
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';
import { getLanguageName } from '@/types/language';
import { extractJSONFromAIResponse } from '@/utils/json';

export async function POST(request: Request) {
  try {
    const { weakSkills, targetLanguage, difficulty } = await request.json();
    const languageName = getLanguageName(targetLanguage || 'EN');

    if (!Array.isArray(weakSkills) || weakSkills.length === 0) {
      return NextResponse.json(
        { error: 'Weak skills must be a non-empty array of strings' },
        { status: 400 }
      );
    }

    // console.log('[API] Exercise Generation request:', {
    //   weakSkills,
    //   languageName
    // });

    const messages = [
      {
        role: 'system' as const,
        content: `You are a ${languageName} language tutor creating exercises for a ${difficulty} level student. Analyze the given list of weak language skills and:

1. Filter out any skills that are incomplete, don't make sense for exercise generation, or are too advanced for ${difficulty} level
2. From the remaining valid weak skills that are appropriate for ${difficulty} level, select one randomly from the list
3. Create a friendly exercise prompt that:
   - Specifically targets that weak skill (e.g. "Let's improve your descriptive adjectives!")
   - Uses instructions appropriate for ${difficulty} level learners
4. The begin_phrase should be in ${languageName} that:
   - Is the START of a sentence that the user needs to COMPLETE (e.g. "Gestern bin ich..." or "Das Wetter war...")
   - Must be an INCOMPLETE sentence, not a question or instruction
   - Uses only grammar structures and vocabulary suitable for ${difficulty} level
   - Is relevant to the weak skill being practiced
   - Provides enough context to guide the user
   - Is not too restrictive, allowing creativity
   - Is 2-5 words long
   - INCORRECT example: "Kannst du ein Adjektiv finden?" (This is a question, not a beginning phrase)
   - CORRECT example: "Mein bester Freund ist..." (This is an incomplete sentence to complete)
5. Generate a list of 20 relevant ${languageName} unique words or phrases that:
   - Are appropriate for ${difficulty} level
   - Are useful for practicing this specific weak skill
   - Include translations that the student can understand
6. Only include logically valid and complete skills in the remaining_weak_skills list:
   - Remove any weakness that are illogical, unclear, or don't make sense for language learning
   - Must contain the EXACT text of the original weak skills, not placeholders
   - MUST NOT include the selected weak_skill that is being practiced in this exercise
   - Should only include skills that are appropriate for ${difficulty} level

IMPORTANT: 
- For the vocabulary object, you MUST use the exact key format "word1", "word2", etc. (not numeric keys)
- ALL generated content (exercise prompt, beginning phrase, vocabulary) MUST be appropriate for ${difficulty} level
- Do not include grammar structures or vocabulary that are above ${difficulty} level

Respond ONLY in valid JSON format with this exact structure:
{
  "exercise_prompt": "${difficulty === 'A1' || difficulty === 'A2' ? 'string (friendly exercise description in English)' : `string (friendly exercise description in ${languageName})`}",
  "begin_phrase": "Der Junge war..., Morgen bin ich..., Als ich...",
  "vocabulary": {
    "word1 in ${languageName}": "translation1 in English (${difficulty}-appropriate)",
    "word2 in ${languageName}": "translation2 in English (${difficulty}-appropriate)",
    ...
    "word20 in ${languageName}": "translation20 in English (${difficulty}-appropriate)"
  },
  "weak_skill": "string (the exact text of the specific weak skill from the input list focused on by the exercise prompt)",
  "remaining_weak_skills": [
    "string (exact text of remaining valid weak skills appropriate for ${difficulty} level, excluding the selected weak_skill)",
    ...
  ]
}`
      },
      {
        role: 'user' as const,
        content: `Here are the weak language skills to analyze: ${JSON.stringify(weakSkills)}. Choose one randomly and generate a friendly exercise prompt, a beginning phrase, and a list of 20 words that target that weak skill. Remember to keep the exact text of the weak skills in the remaining_weak_skills array.`
      }
    ];

    const response = await makeAIRequest(messages);

    if (!response) {
      throw new Error('Failed to generate exercise');
    }
    // console.log('[API] Exercise Generation response:', response);

    const aiResponse = extractJSONFromAIResponse<any>(response);
    // console.log('[API] Parsed response:', aiResponse);

    return NextResponse.json({
      exercise_prompt: aiResponse.exercise_prompt || '',
      begin_phrase: aiResponse.begin_phrase || '',
      vocabulary: aiResponse.vocabulary || {},
      weak_skill: aiResponse.weak_skill || '',
      remaining_weak_skills: Array.isArray(aiResponse.remaining_weak_skills)
        ? aiResponse.remaining_weak_skills
        : []
    });
  } catch (error: any) {
    console.error('[API] Exercise Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate exercise' },
      { status: 500 }
    );
  }
}

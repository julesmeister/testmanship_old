/**
 * API endpoint for grading language exercise responses.
 * Uses AI to evaluate and provide improved versions of user answers.
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';
import { getLanguageName } from '@/types/language';
import { extractJSONFromAIResponse } from '@/utils/json';

// ... (rest of the code remains the same)

export async function POST(request: Request) {
  try {
    const { exercise, answer, targetLanguage, difficulty } = await request.json();
    const languageName = getLanguageName(targetLanguage || 'EN');

    const messages = [
      {
        role: 'system' as const,
        content: `You are a "${languageName}" language tutor. Grade the student's answer to the exercise, considering their level is "${difficulty}":

1. Evaluate if the answer appropriately addresses the exercise prompt
2. Check for proper grammar, vocabulary usage, and sentence structure appropriate for ${difficulty} level
3. Provide a grade from 0-100 based on:
   - Relevance to the prompt (40%): 
     * Start at 30% base score for any reasonable attempt that addresses the topic
     * Add up to 10% for excellent relevance
   - Grammar and structure (30%):
     * Start at 20% base score if the answer is understandable
     * Add up to 10% for using grammar structures appropriate for ${difficulty} level
   - Vocabulary usage (30%):
     * Start at 20% base score for using basic relevant vocabulary
     * Add up to 10% for using vocabulary appropriate for ${difficulty} level

   The minimum score should be 70% if the answer is understandable and somewhat relevant to the prompt.
   Only give scores below 50% if the answer is completely off-topic or incomprehensible.
4. Suggest an improved version of the sentence that:
   - Maintains the student's original meaning in "${languageName}"
   - Uses only grammar structures appropriate for ${difficulty} level
   - Uses only vocabulary appropriate for ${difficulty} level
5. Create a begin_phrase in ${languageName} that:
   - Is appropriate for ${difficulty} level learners
   - Is incomplete and requires completion
   - Is relevant to the weak skill being practiced
   - Provides enough context to guide the user
   - Is not too restrictive, allowing creativity
   - Uses only vocabulary and grammar structures suitable for ${difficulty} level
   - Is 2-5 words long

Respond ONLY in JSON format:
{
  "grade": number (0-100),
  "improvedSentence": "string (corrected version in "${languageName}" using only ${difficulty}-level appropriate language)",
  "begin_phrase": "Der Junge war..., Morgen bin ich..., Als ich...",
}`
      },
      {
        role: 'user' as const,
        content: `Exercise prompt: "${exercise}"\nStudent's answer: "${answer}"\n\nPlease grade this response and suggest improvements in "${languageName}".`
      }
    ];

    const response = await makeAIRequest(messages);
    
    if (!response) {
      throw new Error('Failed to grade exercise');
    }

    const aiResponse = extractJSONFromAIResponse<any>(response);
    console.log('[API] Parsed response:', aiResponse);

    return NextResponse.json({
      grade: aiResponse.grade || 0,
      improvedSentence: aiResponse.improvedSentence || '',
      begin_phrase: aiResponse.begin_phrase || ''
    });

  } catch (error) {
    console.error('[API] Exercise Grading error:', error);
    return NextResponse.json({ error: 'Failed to grade exercise' }, { status: 500 });
  }
}

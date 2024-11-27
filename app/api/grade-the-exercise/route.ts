/**
 * API endpoint for grading language exercise responses.
 * Uses AI to evaluate and provide improved versions of user answers.
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';
import { getLanguageName } from '@/types/language';

export async function POST(request: Request) {
  try {
    const { exercise, answer, targetLanguage } = await request.json();
    const languageName = getLanguageName(targetLanguage || 'EN');

    const messages = [
      {
        role: 'system' as const,
        content: `You are a "${languageName}" language tutor. Grade the student's answer to the exercise:

1. Evaluate if the answer appropriately addresses the exercise prompt
2. Check for proper grammar, vocabulary usage, and sentence structure
3. Provide a grade from 0-100 based on:
   - Relevance to the prompt (40%)
   - Grammar and structure (30%)
   - Vocabulary usage (30%)
4. Suggest an improved version of the sentence that maintains the student's original meaning in "${languageName}"

Respond ONLY in JSON format:
{
  "grade": number (0-100),
  "improvedSentence": "string (corrected version in "${languageName}" of the answer that maintains the original meaning)"
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
    console.log('[API] Exercise Grading response:', response);

    const aiResponse = JSON.parse(response);

    return NextResponse.json({
      grade: aiResponse.grade,
      improvedSentence: aiResponse.improvedSentence
    });

  } catch (error) {
    console.error('[API] Exercise Grading error:', error);
    return NextResponse.json({ error: 'Failed to grade exercise' }, { status: 500 });
  }
}

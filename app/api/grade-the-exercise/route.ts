/**
 * API endpoint for grading language exercise responses.
 * Uses AI to evaluate and provide improved versions of user answers.
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';
import { getLanguageName } from '@/types/language';

// Extract JSON from a string that might contain additional text
function extractJSON(str: string): string {
  try {
    // First try to parse the entire string as JSON
    try {
      JSON.parse(str);
      return str; // If successful, return the entire string
    } catch {
      // If that fails, try to extract JSON
    }

    // Find the first occurrence of '{'
    const start = str.indexOf('{');
    if (start === -1) {
      console.error('No JSON object found in string:', str);
      return '';
    }

    let openBraces = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < str.length; i++) {
      const char = str[i];

      if (inString) {
        if (char === '\\' && !escaped) {
          escaped = true;
          continue;
        }
        if (char === '"' && !escaped) {
          inString = false;
        }
        escaped = false;
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === '{') {
        openBraces++;
      } else if (char === '}') {
        openBraces--;
        if (openBraces === 0) {
          const extracted = str.substring(start, i + 1);
          try {
            // Validate that the extracted string is valid JSON
            JSON.parse(extracted);
            return extracted;
          } catch {
            console.error('Extracted string is not valid JSON:', extracted);
            return '';
          }
        }
      }
    }
    console.error('No complete JSON object found in string:', str);
    return '';
  } catch (error) {
    console.error('Error extracting JSON:', error);
    return '';
  }
}

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
   - Relevance to the prompt (40%): 
     * Start at 30% base score for any reasonable attempt that addresses the topic
     * Add up to 10% for excellent relevance
   - Grammar and structure (30%):
     * Start at 20% base score if the answer is understandable
     * Add up to 10% for perfect grammar
   - Vocabulary usage (30%):
     * Start at 20% base score for using basic relevant vocabulary
     * Add up to 10% for using advanced or varied vocabulary

   The minimum score should be 70% if the answer is understandable and somewhat relevant to the prompt.
   Only give scores below 50% if the answer is completely off-topic or incomprehensible.
4. Suggest an improved version of the sentence that maintains the student's original meaning in "${languageName}"
5. Create a beginning phrase in ${languageName} for the exercise that the user will complete (e.g. "Yesterday, I went to..." or "The weather was so..." - make it relevant to the weak skill). The begin_phrase should:
- Be incomplete and require the user to complete it
- Be relevant to the weak skill being practiced
- Provide enough context to guide the user
- Not be too restrictive, allowing creativity
- Be 2-5 words long

Respond ONLY in JSON format:
{
  "grade": number (0-100),
  "improvedSentence": "string (corrected version in "${languageName}" of the answer that maintains the original meaning)",
  "begin_phrase": "string (random phrase in "${languageName}" that the user will complete)",
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

    const jsonStr = extractJSON(response);
    if (!jsonStr) {
      throw new Error('Failed to extract valid JSON from response');
    }

    const aiResponse = JSON.parse(jsonStr);
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

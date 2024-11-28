/**
 * API endpoint for generating one-line writing exercises based on given skills.
 * Uses AI to create contextual, focused practice exercises.
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
    const { weakSkills, targetLanguage } = await request.json();
    const languageName = getLanguageName(targetLanguage || 'EN');

    if (!Array.isArray(weakSkills) || weakSkills.length === 0) {
      return NextResponse.json(
        { error: 'Weak skills must be a non-empty array of strings' },
        { status: 400 }
      );
    }

    console.log('[API] Exercise Generation request:', {
      weakSkills,
      languageName
    });

    const messages = [
      {
        role: 'system' as const,
        content: `You are a ${languageName} language tutor. Analyze the given list of weak language skills and:

1. Filter out any skills that are incomplete, or don't make sense for exercise generation.
2. From the remaining valid weak skills, select one randomly from the list that would make a good exercise focus
3. Create a friendly exercise prompt that specifically targets that weak skill (e.g. "Let's improve your descriptive adjectives!")
4. Create a beginning phrase in ${languageName} for the exercise that the user will complete (e.g. "Yesterday, I went to..." or "The weather was so..." - make it relevant to the weak skill)
5. Generate a list of 20 relevant ${languageName} unique words or phrases for practicing this specific weak skill
6. Only include logically valid and complete skills in the remaining_weak_skills list - remove any weakness that are illogical, unclear, or don't make sense for language learning and must contain the EXACT text of the original weak skills, not placeholders.

IMPORTANT: For the vocabulary object, you MUST use the exact key format "word1", "word2", etc. (not numeric keys)

The begin_phrase should:
- Be incomplete and require the user to complete it
- Be relevant to the weak skill being practiced
- Provide enough context to guide the user
- Not be too restrictive, allowing creativity
- Be 2-5 words long

Respond ONLY in valid JSON format with this exact structure:
{
  "exercise_prompt": "string (friendly exercise description that targets the selected weak skill)",
  "begin_phrase": "string (beginning phrase for the exercise prompt in ${languageName})",
  "vocabulary": {
    "word1 in ${languageName}": "translation1 in English",
    "word2 in ${languageName}": "translation2 in English",
    ...
    "word20 in ${languageName}": "translation20 in English"
  },
  "weak_skill": "string (the exact text of the specific weak skill from the input list focused on by the exercise prompt)",
  "remaining_weak_skills": [
    "string (exact text of remaining weak skills)",
    "string (exact text of remaining weak skills)",
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
    console.log('[API] Exercise Generation response:', response);

    const jsonStr = extractJSON(response);
    if (!jsonStr) {
      throw new Error('Failed to extract valid JSON from response');
    }

    const aiResponse = JSON.parse(jsonStr);
    console.log('[API] Parsed response:', aiResponse);

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

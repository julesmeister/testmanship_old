/**
 * API endpoint for generating one-line writing exercises based on given skills.
 * Uses AI to create contextual, focused practice exercises.
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';
import { getLanguageName } from '@/types/language';

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
        content: 'You are a "' + languageName + '" language tutor. Analyze the given list of weak language skills and:\n\n' +
          '1. Filter out any skills that are incomplete, or don\'t make sense for exercise generation.\n' +
          '2. From the remaining valid weak skills, select one randomly from the list that would make a good exercise focus\n' +
          '3. Create a friendly exercise prompt that specifically targets that weak skill (e.g. "Let\'s improve your descriptive adjectives!")\n' +
          '4. Generate a list of 20 relevant "' + languageName + '" unique words or phrases for practicing this specific weak skill\n' +
          '5. Only include logically valid and complete skills in the remaining_weak_skills list - remove any weakness that are illogical, unclear, or don\'t make sense for language learning\n\n' +
          'Respond ONLY in JSON format:\n' +
          '{\n' +
          '  "exercise_prompt": "string (friendly exercise description that targets the selected weak skill)",\n' +
          '  "vocabulary": ["word1", "word2", "...", "word20"],\n' +
          '  "weak_skill": "string (the specific weak skill you selected to focus on)",\n' +
          '  "remaining_weak_skills": ["string (list of other valid weak skills for future exercises)"]\n' +
          '}'
      },
      {
        role: 'user' as const,
        content: `Here are the weak language skills to analyze: ${JSON.stringify(weakSkills)}. Choose one randomly and generate a friendly exercise prompt and list of 20 words that target that weak skill.`
      }
    ];

    const response = await makeAIRequest(messages);
    
    if (!response) {
      throw new Error('Failed to generate exercise');
    }
    console.log('[API] Exercise Generation response:', response);

    const aiResponse = JSON.parse(response);

    return NextResponse.json({
      exercise_prompt: aiResponse.exercise_prompt,
      vocabulary: aiResponse.vocabulary,
      weak_skill: aiResponse.weak_skill,
      remaining_weak_skills: aiResponse.remaining_weak_skills
    });
  } catch (error: any) {
    console.error('[API] Exercise Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate exercise' },
      { status: 500 }
    );
  }
}

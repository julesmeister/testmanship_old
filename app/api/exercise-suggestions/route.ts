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
          'IMPORTANT: For the vocabulary object, you MUST use the exact key format "word1", "word2", etc. (not numeric keys)\n\n' +
          'Respond ONLY in JSON format:\n' +
          '{\n' +
          '  "exercise_prompt": "string (friendly exercise description that targets the selected weak skill)",\n' +
          '  "vocabulary": {\n' +
          '    "word1 in ' + languageName + '": "English translation 1",\n' +
          '    "word2' + languageName + '": "English translation 2",\n' +
          '    "word3' + languageName + '": "English translation 3",\n' +
          '    "word4' + languageName + '": "English translation 4",\n' +
          '    "word5' + languageName + '": "English translation 5",\n' +
          '    "word6' + languageName + '": "English translation 6",\n' +
          '    "word7' + languageName + '": "English translation 7",\n' +
          '    "word8' + languageName + '": "English translation 8",\n' +
          '    "word9' + languageName + '": "English translation 9",\n' +
          '    "word10' + languageName + '": "English translation 10",\n' +
          '    "word11' + languageName + '": "English translation 11",\n' +
          '    "word12' + languageName + '": "English translation 12",\n' +
          '    "word13' + languageName + '": "English translation 13",\n' +
          '    "word14' + languageName + '": "English translation 14",\n' +
          '    "word15' + languageName + '": "English translation 15",\n' +
          '    "word16' + languageName + '": "English translation 16",\n' +
          '    "word17' + languageName + '": "English translation 17",\n' +
          '    "word18' + languageName + '": "English translation 18",\n' +
          '    "word19' + languageName + '": "English translation 19",\n' +
          '    "word20' + languageName + '": "English translation 20"\n' +
          '  },\n' +
          '  "weak_skill": "string (the specific weak skill you selected to focus on)",\n' +
          '  "remaining_weak_skills": ["string (list of other valid weak skills for future exercises)"]\n' +
          '}\n'
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

    // Extract JSON from the response, handling various markdown formats
    const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                     response.match(/(\{[\s\S]*\})/);
                     
    if (!jsonMatch) {
      console.error('Could not find valid JSON in response');
      throw new Error('Invalid response format');
    }

    const cleanedResponse = jsonMatch[1].trim();
    console.log('[API] Cleaned response:', cleanedResponse);
    
    const aiResponse = JSON.parse(cleanedResponse);
    console.log('[API] Parsed response:', aiResponse);

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

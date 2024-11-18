import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';

// Helper function to get word count range based on difficulty
function getWordCountRange(difficulty: string): number {
  switch (difficulty.toUpperCase()) {
    case 'A1':
      return 50;
    case 'A2':
      return 100;
    case 'B1':
      return 150;
    case 'B2':
      return 200;
    case 'C1':
      return 250;
    case 'C2':
      return 300;
    default:
      return 150;
  }
}

export async function POST(req: Request) {
  console.log('API Route started');
  try {
    const { difficulty, topics = [], usedTitles = [] } = await req.json();

    if (!difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const wordCount = getWordCountRange(difficulty);

    const prompt = `Generate 3 unique writing challenge suggestions for language learners at ${difficulty} level.

    Each challenge should be formatted as a JSON object with these properties:
    - title: A unique, engaging title for the challenge (30-60 characters)
    - instructions: Clear, detailed writing instructions (100-150 words)
    - word_count: Target word count (${wordCount} words)
    - time_allocation: Time limit in minutes (30-45 minutes)
    - difficulty_level: "${difficulty}"
    - grammar_focus: Array of 2-3 grammar points to focus on
    - vocabulary_themes: Array of 2-3 vocabulary themes relevant to the topic

    ${topics.length > 0 ? `Focus on these topics:\n${topics.join('\n')}\n` : ''}
    ${usedTitles.length > 0 ? `\n\nIMPORTANT: Do NOT use any of these previously used titles:\n${usedTitles.join('\n')}\n` : ''}
    
    Return ONLY the JSON object, no additional text or explanation.`;

    const suggestions = await makeAIRequest([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    try {
      const parsedSuggestions = JSON.parse(suggestions);
      return NextResponse.json(parsedSuggestions);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

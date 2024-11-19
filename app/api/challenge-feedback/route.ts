import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';

export async function POST(request: Request) {
  try {
    const { essayContent, challengeId, targetLanguage } = await request.json();

    if (!essayContent?.trim()) {
      return NextResponse.json(
        { error: 'Essay content cannot be empty' },
        { status: 400 }
      );
    }

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Map language codes to full names
    const languageMap: { [key: string]: string } = {
      'DE': 'German',
      'EN': 'English',
      'ES': 'Spanish',
      'FR': 'French',
      'IT': 'Italian',
      'PT': 'Portuguese',
      'NL': 'Dutch',
      'RU': 'Russian',
      'ZH': 'Chinese',
      'JA': 'Japanese',
      'KO': 'Korean'
    };

    const languageName = languageMap[targetLanguage.toUpperCase()] || 'English';

    try {
      const messages = [
        {
          role: 'system' as const,
          content: `You are a language learning expert providing concise feedback. Follow these rules strictly:

1. ONLY use these markers, one per line:
   ✓ [point] - for correct usage
   ✗ [point] - for errors
   ! [suggestion] - for translations or improvements, do not make any sentences that don't start with one of the markers. All three markers must be used.

2. Focus ONLY on the provided text and give only one feedback about what can be improved
3. Keep feedback brief and specific
4. Do not add any extra explanations or suggestions
5. Do not ask questions
6. Do not provide alternative scenarios`
        },
        {
          role: 'user' as const,
          content: `Analyze this ${languageName} text:\n\n${essayContent}`
        }
      ];

      console.log('Making AI request with messages:', JSON.stringify(messages, null, 2));
      const feedback = await makeAIRequest(messages);
      console.log('Received AI feedback:', feedback);

      if (!feedback?.trim()) {
        console.error('Empty feedback received from AI');
        return NextResponse.json(
          { error: 'Failed to generate meaningful feedback' },
          { status: 500 }
        );
      }

      return NextResponse.json({ feedback });
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI feedback';
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
          content: `Generate language learning feedback following these exact requirements:

Format: Provide exactly three lines of feedback using these markers at the start of each line:
   ✓ [point] - identify one correct language usage from the text
   ✗ [point] - identify one specific error or mistake from the text
   ! [suggestion] - provide one clear improvement or translation

Requirements:
1. Each feedback line must begin with its respective marker (✓, ✗, or !)
2. Analyze only the provided text content
3. Keep each feedback line to one clear, specific point
4. Write direct statements without explanations
5. Do not include questions or hypotheticals
6. All three markers must be used exactly once

Example format:
✓ [point] {single correct usage observation}
✗ [point] {single error identification}
! [suggestion] {single improvement point}`
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

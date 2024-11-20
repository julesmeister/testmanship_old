/**
 * ⚠️ DOCUMENTATION NOTICE
 * Before making any changes to this API endpoint, please review the DOCUMENTATION.md in this directory.
 * Key areas to review and update:
 * 1. Request/Response formats
 * 2. Error handling
 * 3. Rate limiting
 * 4. Security considerations
 * 
 * After making changes:
 * 1. Update DOCUMENTATION.md
 * 2. Update tests
 * 3. Update related components
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';
import { getLanguageName } from '@/types/language';

export async function POST(request: Request) {
  try {
    const { essayContent, challengeId, targetLanguage = 'EN' } = await request.json();
    const languageName = getLanguageName(targetLanguage);

    console.log('[API] Received request with:', {
      targetLanguage,
      languageName,
      challengeId,
      textPreview: essayContent?.slice(0, 50) + '...'
    });

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

    try {
      const messages = [
        {
          role: 'system' as const,
          content: `Generate language learning feedback for ${languageName} following these exact requirements:

Format: Provide exactly three lines of feedback using these markers at the start of each line:
   ✓ [point] - identify one correct language usage from the text (if text is not in ${languageName}, mark it as incorrect)
   ✗ [point] - identify one specific error or mistake from the text (if text is not in ${languageName}, point this out)
   ! [suggestion] - provide the ${languageName} translation or improvement for the text

Requirements:
1. Each feedback line must begin with its respective marker (✓, ✗, or !)
2. Analyze only the provided text content
3. Keep each feedback line to one clear, specific point
4. Write direct statements without explanations
5. Do not include questions or hypotheticals
6. All three markers must be used exactly once
7. The ! [suggestion] line MUST provide the ${languageName} translation if the text is not in ${languageName}

Example format:
✓ [point] {single correct usage observation}
✗ [point] {single error identification}
! [suggestion] {single improvement point or translation}`
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

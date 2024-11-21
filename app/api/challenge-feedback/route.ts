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
    const { essayContent, challenge, targetLanguage } = await request.json();
    
    if (!essayContent || !challenge || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const languageName = getLanguageName(targetLanguage);
    console.log('Language name resolved:', languageName);

    console.log('[API] Received request with:', {
      targetLanguage,
      languageName,
      challenge: challenge.title,
      textPreview: essayContent?.slice(0, 50) + '...'
    });

    if (!essayContent?.trim()) {
      return NextResponse.json(
        { error: 'Essay content cannot be empty' },
        { status: 400 }
      );
    }


    try {
      const messages = [
        {
          role: 'system' as const,
          content: `You are a ${languageName} language learning assistant providing feedback on writing exercises.`
        },
        {
          role: 'user' as const,
          content: `Generate language learning feedback for ${languageName} following these exact requirements:

Format: Provide exactly three lines of feedback using these markers at the start of each line:
   ✓ - identify one correct language usage or alignment with challenge instructions (if text not in ${languageName} mark as incorrect)
   ✗ - identify one specific error or area for improvement (if text not in ${languageName}, point this out)
   ! - provide the ${languageName} translation if not in ${languageName} otherwise just suggest improvement for the text

Context:
Challenge Title: ${challenge.title}
Challenge Instructions: ${challenge.instructions}

Requirements:
1. Each feedback line must begin with its respective marker (✓, ✗, or !)
2. First check if the text is in ${languageName}:
   - If NOT in ${languageName}, mark as incorrect and provide translation
   - If IN ${languageName}, focus on grammar and alignment with challenge instructions
3. Keep each feedback line to one clear, specific point
4. Write direct statements without explanations
5. Do not include questions or hypotheticals
6. All three markers must be used exactly once
7. The ! [suggestion] line MUST provide the ${languageName} translation if the text is not in ${languageName}

Example format:
✓ {single correct usage observation}
✗ {single error identification}
! {single improvement point or translation}

Text to analyze: "${essayContent}"`
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

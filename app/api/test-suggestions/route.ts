/**
 * ⚠️ DOCUMENTATION NOTICE
 * This API endpoint provides real-time AI suggestions for test writing.
 * It analyzes the current content and provides contextual suggestions
 * for improving test cases, assertions, and testing patterns.
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';
import { getLanguageName } from '@/types/language';

export async function POST(request: Request) {
  try {
    const { content, challenge, targetLanguage } = await request.json();

    if (!challenge) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const languageName = getLanguageName(targetLanguage || 'EN');
    console.log('[API] Test Suggestions request:', {
      challenge: challenge.title,
      languageName,
      contentPreview: content?.slice(0, 50) + '...'
    });

    try {
      const messages = [
        {
          role: 'system' as const,
          content: `You are an essay writing assistant for ${languageName}. Generate example sentences that could be added to the essay.
- Write natural, flowing sentence that fit the essay's context
- Match the style and tone of the existing content
- Add relevant details that enrich the test
- Keep responses to 1 sentence only`
        },
        {
          role: 'user' as const,
          content: `Challenge: ${challenge.title}
Instructions: ${challenge.instructions}
Current content: ${content || '[No words written yet]'}

${content 
  ? 'Write 1 sentence that could be naturally added to this essay.' 
  : 'Write 1 sentence that could begin this essay.'}`
        }
      ];

      const aiResponse = await makeAIRequest(messages);
      
      if (!aiResponse) {
        throw new Error('No response from AI service');
      }

      return NextResponse.json({
        suggestion: aiResponse.trim()
      });

    } catch (error) {
      console.error('[API] AI request error:', error);
      return NextResponse.json(
        { error: 'Failed to generate suggestion' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API] Request processing error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

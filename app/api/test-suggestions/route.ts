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
          content: `You are an essay writing assistant for ${languageName}. You must follow these rules exactly:
1. ONLY GENERATE ONE SINGLE SENTENCE
2. The sentence must be in ${languageName}
3. The sentence must naturally fit the essay context
4. Match the style and tone of existing content
5. If the last sentence in the content is incomplete, complete that thought instead of generating a new sentence
6. DO NOT explain or translate - just output the single sentence

IMPORTANT: Your entire response must be exactly ONE sentence. No explanations, no translations, no additional text.`
        },
        {
          role: 'user' as const,
          content: `Challenge Title: ${challenge.title}
Challenge Instructions: ${challenge.instructions}
Current Text: ${content || 'No content yet'}

TASK: Generate exactly ONE sentence in ${languageName} that would ${content ? 'naturally continue this text' : 'start this essay'}.
REMEMBER: Respond with only ONE sentence. No explanations or additional text.`
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

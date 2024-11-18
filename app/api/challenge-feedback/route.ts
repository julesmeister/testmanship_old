import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';

export async function POST(request: Request) {
  try {
    const { essayContent, challengeId, targetLanguage, challenge } = await request.json();

    if (!essayContent || !challengeId || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = `As a language learning expert, provide detailed feedback on the following ${targetLanguage} essay. The essay was written as part of a writing challenge with these requirements:

Title: ${challenge.title}
Instructions: ${challenge.instructions}
Time Allocation: ${challenge.time_allocation} minutes
Word Count Target: ${challenge.word_count || 'Not specified'}
Grammar Focus: ${challenge.grammar_focus?.join(', ') || 'Not specified'}
Vocabulary Themes: ${challenge.vocabulary_themes?.join(', ') || 'Not specified'}

Essay Content:
${essayContent}

Please provide feedback in JSON format with these properties:
{
  "overall_score": number (1-100),
  "general_feedback": string (150-200 words summarizing the main strengths and areas for improvement),
  "detailed_feedback": {
    "grammar": {
      "score": number (1-100),
      "comments": string[],
      "corrections": string[]
    },
    "vocabulary": {
      "score": number (1-100),
      "comments": string[],
      "suggestions": string[]
    },
    "structure": {
      "score": number (1-100),
      "comments": string[]
    },
    "content": {
      "score": number (1-100),
      "comments": string[]
    }
  },
  "improvement_plan": string[] (3-5 specific action items for improvement)
}`;

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      {
        role: 'system',
        content: 'You are a language learning expert providing detailed feedback on writing challenges. Your feedback should be constructive, specific, and actionable.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const feedback = await makeAIRequest(messages);
    const parsedFeedback = JSON.parse(feedback);

    return NextResponse.json(parsedFeedback);
  } catch (error) {
    console.error('Error in challenge feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}

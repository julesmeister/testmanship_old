/**
 * Challenge Evaluation API
 * Handles evaluation metrics for writing challenges
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';

interface EvaluationResponse {
  performanceMetrics: {
    wordCount: number;
    paragraphCount: number;
    timeSpent: number;
    performanceScore: number;
    feedback: string;
  };
  skillMetrics: {
    grammar: number;
    vocabulary: number;
    structure: number;
    creativity: number;
    clarity: number;
  };
  userProgress: {
    totalChallenges: number;
    totalWords: number;
    averageScore: number;
    skillImprovements: Array<{
      skill: string;
      improvement: number;
    }>;
  };
}

export async function POST(request: Request) {
  try {
    const { challengeId, content, timeSpent } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Challenge content cannot be empty' },
        { status: 400 }
      );
    }

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    // Generate evaluation using AI
    const messages = [
      {
        role: 'system' as const,
        content: `You are a writing evaluation assistant. Analyze the given text and provide metrics in the following format:
        1. Performance metrics (numeric values 0-100)
        2. Skill metrics (numeric values 0-100)
        3. Brief feedback (2-3 sentences)`
      },
      {
        role: 'user' as const,
        content: content
      }
    ];

    const result = await makeAIRequest(messages);
    
    // Parse AI response into structured format
    const evaluation: EvaluationResponse = {
      performanceMetrics: {
        wordCount: content.split(/\s+/).length,
        paragraphCount: content.split('\n\n').length,
        timeSpent,
        performanceScore: 85, // Placeholder, should be derived from AI response
        feedback: result
      },
      skillMetrics: {
        grammar: 80,
        vocabulary: 75,
        structure: 85,
        creativity: 90,
        clarity: 85
      },
      userProgress: {
        totalChallenges: 1,
        totalWords: content.split(/\s+/).length,
        averageScore: 85,
        skillImprovements: [
          { skill: 'grammar', improvement: 5 },
          { skill: 'vocabulary', improvement: 3 }
        ]
      }
    };

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to evaluate challenge' },
      { status: 500 }
    );
  }
}

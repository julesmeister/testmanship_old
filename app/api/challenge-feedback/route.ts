import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { makeAIRequest } from '@/utils/ai';

export async function POST(request: Request) {
  try {
    const { essayContent, challengeId, targetLanguage } = await request.json();

    if (!essayContent || !challengeId || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get challenge details
    const { data: challenge, error } = await supabase
      .from('writing_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (error || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const prompt = `As a language learning expert, provide detailed feedback on the following essay. The essay was written in response to these criteria:

Instructions:
${challenge.instructions}

Grammar Focus Points:
${challenge.grammar_focus ? challenge.grammar_focus.join('\n') : 'None specified'}

Required Vocabulary Themes:
${challenge.vocabulary_themes ? challenge.vocabulary_themes.join('\n') : 'None specified'}

Word Count Requirement: ${challenge.word_count || 'Not specified'}

Essay Content:
${essayContent}

Please analyze the essay based on the above criteria and provide feedback in this structure:
1. Summary for each paragraph (2-3 sentences each paragraph)
2. Strengths (3 points)
3. Areas for Improvement (3-4 points with specific examples and corrections)
4. Vocabulary Usage (analyze use of required themes and suggest improvements)
5. Grammar Assessment (focus on required grammar points)
6. Performance Score (out of 100) with detailed justification based on:
   - Grammar accuracy (30%)
   - Vocabulary usage (20%)
   - Task completion (30%)
   - Structure and coherence (20%)

Language Level: ${targetLanguage}`;

    const feedback = await makeAIRequest([
      {
        role: 'system',
        content: 'You are a helpful language learning assistant that provides detailed, constructive feedback on writing.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // Store the feedback and score in the database
    const performanceScore = extractScoreFromFeedback(feedback);
    if (performanceScore !== null) {
      await supabase
        .from('writing_submissions')
        .insert({
          challenge_id: challengeId,
          content: essayContent,
          feedback,
          performance_score: performanceScore,
        });
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}

function extractScoreFromFeedback(feedback: string): number | null {
  // Look for the performance score in the feedback
  const scoreMatch = feedback.match(/Performance Score.*?(\d+)/i);
  if (scoreMatch && scoreMatch[1]) {
    const score = parseFloat(scoreMatch[1]);
    if (!isNaN(score) && score >= 0 && score <= 100) {
      return score;
    }
  }
  return null;
}

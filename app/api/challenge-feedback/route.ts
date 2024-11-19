import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';

export async function POST(request: Request) {
  try {
    const { essayContent, challenge, targetLanguage, isNewParagraph = false } = await request.json();

    if (!essayContent || !challenge || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = `Analyze the following paragraph from an essay on "${challenge?.title}". Consider these requirements:
    - Grammar focus: ${challenge?.grammar_focus?.length ? challenge.grammar_focus.join(', ') : 'Not specified'}
    - Vocabulary themes: ${challenge?.vocabulary_themes?.length ? challenge.vocabulary_themes.join(', ') : 'Not specified'}
    - Target language level: ${targetLanguage}
    
    Language Guidelines:
    1. Identify any words or phrases that are above the ${targetLanguage} level
    2. For advanced vocabulary, suggest simpler alternatives appropriate for ${targetLanguage}
    3. If non-${targetLanguage} words are used, provide translations and suggest appropriate replacements
    4. Check if idiomatic expressions are suitable for ${targetLanguage} level learners

    Paragraph:
    ${essayContent}
    
    Provide:
    1. Brief feedback on this paragraph's grammar and vocabulary usage (2-3 sentences)
    2. Mark feedback points using:
       for correct usage and good points
       for errors or inappropriate language level
       ! for suggestions and translations
    ${isNewParagraph ? '3. One concise suggestion for what could be discussed in the next paragraph (1 sentence)' : ''}`;

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      {
        role: 'system',
        content: `You are a language learning expert providing detailed feedback on writing challenges. 
        
        Focus on:
        1. Matching vocabulary and expressions to the student's target language level
        2. Identifying and translating words that are too advanced or non-target language
        3. Suggesting simpler alternatives when vocabulary is above level
        4. Providing constructive, actionable feedback
        
        Use these markers consistently:
        ✓ for correct usage and good points
        ✗ for errors or inappropriate language level
        ! for suggestions, improvements, and translations`,
      },
      { role: 'user', content: prompt }
    ];

    const response = await makeAIRequest(messages);
    return NextResponse.json({ feedback: response });

  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}

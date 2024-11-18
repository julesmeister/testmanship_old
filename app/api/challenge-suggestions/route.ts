import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';

// Helper function to get word count range based on difficulty
function getWordCountRange(difficulty: string): number {
  switch (difficulty.toUpperCase()) {
    case 'A1':
      return 50;
    case 'A2':
      return 100;
    case 'B1':
      return 150;
    case 'B2':
      return 200;
    case 'C1':
      return 250;
    case 'C2':
      return 300;
    default:
      return 150;
  }
}

export async function POST(req: Request) {
  console.log('API Route started');
  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const { difficulty, format, timeAllocation, topics = [], usedTitles = [] } = body;

    if (!difficulty) {
      console.error('Missing difficulty in request');
      return NextResponse.json(
        { error: 'Missing required field: difficulty' },
        { status: 400 }
      );
    }

    const wordCount = getWordCountRange(difficulty);
    console.log('Generating suggestions with:', { difficulty, format, timeAllocation, wordCount });

    const prompt = `Generate 3 unique writing challenge suggestions for language learners at ${difficulty} level.

    Each challenge should be formatted as a JSON object with these properties:
    - title: A unique, engaging title for the challenge (30-60 characters)
    - instructions: Clear, detailed writing instructions (100-150 words)
    - word_count: Target word count (${wordCount} words)
    - time_allocation: Time limit in minutes (${timeAllocation} minutes)
    - difficulty_level: "${difficulty}"
    - grammar_focus: Array of 2-3 grammar points to focus on
    - vocabulary_themes: Array of 2-3 vocabulary themes relevant to the topic

    ${topics.length > 0 ? `Focus on these topics:\n${topics.join('\n')}\n` : ''}
    ${usedTitles.length > 0 ? `\n\nIMPORTANT: Do NOT use any of these previously used titles:\n${usedTitles.join('\n')}\n` : ''}
    
    Return ONLY the JSON object, no additional text or explanation.`;

    console.log('Sending prompt to AI');
    const aiResponse = await makeAIRequest([
      {
        role: 'user',
        content: prompt,
      },
    ]);
    console.log('Received AI response:', aiResponse);

    try {
      const parsedSuggestions = JSON.parse(aiResponse);
      console.log('Parsed suggestions:', parsedSuggestions);
      
      // Transform response to camelCase format
      const transformSuggestion = (suggestion: any) => ({
        title: suggestion.title,
        instructions: suggestion.instructions,
        wordCount: suggestion.word_count,
        timeAllocation: suggestion.time_allocation,
        difficultyLevel: suggestion.difficulty_level,
        grammarFocus: suggestion.grammar_focus,
        vocabularyThemes: suggestion.vocabulary_themes
      });

      // Ensure we have an array of suggestions
      const suggestionsArray = Array.isArray(parsedSuggestions) ? parsedSuggestions : parsedSuggestions.suggestions;
      
      if (!Array.isArray(suggestionsArray)) {
        console.error('Invalid suggestions format:', parsedSuggestions);
        return NextResponse.json(
          { error: 'Invalid suggestions format from AI' },
          { status: 500 }
        );
      }

      // Transform and return the suggestions
      const transformedSuggestions = suggestionsArray.map(transformSuggestion);
      return NextResponse.json({ suggestions: transformedSuggestions });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Raw response:', aiResponse);
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: parseError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

export async function POST_essayAnalysis(req: Request) {
  try {
    const { essayContent, challengeId, targetLanguage, isFullEssay } = await req.json();

    if (!essayContent) {
      return NextResponse.json(
        { error: 'Essay content is required' },
        { status: 400 }
      );
    }

    if (isFullEssay) {
      // Full essay analysis
      const prompt = `Analyze this complete essay for a ${targetLanguage} level student. Format your response using these prefixes:
      for positive points and strengths
      for errors or issues that need correction
      ! for suggestions and improvements

      Provide a comprehensive analysis covering:
      1. Overall Structure and Flow
      2. Grammar and Language Use
      3. Content and Arguments
      4. Vocabulary and Expression
      5. Achievement of Writing Goals

      Essay:
      ${essayContent}`;

      const systemMessage = `You are an expert writing tutor specializing in ${targetLanguage} level essay analysis.
      - Use to highlight strengths and achievements
      - Use to point out errors or areas needing correction
      - Use ! to provide constructive suggestions
      - Each point should be on a new line
      - Be specific and provide examples where possible
      - Consider both technical aspects and content quality`;

      const suggestions = await makeAIRequest([
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return NextResponse.json({ feedback: suggestions });
    } else {
      // Single paragraph analysis
      const prompt = `Analyze this paragraph for a ${targetLanguage} level student. Format your response using these prefixes:
      for positive points and strengths
      for errors or issues that need correction
      ! for suggestions and improvements

      Consider:
      1. Paragraph structure and coherence
      2. Grammar and language accuracy
      3. Content relevance and development

      Paragraph:
      ${essayContent}`;

      const systemMessage = `You are a writing tutor providing paragraph-level feedback.
      - Use for positive points
      - Use for errors
      - Use ! for suggestions
      - Each point should be on a new line
      - Focus on paragraph-specific improvements`;

      const suggestions = await makeAIRequest([
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return NextResponse.json({ feedback: suggestions });
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

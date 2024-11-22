/**
 * ⚠️ DOCUMENTATION NOTICE
 * Before making any changes to this API endpoint, please review the DOCUMENTATION.md in this directory.
 * Key areas to review and update:
 * 1. Request validation
 * 2. AI prompt templates
 * 3. Response formatting
 * 4. Error handling
 * 
 * After making changes:
 * 1. Update DOCUMENTATION.md
 * 2. Update tests
 * 3. Verify AI integration
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';
import { getWordCountRange, isValidDifficulty } from '@/types/difficulty';

export async function POST(req: Request) {
  console.log('API Route started');
  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const { difficulty, format, timeAllocation, topics = [], usedTitles = [], title = '' } = body;

    if (!isValidDifficulty(difficulty)) {
      console.error('Invalid difficulty in request');
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    const wordCount = getWordCountRange(difficulty);
    console.log('Generating suggestions with:', { difficulty, format, timeAllocation, wordCount, title });

    // Add a system message for better formatting
    type Message = {
      role: 'system' | 'user';
      content: string;
    };

    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a writing challenge generator for language learners. Always respond with valid JSON.'
      }
    ];

    if (title) {
      // Instruction generation mode
      messages.push({
        role: 'user',
        content: `Generate clear and concise writing instructions for a ${difficulty} level challenge titled "${title}".

Format the response as a JSON object with these properties:
{
  "instructions": "Brief, clear instructions focusing on the task and requirements. Do not mention time allocation or word count in the instructions.",
  "keyPoints": ["3-4 key points to focus on"],
  "grammarFocus": ["2-3 grammar points to practice"],
  "vocabularyThemes": ["2-3 vocabulary themes relevant to the topic"]
}

Return ONLY the JSON object, no additional text.`
      });
    } else {
      // Challenge suggestion mode
      messages.push({
        role: 'user',
        content: `Generate 3 unique writing challenge suggestions for language learners at ${difficulty} level.

Format each suggestion as a JSON object within an array like this:
{
  "suggestions": [
    {
      "title": "Unique, engaging title (30-60 characters)",
      "instructions": "Clear, detailed writing instructions (100-150 words)",
      "word_count": ${wordCount},
      "time_allocation": ${timeAllocation},
      "difficulty_level": "${difficulty}",
      "grammar_focus": ["2-3 grammar points"],
      "vocabulary_themes": ["2-3 vocabulary themes"]
    }
  ]
}

${topics.length > 0 ? `Focus on these topics:\n${topics.join('\n')}\n` : ''}
${usedTitles.length > 0 ? `\n\nDo NOT use any of these titles:\n${usedTitles.join('\n')}\n` : ''}

Return ONLY the JSON object, no additional text.`
      });
    }

    console.log('Sending prompt to AI');
    const aiResponse = await makeAIRequest(messages);
    console.log('Received AI response:', aiResponse);

    try {
      // Clean up the response - remove markdown formatting if present
      const cleanedResponse = aiResponse.replace(/^```(?:json)?\n|\n```$/g, '').trim();
      console.log('Cleaned response:', cleanedResponse);
      
      const parsedResponse = JSON.parse(cleanedResponse);
      console.log('Parsed response:', parsedResponse);

      if (title) {
        // For instruction generation, wrap the response in a suggestions array
        return NextResponse.json({
          suggestions: [{
            title,
            instructions: parsedResponse.instructions,
            keyPoints: parsedResponse.keyPoints || [],
            grammarFocus: parsedResponse.grammarFocus || [],
            vocabularyThemes: parsedResponse.vocabularyThemes || [],
            word_count: wordCount,
            time_allocation: timeAllocation,
            difficulty_level: difficulty
          }]
        });
      } else {
        // For challenge suggestions, ensure we have an array
        const suggestions = Array.isArray(parsedResponse.suggestions) 
          ? parsedResponse.suggestions 
          : [parsedResponse];

        // Transform suggestions to use camelCase
        const transformedSuggestions = suggestions.map(suggestion => ({
          title: suggestion.title,
          instructions: suggestion.instructions,
          wordCount: suggestion.word_count,
          timeAllocation: suggestion.time_allocation,
          difficultyLevel: suggestion.difficulty_level,
          grammarFocus: suggestion.grammar_focus,
          vocabularyThemes: suggestion.vocabulary_themes
        }));

        return NextResponse.json({ suggestions: transformedSuggestions });
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Raw response:', aiResponse);
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: parseError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
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

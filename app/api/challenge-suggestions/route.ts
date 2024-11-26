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
import { getLanguageName } from '@/types/language';

export async function POST(req: Request) {
  console.log('API Route started');
  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const { difficulty, format, timeAllocation, topics = [], usedTitles = [], title = '', targetLanguage = 'EN' } = body;
    const languageName = getLanguageName(targetLanguage);

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
        content: `You are a writing challenge generator for language learners. Your task is to create challenges specifically in the format of "${format}". The checklist must ONLY include concrete, measurable content requirements that can be objectively verified in the submission.

GRAMMAR FOCUS RULES:
For each difficulty level, use these specific grammar points:
- A1 (Beginner):
  * Personal pronouns (I, you, he, she, it)
  * Basic present tense of "to be"
  * Simple present tense
  * Basic questions (what, where, when)
  * Possessive adjectives (my, your, his, her)

- A2 (Elementary):
  * Present continuous tense
  * Past simple of regular verbs
  * Comparative adjectives
  * Basic prepositions (in, on, at)
  * Can/can't for ability

- B1 (Intermediate):
  * Past continuous tense
  * Present perfect simple
  * First conditional
  * Relative clauses with who/which/that
  * Modal verbs for obligation (must/have to)

- B2 (Upper Intermediate):
  * Past perfect tense
  * Second conditional
  * Passive voice
  * Reported speech
  * Used to/would for past habits

- C1 (Advanced):
  * Third conditional
  * Mixed conditionals
  * Complex passive structures
  * Inversion with negative adverbials
  * Advanced modal perfect forms

- C2 (Mastery):
  * Mixed verb forms
  * Advanced clause structures
  * Subjunctive mood
  * Complex tense relationships
  * Advanced modals and conditionals

Examples of GOOD checklist items for different formats:
- Formal formats (Letter, Email, Formal Letter, Formal Email):
  - "Sehr geehrte Damen und Herren"
  - "Mit freundlichen Grüßen"
  - "Dear Sir/Madam"
  - "Best regards"
  - "Thank you for your consideration"
  - "Yours sincerely"
  - "As per our conversation"
  - "In response to your inquiry"
  - "I am writing to apply for"

- General formats:
  - "Guten Tag"
  - "I am so excited about"
  - "We are going to"
  - "I would like to"

Examples of BAD checklist items (DO NOT USE THESE):
- "Include a greeting"
- "Add a signature"
- "Write formally"
- "Be polite"
- "Show enthusiasm"
- "Be professional"

Focus exclusively on WHAT specific content needs to be included, not HOW it should be written. Always respond with valid JSON.`
      },
      {
        role: 'system',
        content: `For difficulty level "${difficulty}", focus on grammar points appropriate for that CEFR level. Do not suggest grammar points from higher levels.`
      }
    ];

    if (title) {
      // Instruction generation mode
      messages.push({
        role: 'user',
        content: `Generate clear and concise writing instructions for a ${difficulty} level ${format} titled "${title}".

Format the response as a JSON object with these properties:
{
  "instructions": "Brief, clear instructions focusing on the task and requirements, emphasizing the specific structure and style expected for a ${format}. Do not mention time allocation or word count in the instructions.",
  "keyPoints": ["3-4 key points to focus on, including format-specific elements"],
  "grammarFocus": ["2-3 specific grammar points appropriate for ${difficulty} CEFR level"],
  "vocabularyThemes": ["2-3 vocabulary themes relevant to the topic and format"],
  "checklist": ["3-7 exact phrases that must appear in the text. If ${format} is a formal format, include appropriate formal phrases. All phrases must be in ${languageName}."]
}

Return ONLY the JSON object, no additional text or explanations.`
      });
    } else {
      // Challenge suggestion mode
      messages.push({
        role: 'user',
        content: `Generate 3 unique ${format} writing challenge suggestions for language learners at ${difficulty} level. Each suggestion should follow the typical structure and conventions of a ${format}.

Format each suggestion as a JSON object within an array like this:
{
  "suggestions": [
    {
      "title": "Unique, engaging title for a ${format} (30-60 characters)",
      "instructions": "Clear, detailed writing instructions specific to creating a ${format} (100-150 words), including format-specific structure and style requirements",
      "word_count": ${wordCount},
      "time_allocation": ${timeAllocation},
      "difficulty_level": "${difficulty}",
      "grammar_focus": ["2-3 specific grammar points appropriate for ${difficulty} CEFR level"],
      "vocabulary_themes": ["2-3 vocabulary themes relevant to the ${format}"],
      "checklist": ["3-7 exact phrases that must appear in the text. If ${format} is a formal format, include appropriate formal phrases. All phrases must be in ${languageName}."]
    }
  ]
}

Return ONLY the JSON array, no additional text or explanations.${topics.length > 0 ? `\nFocus on these topics:\n${topics.join('\n')}` : ''}`
      });
    }

    console.log('Sending prompt to AI');
    const aiResponse = await makeAIRequest(messages);
    console.log('Received AI response:', aiResponse);

    try {
      // Extract JSON from the response, handling various markdown formats
      const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                       aiResponse.match(/(\{[\s\S]*\})/);
                       
      if (!jsonMatch) {
        console.error('Could not find valid JSON in response');
        throw new Error('Invalid response format');
      }

      const cleanedResponse = jsonMatch[1].trim();
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
          vocabularyThemes: suggestion.vocabulary_themes,
          checklist: suggestion.checklist
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

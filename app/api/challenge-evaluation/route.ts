/**
 * Challenge Evaluation API
 * Handles evaluation metrics for writing challenges
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';
import { extractJSONFromAIResponse } from '@/utils/json';

const EVALUATION_PROMPT = `You are a writing evaluation assistant specializing in language learning assessment. Analyze the given text based on the provided challenge context and respond ONLY with a valid JSON object. Do not include any additional text or explanations.

For any text, evaluate based on the challenge instructions, target language, difficulty level, and specified grammar/vocabulary focus areas. IMPORTANT: When providing an improved version, maintain the original topic and core content - only fix grammar, vocabulary, and structure issues. Do not change the subject matter or introduce new topics. Respond with a JSON object in this exact format:
{
  "metrics": {
    "grammar": number (0-100, based on grammar rules specific to the target language),
    "vocabulary": number (0-100, based on vocabulary usage and specified themes),
    "fluency": number (0-100, based on natural flow and expression),
    "overall": number (0-100, weighted average considering difficulty level)
  },
  "skills": {
    "writingComplexity": number (0-100, sentence structure variety and complexity),
    "accuracy": number (0-100, adherence to challenge requirements and language rules),
    "coherence": number (0-100, logical flow and organization),
    "style": number (0-100, appropriate tone and register for the context)
  },
  "insights": {
    "strengths": [
      "Grammar mastery (e.g., 'Correct use of articles with food items like der Apfel, die Suppe, das Brot')",
      "Vocabulary richness (e.g., 'Using specific cooking verbs like braten, kochen, backen instead of basic machen')",
      "Sentence variety (e.g., 'Good use of time expressions like manchmal, jeden Tag, zum Frühstück')",
      "Word order (e.g., 'Correct placement of verbs in subordinate clauses after weil, wenn, dass')",
      "Expression usage (e.g., 'Natural use of food idioms like Das ist nicht mein Geschmack, Guten Appetit')"
    ],
    "weaknesses": [
      "Grammar issues (e.g., 'Missing articles before nouns' or 'Incorrect word order in subordinate clauses')",
      "Vocabulary gaps (e.g., 'Using basic words like 'gut' instead of descriptive food adjectives like 'lecker', 'schmackhaft')",
      "Sentence structure (e.g., 'Using simple sentences without conjunctions like weil, dass, oder')",
      "Verb conjugation (e.g., 'Incorrect conjugation of modal verbs like mögen, können')",
      "Preposition usage (e.g., 'Missing or incorrect prepositions with locations like im Restaurant, bei mir zuhause')"
    ],
    "tips": [
      "Grammar-focused tip (e.g., 'Review and practice [specific grammar point]')",
      "Vocabulary suggestion (e.g., 'Incorporate more [theme] related terms')",
      "Writing advice (e.g., 'Structure paragraphs with clear topic sentences')"
    ]
  },
  "improvedEssay": "Improved version that maintains the SAME TOPIC and core content, following the specified writing format. The response must:
1. Adhere to all conventions and structures typical of this format (e.g., proper salutations and closings for letters, appropriate headings and sections for blog posts, etc.)
2. Use ONLY vocabulary and grammar structures appropriate for the specified difficulty level (e.g., A1 should only use basic present tense and simple conjunctions, while B1 can use more complex structures)
3. Complete any missing format elements (e.g., if a formal letter is missing a closing, add it; if a blog post needs an introduction, add it)
4. Break the content into appropriate paragraphs with proper spacing and structure
5. Ensure the final essay is complete and well-structured, adding connecting content where necessary while maintaining the original message",
}`;

interface EvaluationResponse {
  performanceMetrics: {
    wordCount: number;
    paragraphCount: number;
    timeSpent: number;
    performanceScore: number;
    improvedEssay: string;
    metrics: {
      grammar: number;
      vocabulary: number;
      fluency: number;
      overall: number;
    };
  };
  skillMetrics: {
    writingComplexity: number;
    accuracy: number;
    coherence: number;
    style: number;
  };
  insights: {
    strengths: string[];
    weaknesses: string[];
    tips: string[];
  };
}

export async function POST(request: Request) {
  try {
    const { challenge, content, timeSpent, targetLanguage, format } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Challenge content cannot be empty' },
        { status: 400 }
      );
    }

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge information is required' },
        { status: 400 }
      );
    }

    const messages = [
      { role: 'system' as const, content: EVALUATION_PROMPT },
      { 
        role: 'user' as const, 
        content: `
Challenge Instructions: ${challenge.instructions}
Target Language: ${targetLanguage || 'EN'}
Difficulty Level: ${challenge.difficulty_level}
Grammar Focus: ${challenge.grammar_focus?.join(', ') || 'Not specified'}
Vocabulary Themes: ${challenge.vocabulary_themes?.join(', ') || 'Not specified'}
Writing Format: ${format || 'Unknown Format'} (eg. Blog Post, Formal Letter, Email, etc.)	

Student's Response:
${content}
`
      }
    ];

    const aiResponse = await makeAIRequest(messages);

    // Try to parse the AI response
    let evaluation;
    try {
      evaluation = extractJSONFromAIResponse<any>(aiResponse);
    } catch (error) {
      console.error('Failed to extract JSON from AI response:', error);
      return NextResponse.json(
        { 
          error: 'Failed to process the evaluation results. Please try again.',
          metrics: { grammar: 0, vocabulary: 0, fluency: 0, overall: 0 },
          skills: { writingComplexity: 0, accuracy: 0, coherence: 0, style: 0 },
          insights: {
            strengths: ["Evaluation failed"],
            weaknesses: ["Unable to process text"],
            tips: ["Please try again"]
          },
          improvedEssay: content
        },
        { status: 200 } // Return 200 with default values instead of 500
      );
    }
    
    // Validate the response structure and ensure arrays are not empty
    if (!evaluation.metrics || !evaluation.skills || !evaluation.improvedEssay || 
        !evaluation.insights || !evaluation.insights.strengths || !evaluation.insights.weaknesses || 
        !evaluation.insights.tips || !Array.isArray(evaluation.insights.strengths) || 
        !Array.isArray(evaluation.insights.weaknesses) || !Array.isArray(evaluation.insights.tips)) {
      console.error('Invalid evaluation structure:', evaluation);
      return NextResponse.json(
        { error: 'The evaluation format was unexpected. Please try again.' },
        { status: 500 }
      );
    }

    // For short responses, we still want feedback but don't require non-empty arrays
    const isShortResponse = content.split(/\s+/).length < 10;
    if (!isShortResponse && (
        evaluation.insights.strengths.length === 0 || 
        evaluation.insights.weaknesses.length === 0 || 
        evaluation.insights.tips.length === 0
    )) {
      console.error('Empty insight arrays for non-short response:', evaluation);
      return NextResponse.json(
        { error: 'The evaluation is missing required feedback. Please try again.' },
        { status: 500 }
      );
    }

    // Ensure all arrays have at least one item and are strings
    const validateInsightArray = (arr: any[], name: string): string[] => {
      if (!arr.every(item => typeof item === 'string' && item.trim())) {
        throw new Error(`Invalid ${name} format`);
      }
      return arr.map(item => item.trim());
    };

    const insights = {
      strengths: validateInsightArray(evaluation.insights.strengths, 'strengths'),
      weaknesses: validateInsightArray(evaluation.insights.weaknesses, 'weaknesses'),
      tips: validateInsightArray(evaluation.insights.tips, 'tips')
    };
    const evaluationResponse: EvaluationResponse = {
      performanceMetrics: {
        wordCount: content.split(/\s+/).length,
        paragraphCount: content.split('\n\n').length,
        timeSpent,
        performanceScore: evaluation.metrics.overall,
        improvedEssay: evaluation.improvedEssay,
        metrics: evaluation.metrics
      },
      skillMetrics: evaluation.skills,
      insights
    };

    return NextResponse.json(evaluationResponse);

  } catch (error: any) {
    console.error('Challenge evaluation error:', error);

    // Handle rate limit errors specifically
    if (error.message?.includes('taking a quick break')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to evaluate the challenge. Please try again.' },
      { status: 500 }
    );
  }
}

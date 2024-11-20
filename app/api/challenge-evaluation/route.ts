/**
 * Challenge Evaluation API
 * Handles evaluation metrics for writing challenges
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';

const EVALUATION_PROMPT = `You are a writing evaluation assistant. Analyze the given text and provide a JSON response with the following structure:
{
  "metrics": {
    "grammar": number (0-100),
    "vocabulary": number (0-100),
    "fluency": number (0-100),
    "overall": number (0-100)
  },
  "skills": {
    "writingComplexity": number (0-100),
    "accuracy": number (0-100),
    "coherence": number (0-100),
    "style": number (0-100)
  },
  "insights": {
    "strengths": ["list of 2-3 specific strengths in the writing"],
    "weaknesses": ["list of 2-3 specific areas for improvement"],
    "tips": ["2-3 actionable tips for improvement"]
  },
  "improvedEssay": "an improved version of the text that fixes any issues and enhances the writing"
}`;

// Extract JSON from a string that might contain additional text
function extractJSON(str: string): string {
  try {
    // Find the first occurrence of '{'
    const start = str.indexOf('{');
    if (start === -1) return '';

    let openBraces = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < str.length; i++) {
      const char = str[i];

      if (inString) {
        if (char === '\\' && !escaped) {
          escaped = true;
          continue;
        }
        if (char === '"' && !escaped) {
          inString = false;
        }
        escaped = false;
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === '{') {
        openBraces++;
      } else if (char === '}') {
        openBraces--;
        if (openBraces === 0) {
          return str.substring(start, i + 1);
        }
      }
    }
    return '';
  } catch (error) {
    console.error('Error extracting JSON:', error);
    return '';
  }
}

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

    const messages = [
      { role: 'system' as const, content: EVALUATION_PROMPT },
      { role: 'user' as const, content: content }
    ];

    const aiResponse = await makeAIRequest(messages);
    console.log('AI API Response:', aiResponse);
    const jsonStr = extractJSON(aiResponse);
    console.log('Extracted JSON:', jsonStr);

    if (!jsonStr) {
      console.error('Failed to extract JSON from AI response:', aiResponse);
      return NextResponse.json(
        { error: 'Failed to process the evaluation results. Please try again.' },
        { status: 500 }
      );
    }

    try {
      const evaluation = JSON.parse(jsonStr);
      console.log('Parsed evaluation:', evaluation);
      
      // Validate the response structure and ensure arrays are not empty
      if (!evaluation.metrics || !evaluation.skills || !evaluation.improvedEssay || 
          !evaluation.insights || !evaluation.insights.strengths || !evaluation.insights.weaknesses || 
          !evaluation.insights.tips || !Array.isArray(evaluation.insights.strengths) || 
          !Array.isArray(evaluation.insights.weaknesses) || !Array.isArray(evaluation.insights.tips) ||
          evaluation.insights.strengths.length === 0 || evaluation.insights.weaknesses.length === 0 || 
          evaluation.insights.tips.length === 0) {
        console.error('Invalid evaluation structure or empty arrays:', evaluation);
        return NextResponse.json(
          { error: 'The evaluation format was unexpected or missing required data. Please try again.' },
          { status: 500 }
        );
      }

      // Ensure all arrays have at least one item and are strings
      const validateInsightArray = (arr: any[], name: string): string[] => {
        console.log(`Validating ${name} array:`, arr);
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
      console.log('Processed insights:', insights);

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
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { error: 'Failed to process the evaluation results. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Challenge evaluation error:', error);

    // Handle rate limit errors specifically
    if (error.message.includes('taking a quick break')) {
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

/**
 * API Route Template
 * Use this as a starting point for creating new API endpoints
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';
import { extractJSONFromAIResponse } from '@/utils/json';

// Define your request body interface
interface RequestBody {
  template: string;
  exerciseType: string;
  topic: string;
  description: string;
  difficultyLevel: string;
  targetLanguage: string;
}

// Define Message type for AI requests
type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Define your response interface
interface ResponseData {
  content: string;
}

// Define your AI prompt template
const PROMPT_TEMPLATE = `You are an expert exercise generator. Your task is to:
1. Generate an exercise based on the provided template and parameters
2. Ensure the exercise is appropriate for the given difficulty level
3. Make the exercise relevant to the specified topic and description
4. Generate the content in the specified target language
5. Return the exercise content in the exact format of the provided template

Topic: {topic}
Topic Description: {description}
Difficulty Level: {difficultyLevel}
Exercise Type: {exerciseType}
Target Language: {targetLanguage}

Template:
{template}

Respond ONLY with a valid JSON object that follows the exact structure of the template above.`;

export async function POST(request: Request) {
  console.log('[API] Generate Exercise Content started');
  
  try {
    // Parse request body
    const body = await request.json() as RequestBody;
    console.log('[API] Request body:', body);

    // Validate required parameters
    if (!body.template || !body.exerciseType || !body.topic || !body.difficultyLevel || !body.targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Prepare prompt for AI request
    const prompt = PROMPT_TEMPLATE
      .replace('{topic}', body.topic)
      .replace('{description}', body.description)
      .replace('{difficultyLevel}', body.difficultyLevel)
      .replace('{exerciseType}', body.exerciseType)
      .replace('{targetLanguage}', body.targetLanguage)
      .replace('{template}', body.template);

    // Prepare messages for AI request
    const messages: Message[] = [
      {
        role: 'system',
        content: prompt
      }
    ];

    // Make AI request
    const aiResponse = await makeAIRequest(messages);
    console.log('[API] AI response:', aiResponse);

    // Parse and validate AI response
    const content = extractJSONFromAIResponse(aiResponse);
    console.log('[API] Parsed response:', content);

    // Return formatted response
    return NextResponse.json({ content });
  } catch (error) {
    // Log and handle errors
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate exercise content' },
      { status: 500 }
    );
  }
}

// Optional: Add GET/PUT/DELETE methods if needed
export async function GET(request: Request) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

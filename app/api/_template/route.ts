/**
 * API Route Template
 * Use this as a starting point for creating new API endpoints
 */

import { NextResponse } from 'next/server';
import { makeAIRequest } from '@/utils/ai';
import { extractJSONFromAIResponse } from '@/utils/json';

// Define your request body interface
interface RequestBody {
  // Add your request parameters here
  param1: string;
  param2: number;
  // etc...
}

// Define Message type for AI requests
type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Define your response interface
interface ResponseData {
  // Add your response structure here
  result: string;
  // etc...
}

// Define your AI prompt template
const PROMPT_TEMPLATE = `You are an AI assistant. Your task is to:
1. [Describe the specific task]
2. [List any specific requirements]
3. [Define the expected output format]

Respond ONLY with a valid JSON object in the following format:
{
  "result": "string",
  // Add more fields as needed
}`;

export async function POST(request: Request) {
  console.log('[API] Route started');
  
  try {
    // Parse request body
    const body = await request.json() as RequestBody;
    console.log('[API] Request body:', body);

    // Validate required parameters
    if (!body.param1 || !body.param2) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Prepare messages for AI request
    const messages: Message[] = [
      {
        role: 'system',
        content: PROMPT_TEMPLATE
      },
      {
        role: 'user',
        content: `Process this input:
          param1: ${body.param1}
          param2: ${body.param2}
        `
      }
    ];

    // Make AI request
    const response = await makeAIRequest(messages);
    console.log('[API] AI response:', response);

    // Parse and validate AI response
    const aiResponse = extractJSONFromAIResponse<ResponseData>(response);
    console.log('[API] Parsed response:', aiResponse);

    // Return formatted response
    return NextResponse.json({
      result: aiResponse.result
      // Add more fields as needed
    });

  } catch (error) {
    // Log and handle errors
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Optional: Add GET/PUT/DELETE methods if needed
export async function GET(request: Request) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

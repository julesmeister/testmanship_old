import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: Request) {
  try {
    const { title, difficulty, format, timeAllocation } = await req.json();

    if (!difficulty || !format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let prompt;
    if (title) {
      // Generate instructions for a specific title
      prompt = `Generate a writing challenge based on the following parameters:
      Title: "${title}"
      Difficulty Level: ${difficulty}
      Format: ${format}
      Time Allocation: ${timeAllocation} minutes

      Provide:
      1. A brief description of the task
      2. 3-5 key points or elements to include
      
      Format the response as a JSON array with a single object with this structure:
      {
        "suggestions": [{
          "title": "${title}",
          "description": "string",
          "keyPoints": ["string"]
        }]
      }
      
      Make sure the challenge is:
      - Appropriate for the ${difficulty} proficiency level
      - Follows the ${format} format requirements
      - Clear and well-structured
      - Achievable within ${timeAllocation} minutes`;
    } else {
      // Generate multiple challenge suggestions
      prompt = `Generate 3 unique writing challenge suggestions for a ${difficulty} level English proficiency student using the ${format} format.
      For each suggestion, provide:
      1. A clear and concise title
      2. A brief description of the task
      3. Key points or elements to include
      
      Format the response as a JSON object with this structure:
      {
        "suggestions": [{
          "title": "string",
          "description": "string",
          "keyPoints": ["string"]
        }]
      }
      
      Make sure the suggestions are:
      - Appropriate for the ${difficulty} proficiency level
      - Follow the ${format} format requirements
      - Engaging and creative
      - Clear and well-structured
      - Focused on practical language use`;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': headers().get('referer') || 'https://testmanship.com',
        'X-Title': 'Testmanship',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-90b-vision-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter API response:', data);
    
    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      return NextResponse.json(parsedContent);
    } catch (error) {
      console.error('Error parsing suggestions:', error);
      return NextResponse.json(
        { error: 'Failed to parse suggestions' },
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

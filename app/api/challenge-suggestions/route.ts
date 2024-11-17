import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper function to get word count range based on difficulty
function getWordCountRange(difficulty: string): number {
  switch (difficulty.toUpperCase()) {
    case 'A1':
      return 75;
    case 'A2':
      return 125;
    case 'B1':
      return 175;
    case 'B2':
      return 225;
    case 'C1':
      return 275;
    case 'C2':
      return 350;
    default:
      return 200;
  }
}

export async function POST(req: Request) {
  console.log('API Route started');
  try {
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key is missing');
      return NextResponse.json(
        { error: 'API configuration error - Missing API key' },
        { status: 500 }
      );
    }

    const { title, difficulty, format, timeAllocation, usedTitles = [] } = await req.json();
    console.log('Received request:', { title, difficulty, format, timeAllocation, usedTitlesCount: usedTitles.length });

    if (!difficulty || !format) {
      console.log('Missing required fields:', { difficulty, format });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let prompt;
    if (title) {
      // Generate instructions for a specific title
      const wordCount = getWordCountRange(difficulty);
      prompt = `Generate a writing challenge based on the following parameters:
      Title: "${title}"
      Difficulty Level: ${difficulty}
      Format: ${format}
      Time Allocation: ${timeAllocation} minutes
      Word Count: ${wordCount}

      Provide:
      1. A brief description of the task
      2. 3-5 key points or elements to include
      3. Specific grammar structures to use (based on ${difficulty} level)
      4. Suggested vocabulary themes
      
      Format the response as a JSON array with a single object with this structure:
      {
        "suggestions": [{
          "title": "${title}",
          "description": "string",
          "keyPoints": ["string"],
          "wordCount": ${wordCount},
          "grammarFocus": ["string"],
          "vocabularyThemes": ["string"]
        }]
      }
      
      Make sure the challenge is:
      - Appropriate for the ${difficulty} proficiency level (see word count and grammar requirements)
      - Follows the ${format} format requirements
      - Clear and well-structured
      - Achievable within ${timeAllocation} minutes
      - Includes appropriate grammar structures for ${difficulty} level
      - Has vocabulary suitable for ${difficulty} level`;
    } else {
      // Generate multiple challenge suggestions
      const wordCount = getWordCountRange(difficulty);
      prompt = `Generate 3 unique writing challenge suggestions for a ${difficulty} level English proficiency student using the ${format} format.
      Word Count Requirement: ${wordCount}

      For each suggestion, provide:
      1. A clear and concise title
      2. A brief description of the task
      3. Key points or elements to include
      4. Required grammar structures for ${difficulty} level
      5. Suggested vocabulary themes
      
      Format the response as a JSON object with this structure:
      {
        "suggestions": [{
          "title": "string",
          "description": "string",
          "keyPoints": ["string"],
          "wordCount": ${wordCount},
          "grammarFocus": ["string"],
          "vocabularyThemes": ["string"]
        }]
      }
      
      Make sure the suggestions are:
      - Appropriate for the ${difficulty} proficiency level
      - Follow the ${format} format requirements
      - Match the word count requirement: ${wordCount}
      - Include grammar structures appropriate for ${difficulty} level
      - Use vocabulary suitable for ${difficulty} level
      - Engaging and creative
      - Clear and well-structured
      - Focused on practical language use
      ${usedTitles.length > 0 ? `\n\nIMPORTANT: Do NOT use any of these previously used titles:\n${usedTitles.join('\n')}\n` : ''}
      
      Return ONLY the JSON object, no additional text or explanation.`;
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
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return NextResponse.json(
        { error: `API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('OpenRouter API response:', JSON.stringify(data, null, 2));

    try {
      const content = data.choices[0].message.content;
      console.log('Raw content:', content);

      let parsedContent;
      try {
        // Remove markdown code blocks if present
        const cleanContent = content.replace(/^```(?:json)?\n|\n```$/g, '').trim();
        console.log('Cleaned content:', cleanContent);
        
        parsedContent = JSON.parse(cleanContent);
      } catch (error) {
        console.error('Error parsing content as JSON:', error);
        console.log('Content that failed to parse:', content);
        return NextResponse.json(
          { error: 'Invalid response format from AI' },
          { status: 500 }
        );
      }

      if (!parsedContent?.suggestions?.length) {
        console.error('No suggestions in parsed content:', parsedContent);
        return NextResponse.json(
          { error: 'No suggestions generated' },
          { status: 500 }
        );
      }

      return NextResponse.json(parsedContent);
    } catch (error) {
      console.error('Error processing response:', error);
      return NextResponse.json(
        { error: 'Failed to process suggestions' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in challenge suggestions API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

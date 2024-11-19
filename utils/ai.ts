import { AI_CONFIG } from '@/config/ai';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function makeAIRequest(messages: Message[]) {
  if (!AI_CONFIG.apiKey) {
    throw new Error('API configuration error - Missing API key');
  }

  try {
    const requestBody = {
      model: AI_CONFIG.model,
      messages,
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.max_tokens,
    };
    console.log('AI API Request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(AI_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        ...AI_CONFIG.headers,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AI API Error Response:', errorData);
      
      // Handle rate limit errors
      if (response.status === 429 || (errorData.error?.type === 'rate_limit_exceeded')) {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
      }
      
      throw new Error(errorData.error?.message || `AI request failed with status ${response.status}`);
    }

    const completion = await response.json();
    console.log('AI API Response:', JSON.stringify(completion, null, 2));
    
    // Handle empty or malformed responses
    if (!completion) {
      console.error('Empty AI response');
      throw new Error('No response received from AI service');
    }

    // Handle SambaNova specific response format
    if (completion.error) {
      console.error('AI service error:', completion.error);
      if (completion.error.type === 'rate_limit_exceeded') {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
      }
      throw new Error(completion.error.message || 'AI service error');
    }
    
    // Validate the response structure
    if (!completion.choices || !Array.isArray(completion.choices) || completion.choices.length === 0) {
      console.error('Invalid AI response structure:', completion);
      throw new Error('Invalid response format from AI service');
    }

    const firstChoice = completion.choices[0];
    if (!firstChoice || !firstChoice.message || typeof firstChoice.message.content !== 'string') {
      console.error('Invalid choice structure:', firstChoice);
      throw new Error('Invalid message format in AI response');
    }

    return firstChoice.message.content;
  } catch (error) {
    console.error('AI request error:', error);
    throw error instanceof Error ? error : new Error('Failed to process AI request');
  }
}

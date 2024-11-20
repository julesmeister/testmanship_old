import { AI_CONFIG } from '@/config/ai';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRateLimitError = (response: Response, errorData: any) => {
  return response.status === 429 || 
         errorData?.error?.type === 'rate_limit_exceeded' ||
         errorData?.error?.message?.toLowerCase().includes('rate limit');
};

export async function makeAIRequest(messages: Message[], retryCount = 0) {
  if (!AI_CONFIG.apiKey) {
    throw new Error('Oops! Looks like we need to set up our AI connection. Please contact support for assistance! 🔧');
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

    const errorData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      console.error('AI API Error Response:', errorData);
      
      // Handle rate limit errors with retry logic
      if (isRateLimitError(response, errorData)) {
        if (retryCount < 3) {
          console.log(`Rate limit hit, retrying in ${(retryCount + 1) * 2} seconds...`);
          await delay((retryCount + 1) * 2000); // Exponential backoff
          return makeAIRequest(messages, retryCount + 1);
        }
        throw new Error('Our AI is taking a quick break. Please try again in a few moments! 🧠✨');
      }
      
      throw new Error(errorData.error?.message || 'Something unexpected happened with our AI. We\'re looking into it! 🔍');
    }

    // For successful responses, the response is already parsed
    const completion = errorData;
    console.log('AI API Response:', JSON.stringify(completion, null, 2));
    
    // Handle empty or malformed responses
    if (!completion) {
      console.error('Empty AI response');
      throw new Error('Hmm, our AI seems to be a bit quiet. Let\'s try that again! 🎯');
    }

    if (!completion.choices?.[0]?.message?.content) {
      console.error('Malformed AI response:', completion);
      if (retryCount < 3) {
        console.log(`Malformed response, retrying in ${(retryCount + 1) * 2} seconds...`);
        await delay((retryCount + 1) * 2000);
        return makeAIRequest(messages, retryCount + 1);
      }
      throw new Error('Our AI\'s response wasn\'t quite what we expected. Give it another shot! 🎲');
    }

    return completion.choices[0].message.content;
  } catch (error: any) {
    // Log the error for debugging
    console.error('AI Request Error:', error);
    
    // If it's already a handled error, rethrow it
    if (error.message.includes('Our AI')) {
      throw error;
    }
    
    // For unexpected errors
    throw new Error('We encountered an unexpected issue. Please try again! 🔄');
  }
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

export const AI_CONFIG = {
  apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'microsoft/phi-3-mini-128k-instruct',
  // model: 'meta-llama/llama-3.2-3b-instruct:free',
  temperature: 0.8,
  max_tokens: 1500,
  apiKey: OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://testmanship.com',
    'X-Title': 'Testmanship',
  },
} as const;

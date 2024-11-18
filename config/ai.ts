const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

export const AI_CONFIG = {
  apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'meta-llama/llama-3.2-90b-vision-instruct:free',
  temperature: 0.7,
  max_tokens: 1000,
  apiKey: OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://testmanship.com',
    'X-Title': 'Testmanship',
  },
} as const;

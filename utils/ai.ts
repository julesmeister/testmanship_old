import { AI_CONFIG } from '@/config/ai';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function makeAIRequest(messages: Message[]) {
  if (!AI_CONFIG.apiKey) {
    throw new Error('API configuration error - Missing API key');
  }

  const response = await fetch(AI_CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
      ...AI_CONFIG.headers,
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages,
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.max_tokens,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get AI response');
  }

  const completion = await response.json();
  return completion.choices[0].message.content;
}

import endent from 'endent';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';

const createPrompt = (topic: string, words: string, essayType: string) => {
  const data = (topic: any, words: string, essayType: string) => {
    return endent`
      You are an expert formal essay writer and generator.
      You know very well all types of essays. Generate an formal ${essayType} essay about ${topic}, which has a number of maximum ${words} words.
      The generated content should NOT be longer than ${words} words.
      The essay must be in markdown format but not rendered, it must include all markdown characteristics. The title must be bold, and there should be a &nbsp; between every paragraph.
      Do not include informations about console logs or print messages.
    `;
  };

  if (essayType) {
    return data(topic, words, essayType);
  }
};

export async function OpenAIStream (
  topic: string,
  essayType: string,
  words: string,
  model: string,
  key: string | undefined,
)  {
  const prompt = createPrompt(topic, words, essayType);

  const system = { role: 'system', content: prompt };

  const res = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://testmanship.com',
      'X-Title': 'Testmanship',
    },
    method: 'POST',
    body: JSON.stringify({
      model: model || 'openai/gpt-3.5-turbo',
      messages: [system],
      temperature: 0,
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const statusText = res.statusText;
    const result = await res.body?.getReader().read();
    throw new Error(
      `OpenRouter API returned an error: ${
        decoder.decode(result?.value) || statusText
      }`,
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};

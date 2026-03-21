import OpenAI from 'openai';
import type { CallAIResponse } from '@vibedepot/shared';
import { AIProvider, type AICallOptions } from './base';

export class OpenAIProvider extends AIProvider {
  readonly name = 'openai';
  readonly defaultModel = 'gpt-4o';

  async call(apiKey: string, options: AICallOptions): Promise<CallAIResponse> {
    const client = new OpenAI({ apiKey });
    const model = options.model ?? this.defaultModel;

    const messages = options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature,
    });

    return {
      content: response.choices[0]?.message?.content ?? '',
      model: response.model,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  }

  async stream(
    apiKey: string,
    options: AICallOptions,
    onChunk: (text: string) => void
  ): Promise<void> {
    const client = new OpenAI({ apiKey });
    const model = options.model ?? this.defaultModel;

    const messages = options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const stream = await client.chat.completions.create({
      model,
      messages,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        onChunk(text);
      }
    }
  }
}

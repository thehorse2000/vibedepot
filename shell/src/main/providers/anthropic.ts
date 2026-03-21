import Anthropic from '@anthropic-ai/sdk';
import type { CallAIResponse } from '@vibedepot/shared';
import { AIProvider, type AICallOptions } from './base';

export class AnthropicProvider extends AIProvider {
  readonly name = 'anthropic';
  readonly defaultModel = 'claude-sonnet-4-20250514';

  async call(apiKey: string, options: AICallOptions): Promise<CallAIResponse> {
    const client = new Anthropic({ apiKey });
    const model = options.model ?? this.defaultModel;

    // Separate system message from conversation messages
    const systemMsg = options.messages.find((m) => m.role === 'system');
    const messages = options.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const response = await client.messages.create({
      model,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature,
      system: systemMsg?.content,
      messages,
    });

    const textBlock = response.content.find((b) => b.type === 'text');

    return {
      content: textBlock?.text ?? '',
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  async stream(
    apiKey: string,
    options: AICallOptions,
    onChunk: (text: string) => void
  ): Promise<void> {
    const client = new Anthropic({ apiKey });
    const model = options.model ?? this.defaultModel;

    const systemMsg = options.messages.find((m) => m.role === 'system');
    const messages = options.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const stream = await client.messages.stream({
      model,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature,
      system: systemMsg?.content,
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        onChunk(event.delta.text);
      }
    }
  }
}

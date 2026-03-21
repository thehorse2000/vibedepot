import type { AIMessage, CallAIResponse } from '@vibedepot/shared';

export interface AICallOptions {
  messages: AIMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export abstract class AIProvider {
  abstract readonly name: string;
  abstract readonly defaultModel: string;

  abstract call(apiKey: string, options: AICallOptions): Promise<CallAIResponse>;

  abstract stream(
    apiKey: string,
    options: AICallOptions,
    onChunk: (text: string) => void
  ): Promise<void>;
}

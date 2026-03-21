export const AI_PROVIDERS = ['anthropic', 'openai', 'gemini'] as const;
export type AIProviderName = (typeof AI_PROVIDERS)[number];

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CallAIParams {
  provider?: AIProviderName;
  model?: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface CallAIResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

import type { AIProviderName } from '@vibedepot/shared';
import { AIProvider } from './base';
import { AnthropicProvider } from './anthropic';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';

const providers = new Map<string, AIProvider>();
providers.set('anthropic', new AnthropicProvider());
providers.set('openai', new OpenAIProvider());
providers.set('gemini', new GeminiProvider());

export function getProvider(name?: AIProviderName): AIProvider {
  const provider = providers.get(name ?? 'anthropic');
  if (!provider) {
    throw new Error(`Unknown AI provider: ${name}`);
  }
  return provider;
}

export function getDefaultProvider(): AIProvider {
  return providers.get('anthropic')!;
}

export function getProviderDefaultModel(name: AIProviderName): string {
  return getProvider(name).defaultModel;
}

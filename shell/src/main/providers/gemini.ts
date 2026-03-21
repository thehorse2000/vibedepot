import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CallAIResponse } from '@vibedepot/shared';
import { AIProvider, type AICallOptions } from './base';

export class GeminiProvider extends AIProvider {
  readonly name = 'gemini';
  readonly defaultModel = 'gemini-2.0-flash';

  async call(apiKey: string, options: AICallOptions): Promise<CallAIResponse> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: options.model ?? this.defaultModel,
    });

    const systemMsg = options.messages.find((m) => m.role === 'system');
    const history = options.messages
      .filter((m) => m.role !== 'system')
      .slice(0, -1)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const lastMessage = options.messages.filter((m) => m.role !== 'system').at(-1);

    const chat = model.startChat({
      history,
      systemInstruction: systemMsg
        ? { role: 'system', parts: [{ text: systemMsg.content }] }
        : undefined,
      generationConfig: {
        maxOutputTokens: options.maxTokens ?? 1024,
        temperature: options.temperature,
      },
    });

    const result = await chat.sendMessage(lastMessage?.content ?? '');
    const response = result.response;

    return {
      content: response.text(),
      model: options.model ?? this.defaultModel,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  }

  async stream(
    apiKey: string,
    options: AICallOptions,
    onChunk: (text: string) => void
  ): Promise<void> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: options.model ?? this.defaultModel,
    });

    const systemMsg = options.messages.find((m) => m.role === 'system');
    const history = options.messages
      .filter((m) => m.role !== 'system')
      .slice(0, -1)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const lastMessage = options.messages.filter((m) => m.role !== 'system').at(-1);

    const chat = model.startChat({
      history,
      systemInstruction: systemMsg
        ? { role: 'system', parts: [{ text: systemMsg.content }] }
        : undefined,
      generationConfig: {
        maxOutputTokens: options.maxTokens ?? 1024,
        temperature: options.temperature,
      },
    });

    const result = await chat.sendMessageStream(lastMessage?.content ?? '');

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        onChunk(text);
      }
    }
  }
}

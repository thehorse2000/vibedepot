import { ipcMain } from 'electron';
import { IPC, CallAISchema, StreamAISchema } from '@vibedepot/shared';
import { getApiKey, listConfiguredProviders } from '../keychain';
import { getProvider, getProviderDefaultModel } from '../providers';
import { getAppIdFromEvent, assertPermission } from './register';

export function registerAIIPC(): void {
  ipcMain.handle(IPC.AI_CALL, async (event, payload) => {
    const appId = getAppIdFromEvent(event.sender);
    assertPermission(appId, 'ai');

    const params = CallAISchema.parse(payload);
    const providerName = params.provider ?? 'anthropic';
    const apiKey = await getApiKey(providerName);

    if (!apiKey) {
      throw new Error(
        `No API key configured for provider "${providerName}". Please add one in Settings.`
      );
    }

    const provider = getProvider(providerName);
    return provider.call(apiKey, {
      messages: params.messages,
      model: params.model,
      maxTokens: params.maxTokens,
      temperature: params.temperature,
    });
  });

  ipcMain.handle(IPC.AI_STREAM, async (event, payload) => {
    const appId = getAppIdFromEvent(event.sender);
    assertPermission(appId, 'ai');

    const params = StreamAISchema.parse(payload);
    const providerName = params.provider ?? 'anthropic';
    const apiKey = await getApiKey(providerName);

    if (!apiKey) {
      throw new Error(
        `No API key configured for provider "${providerName}". Please add one in Settings.`
      );
    }

    const provider = getProvider(providerName);

    try {
      await provider.stream(
        apiKey,
        {
          messages: params.messages,
          model: params.model,
          maxTokens: params.maxTokens,
          temperature: params.temperature,
        },
        (chunk) => {
          event.sender.send(IPC.AI_STREAM_CHUNK, chunk);
        }
      );
      event.sender.send(IPC.AI_STREAM_END);
    } catch (err) {
      event.sender.send(
        IPC.AI_STREAM_ERROR,
        err instanceof Error ? err.message : 'Stream failed'
      );
    }
  });

  ipcMain.handle(IPC.AI_GET_PROVIDER, async () => {
    const providers = await listConfiguredProviders();
    return providers[0] ?? 'anthropic';
  });

  ipcMain.handle(IPC.AI_GET_MODEL, async () => {
    const providers = await listConfiguredProviders();
    const providerName = providers[0] ?? 'anthropic';
    return getProviderDefaultModel(
      providerName as 'anthropic' | 'openai' | 'gemini'
    );
  });

  ipcMain.handle(IPC.AI_LIST_PROVIDERS, async () => {
    return listConfiguredProviders();
  });
}

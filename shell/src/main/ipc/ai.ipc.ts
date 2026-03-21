import { ipcMain } from 'electron';
import { IPC, CallAISchema, StreamAISchema } from '@vibedepot/shared';
import type { AIProviderName } from '@vibedepot/shared';
import { getApiKey, listConfiguredProviders } from '../keychain';
import { getProvider, getProviderDefaultModel } from '../providers';
import { getInstalledApp } from '../appManager';
import { getAppIdFromEvent, assertPermission } from './register';

/**
 * Resolve which provider + key to use for an AI call.
 *
 * Priority:
 * 1. Explicit provider from the call params (if user has a key for it)
 * 2. App manifest's default provider (if user has a key)
 * 3. First provider in the app manifest's list that the user has a key for
 * 4. First provider the user has any key for
 */
async function resolveProvider(
  appId: string | null,
  requestedProvider?: string
): Promise<{ providerName: AIProviderName; apiKey: string }> {
  const configuredProviders = await listConfiguredProviders();

  // Get the app's declared providers from its manifest
  let appProviders: AIProviderName[] | undefined;
  let appDefault: AIProviderName | undefined;
  if (appId) {
    const app = getInstalledApp(appId);
    if (app?.manifest.models) {
      appProviders = app.manifest.models.providers;
      appDefault = app.manifest.models.default;
    }
  }

  // Build ordered candidate list
  const candidates: AIProviderName[] = [];

  // 1. Explicit request
  if (requestedProvider) {
    candidates.push(requestedProvider as AIProviderName);
  }

  // 2. App's default
  if (appDefault && !candidates.includes(appDefault)) {
    candidates.push(appDefault);
  }

  // 3. App's full provider list
  if (appProviders) {
    for (const p of appProviders) {
      if (!candidates.includes(p)) {
        candidates.push(p);
      }
    }
  }

  // 4. Any provider the user has configured
  for (const p of configuredProviders) {
    if (!candidates.includes(p as AIProviderName)) {
      candidates.push(p as AIProviderName);
    }
  }

  // Try each candidate until we find one with a key
  for (const name of candidates) {
    const key = await getApiKey(name);
    if (key) {
      return { providerName: name, apiKey: key };
    }
  }

  // Build a helpful error message
  const tried = candidates.length > 0 ? candidates.join(', ') : 'none';
  throw new Error(
    `No API key available. Tried providers: ${tried}. Please add a key in Settings.`
  );
}

export function registerAIIPC(): void {
  ipcMain.handle(IPC.AI_CALL, async (event, payload) => {
    const appId = getAppIdFromEvent(event.sender);
    assertPermission(appId, 'ai');

    const params = CallAISchema.parse(payload);
    const { providerName, apiKey } = await resolveProvider(
      appId,
      params.provider
    );

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
    const { providerName, apiKey } = await resolveProvider(
      appId,
      params.provider
    );

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

  ipcMain.handle(IPC.AI_GET_PROVIDER, async (event) => {
    const appId = getAppIdFromEvent(event.sender);
    try {
      const { providerName } = await resolveProvider(appId);
      return providerName;
    } catch {
      return 'anthropic';
    }
  });

  ipcMain.handle(IPC.AI_GET_MODEL, async (event) => {
    const appId = getAppIdFromEvent(event.sender);
    try {
      const { providerName } = await resolveProvider(appId);
      return getProviderDefaultModel(providerName);
    } catch {
      return getProviderDefaultModel('anthropic');
    }
  });

  ipcMain.handle(IPC.AI_LIST_PROVIDERS, async () => {
    return listConfiguredProviders();
  });
}

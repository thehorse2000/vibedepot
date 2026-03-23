---
title: Using AI Providers
description: How to call AI models, handle streaming responses, and configure provider selection in your VibeDepot app.
---

VibeDepot supports three AI providers out of the box: **Anthropic** (Claude), **OpenAI** (GPT), and **Google Gemini**. Your app calls AI through the Bridge API, and VibeDepot handles authentication using the user's API keys.

## Prerequisites

Your app must declare the `ai` permission and list supported providers in `manifest.json`:

```json
{
  "permissions": ["ai", "storage.kv"],
  "models": {
    "required": true,
    "providers": ["anthropic", "openai", "gemini"],
    "default": "anthropic"
  }
}
```

## Blocking Calls with `callAI()`

The simplest way to get an AI response:

```javascript
const response = await window.vibeDepot.ai.callAI({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain quantum computing in one sentence.' }
  ]
});

console.log(response.content);  // The AI's response text
console.log(response.model);    // e.g. "claude-sonnet-4-20250514"
console.log(response.usage);    // { inputTokens: 42, outputTokens: 18 }
```

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `messages` | `AIMessage[]` | Yes | Array of `{ role, content }` objects |
| `provider` | `string` | No | Force a specific provider (`'anthropic'`, `'openai'`, `'gemini'`) |
| `model` | `string` | No | Force a specific model (e.g. `'gpt-4o'`) |
| `maxTokens` | `number` | No | Maximum tokens in the response |
| `temperature` | `number` | No | Sampling temperature (0–2) |

### Message Roles

- **`system`** — Sets the AI's behavior. Placed first in the messages array.
- **`user`** — The user's input.
- **`assistant`** — Previous AI responses (for multi-turn conversations).

## Streaming with `streamAI()`

For real-time responses, use streaming:

```javascript
const output = document.getElementById('output');
output.textContent = '';

await window.vibeDepot.ai.streamAI(
  {
    messages: [
      { role: 'user', content: 'Write a short poem about rain.' }
    ]
  },
  (chunk) => {
    output.textContent += chunk;
  }
);
```

The `onChunk` callback fires for each text fragment as it arrives. The promise resolves when the stream is complete.

## Provider Selection

VibeDepot resolves which provider to use in this priority order:

1. **Explicit request** — `provider` parameter in the call
2. **Manifest default** — `models.default` in your manifest
3. **Manifest providers** — First provider in `models.providers` that has a configured API key
4. **Any configured** — Any provider the user has set up

This means your app works as long as the user has *any* supported API key configured.

## Querying Provider Info

```javascript
// What provider is currently selected?
const provider = await window.vibeDepot.ai.getProvider();
// => 'anthropic'

// What model is being used?
const model = await window.vibeDepot.ai.getModel();
// => 'claude-sonnet-4-20250514'

// What providers are available for this app?
const providers = await window.vibeDepot.ai.listProviders();
// => ['anthropic', 'openai']
```

## Default Models

Each provider has a default model:

| Provider | Default Model |
|---|---|
| Anthropic | `claude-sonnet-4-20250514` |
| OpenAI | `gpt-4o` |
| Gemini | `gemini-2.0-flash` |

You can override the model per-call:

```javascript
const response = await window.vibeDepot.ai.callAI({
  provider: 'openai',
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

## Error Handling

AI calls can fail for several reasons. Always wrap them in try/catch:

```javascript
try {
  const response = await window.vibeDepot.ai.callAI({
    messages: [{ role: 'user', content: 'Hello!' }]
  });
} catch (err) {
  switch (err.code) {
    case 'MISSING_API_KEY':
      // User hasn't configured any supported API key
      showMessage('Please add an API key in VibeDepot Settings.');
      break;
    case 'AI_PROVIDER_ERROR':
      // API returned an error (invalid key, rate limit, etc.)
      showMessage('AI error: ' + err.message);
      break;
    case 'PERMISSION_DENIED':
      // App doesn't have 'ai' permission
      showMessage('This app needs AI permission.');
      break;
    default:
      showMessage('Something went wrong: ' + err.message);
  }
}
```

See the [Error Codes Reference](/reference/error-codes/) for all error types.

## Multi-Turn Conversations

Build conversations by accumulating messages:

```javascript
const conversation = [
  { role: 'system', content: 'You are a coding tutor.' }
];

async function sendMessage(userInput) {
  conversation.push({ role: 'user', content: userInput });

  const response = await window.vibeDepot.ai.callAI({
    messages: conversation
  });

  conversation.push({ role: 'assistant', content: response.content });
  return response.content;
}
```

## Next Steps

- [Working with Storage](/guides/storage/) — Persist conversation history
- [Handling Errors](/guides/error-handling/) — Error patterns in depth
- [Bridge API Reference](/reference/bridge-api/) — Complete API docs

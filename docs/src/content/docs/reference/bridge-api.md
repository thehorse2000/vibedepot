---
title: Bridge API Reference
description: Complete reference for the window.vibeDepot Bridge API — all methods, parameters, return types, and examples.
---

The Bridge API is exposed as `window.vibeDepot` in every VibeDepot app window. It provides four namespaces: `ai`, `storage`, `shell`, and `db`.

## `vibeDepot.ai`

**Permission required:** `ai`

### `callAI(params)`

Send messages to an AI model and receive a complete response.

**Parameters:**

```typescript
interface CallAIParams {
  provider?: 'anthropic' | 'openai' | 'gemini';  // Force a specific provider
  model?: string;                                   // Force a specific model
  messages: AIMessage[];                            // Conversation messages
  maxTokens?: number;                               // Max tokens in response
  temperature?: number;                             // Sampling temperature (0–2)
}

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

**Returns:**

```typescript
interface CallAIResponse {
  content: string;          // The AI's response text
  model: string;            // Model used (e.g. "claude-sonnet-4-20250514")
  usage: {
    inputTokens: number;    // Tokens in the prompt
    outputTokens: number;   // Tokens in the response
  };
}
```

**Example:**

```javascript
const response = await window.vibeDepot.ai.callAI({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is 2 + 2?' }
  ],
  maxTokens: 100,
  temperature: 0.7
});
console.log(response.content);
```

**Errors:** `MISSING_API_KEY`, `AI_PROVIDER_ERROR`, `PERMISSION_DENIED`, `INVALID_PARAMS`

---

### `streamAI(params, onChunk)`

Stream an AI response, receiving text chunks in real-time.

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `params` | `CallAIParams` | Same parameters as `callAI()` |
| `onChunk` | `(chunk: string) => void` | Callback fired for each text fragment |

**Returns:** `Promise<void>` — Resolves when the stream is complete.

**Example:**

```javascript
let fullText = '';
await window.vibeDepot.ai.streamAI(
  {
    messages: [{ role: 'user', content: 'Write a haiku.' }]
  },
  (chunk) => {
    fullText += chunk;
    document.getElementById('output').textContent = fullText;
  }
);
```

**Errors:** `MISSING_API_KEY`, `AI_PROVIDER_ERROR`, `PERMISSION_DENIED`, `INVALID_PARAMS`

---

### `getProvider()`

Get the name of the currently selected AI provider.

**Returns:** `Promise<string>` — e.g. `'anthropic'`, `'openai'`, `'gemini'`

```javascript
const provider = await window.vibeDepot.ai.getProvider();
```

---

### `getModel()`

Get the currently selected model name.

**Returns:** `Promise<string>` — e.g. `'claude-sonnet-4-20250514'`, `'gpt-4o'`

```javascript
const model = await window.vibeDepot.ai.getModel();
```

---

### `listProviders()`

List all AI providers available to this app (that have API keys configured).

**Returns:** `Promise<string[]>` — e.g. `['anthropic', 'openai']`

```javascript
const providers = await window.vibeDepot.ai.listProviders();
```

---

## `vibeDepot.storage`

**Permission required:** `storage.kv` (auto-granted)

### `set(key, value)`

Store a JSON-serializable value.

| Parameter | Type | Description |
|---|---|---|
| `key` | `string` | Storage key (1–256 characters) |
| `value` | `unknown` | Any JSON-serializable value |

**Returns:** `Promise<void>`

```javascript
await window.vibeDepot.storage.set('prefs', { theme: 'dark' });
```

---

### `get(key)`

Retrieve a stored value.

| Parameter | Type | Description |
|---|---|---|
| `key` | `string` | Storage key |

**Returns:** `Promise<unknown>` — The stored value, or `null` if not found.

```javascript
const prefs = await window.vibeDepot.storage.get('prefs');
```

---

### `delete(key)`

Delete a stored value.

| Parameter | Type | Description |
|---|---|---|
| `key` | `string` | Storage key |

**Returns:** `Promise<boolean>` — `true` if the key existed and was deleted, `false` otherwise.

```javascript
const deleted = await window.vibeDepot.storage.delete('prefs');
```

---

### `keys()`

List all stored keys.

**Returns:** `Promise<string[]>`

```javascript
const allKeys = await window.vibeDepot.storage.keys();
```

---

### `clear()`

Delete all stored data for this app.

**Returns:** `Promise<void>`

```javascript
await window.vibeDepot.storage.clear();
```

---

## `vibeDepot.shell`

Most methods require **no permission**. Exceptions noted below.

### `getAppInfo()`

Get this app's manifest.

**Returns:** `Promise<AppManifest>` — The full [manifest object](/reference/manifest/).

```javascript
const info = await window.vibeDepot.shell.getAppInfo();
console.log(info.name, info.version);
```

---

### `getVersion()`

Get the VibeDepot shell version.

**Returns:** `Promise<string>` — e.g. `'0.1.0'`

```javascript
const version = await window.vibeDepot.shell.getVersion();
```

---

### `openExternal(url)`

Open a URL in the user's default browser.

| Parameter | Type | Description |
|---|---|---|
| `url` | `string` | A valid URL |

**Returns:** `Promise<void>`

```javascript
await window.vibeDepot.shell.openExternal('https://example.com');
```

---

### `notify(title, body)`

Show a desktop notification. **Requires `notifications` permission.**

| Parameter | Type | Constraints |
|---|---|---|
| `title` | `string` | Max 256 characters |
| `body` | `string` | Max 1024 characters |

**Returns:** `Promise<void>`

```javascript
await window.vibeDepot.shell.notify('Task Complete', 'Your document has been generated.');
```

---

### `setTitle(title)`

Set the app window's title bar text.

| Parameter | Type | Description |
|---|---|---|
| `title` | `string` | Window title |

**Returns:** `Promise<void>`

```javascript
await window.vibeDepot.shell.setTitle('My App - Document 1');
```

---

### `theme()`

Get the current system theme.

**Returns:** `Promise<'light' | 'dark'>`

```javascript
const theme = await window.vibeDepot.shell.theme();
if (theme === 'dark') {
  document.body.classList.add('dark');
}
```

---

## `vibeDepot.db`

**Permission required:** `storage.db`

### `run(sql, params?)`

Execute a write statement (INSERT, UPDATE, DELETE, CREATE TABLE, etc.).

| Parameter | Type | Description |
|---|---|---|
| `sql` | `string` | SQL statement (must be on the [allowlist](/reference/sql-allowlist/)) |
| `params` | `unknown[]` | Optional bind parameters |

**Returns:**

```typescript
Promise<{
  changes: number;          // Number of rows affected
  lastInsertRowid: number;  // ID of the last inserted row
}>
```

```javascript
const result = await window.vibeDepot.db.run(
  'INSERT INTO notes (title) VALUES (?)',
  ['Meeting Notes']
);
console.log(result.lastInsertRowid); // e.g. 1
```

**Errors:** `DB_ERROR`, `PERMISSION_DENIED`

---

### `query(sql, params?)`

Execute a SELECT query.

| Parameter | Type | Description |
|---|---|---|
| `sql` | `string` | SQL SELECT statement |
| `params` | `unknown[]` | Optional bind parameters |

**Returns:** `Promise<unknown[]>` — Array of row objects.

```javascript
const notes = await window.vibeDepot.db.query(
  'SELECT * FROM notes WHERE title LIKE ?',
  ['%Meeting%']
);
```

**Errors:** `DB_ERROR`, `PERMISSION_DENIED`

---

### `transaction(statements)`

Execute multiple statements atomically. If any statement fails, all changes are rolled back.

| Parameter | Type | Description |
|---|---|---|
| `statements` | `Array<{ sql: string; params?: unknown[] }>` | Statements to execute |

**Returns:** `Promise<void>`

```javascript
await window.vibeDepot.db.transaction([
  { sql: 'INSERT INTO tags (name) VALUES (?)', params: ['important'] },
  { sql: 'INSERT INTO tags (name) VALUES (?)', params: ['urgent'] }
]);
```

**Errors:** `DB_ERROR`, `PERMISSION_DENIED`

---
title: Bridge API Design
description: Why the Bridge API exists, how it works under the hood, and how it connects apps to the shell.
---

The Bridge API is the sole communication channel between sandboxed apps and the VibeDepot shell. It's exposed as `window.vibeDepot` in every app window.

## Why a Bridge?

VibeDepot apps are web pages running in Electron BrowserWindows with context isolation. They have no access to Node.js, Electron APIs, or the filesystem. The Bridge exists to provide controlled access to platform capabilities:

- **AI model calls** — Apps can't load AI SDKs directly (no Node.js). The Bridge routes calls through the main process.
- **Persistent storage** — Web storage (localStorage) is unreliable in Electron. The Bridge provides durable, app-scoped storage.
- **System integration** — Desktop notifications, external URL opening, and theme detection go through the Bridge.
- **Security boundary** — Every Bridge call passes through permission checks and input validation.

## How It Works

The Bridge is implemented using Electron's `contextBridge.exposeInMainWorld()`:

```
App JavaScript          Preload Script           Main Process
(renderer context)      (isolated context)       (Node.js)
       │                       │                       │
       │  vibeDepot.ai         │                       │
       │  .callAI(params)      │                       │
       │ ─────────────────────>│                       │
       │                       │  ipcRenderer          │
       │                       │  .invoke('ai:call',   │
       │                       │   params)             │
       │                       │ ─────────────────────>│
       │                       │                       │  Zod validate
       │                       │                       │  Check permission
       │                       │                       │  Call AI SDK
       │                       │  response             │
       │                       │ <─────────────────────│
       │  Promise resolves     │                       │
       │ <─────────────────────│                       │
```

1. **App calls** a method on `window.vibeDepot` (e.g., `vibeDepot.ai.callAI()`).
2. **Preload script** translates the call into an Electron IPC `invoke` with the appropriate channel name.
3. **Main process** handler receives the IPC call, validates parameters with Zod, checks permissions, and executes the logic.
4. **Response** flows back through the same chain.

## Four Namespaces

The Bridge organizes functionality into four namespaces:

### `vibeDepot.ai`

AI model interaction. Supports blocking calls and streaming.

| Method | Description |
|---|---|
| `callAI(params)` | Send messages to an AI model and get a response |
| `streamAI(params, onChunk)` | Stream a response, receiving chunks in real-time |
| `getProvider()` | Get the name of the currently selected provider |
| `getModel()` | Get the currently selected model name |
| `listProviders()` | List providers available to this app |

### `vibeDepot.storage`

Per-app key-value storage backed by JSON files.

| Method | Description |
|---|---|
| `set(key, value)` | Store a JSON-serializable value |
| `get(key)` | Retrieve a stored value |
| `delete(key)` | Delete a key |
| `keys()` | List all stored keys |
| `clear()` | Clear all stored data |

### `vibeDepot.shell`

Shell integration and system access.

| Method | Description |
|---|---|
| `getAppInfo()` | Get this app's manifest |
| `getVersion()` | Get the VibeDepot shell version |
| `openExternal(url)` | Open a URL in the default browser |
| `notify(title, body)` | Show a desktop notification |
| `setTitle(title)` | Set the app window's title |
| `theme()` | Get the current theme (`'light'` or `'dark'`) |

### `vibeDepot.db`

Per-app SQLite database with SQL allowlisting.

| Method | Description |
|---|---|
| `run(sql, params?)` | Execute a write statement (INSERT, UPDATE, DELETE) |
| `query(sql, params?)` | Execute a read query (SELECT) |
| `transaction(statements)` | Execute multiple statements atomically |

## Streaming

The `streamAI()` method uses a different IPC pattern than blocking calls:

1. The preload sends `ai:stream` via `ipcRenderer.invoke`.
2. The main process starts streaming from the AI provider.
3. For each chunk, the main process sends `ai:stream:chunk` via `webContents.send()`.
4. On completion, it sends `ai:stream:end`.
5. On error, it sends `ai:stream:error`.
6. The preload's `ipcRenderer.on()` listeners forward chunks to the `onChunk` callback.
7. Listeners are cleaned up automatically when the stream ends or errors.

## Error Transport

Errors cross the IPC boundary as serialized `DxError` objects:

1. The main process catches an error and creates a `DxError` with a code, message, and suggestion.
2. The error is serialized to JSON using `toSerializable()`.
3. The JSON is sent back through IPC.
4. The preload script detects the serialized error and reconstructs a `DxError` using `fromSerializable()`.
5. The reconstructed error is thrown as a proper exception in the app's context.

## IPC Channel Naming

All channels follow a `domain:action` pattern:

- `ai:call`, `ai:stream`, `ai:getProvider`
- `storage:set`, `storage:get`, `storage:delete`
- `shell:notify`, `shell:theme`
- `db:run`, `db:query`, `db:transaction`

See the [IPC Channels Reference](/reference/ipc-channels/) for the complete list.

## Next Steps

- [Bridge API Reference](/reference/bridge-api/) — Complete method signatures and examples
- [Security Model](/concepts/security-model/) — How the Bridge enforces security
- [Permission System](/concepts/permission-system/) — How permissions gate Bridge access

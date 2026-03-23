---
title: IPC Channels Reference
description: Complete list of all IPC channel strings used for communication between app windows and the main process.
---

All communication between app windows, the shell renderer, and the main process flows through typed IPC channels. Channels are defined in `packages/shared/src/ipc-channels.ts`.

## AI Channels

| Constant | Channel String | Direction | Description |
|---|---|---|---|
| `IPC.AI_CALL` | `ai:call` | App → Main | Blocking AI model call |
| `IPC.AI_STREAM` | `ai:stream` | App → Main | Start a streaming AI call |
| `IPC.AI_STREAM_CHUNK` | `ai:stream:chunk` | Main → App | A chunk of streamed text |
| `IPC.AI_STREAM_END` | `ai:stream:end` | Main → App | Stream completed |
| `IPC.AI_STREAM_ERROR` | `ai:stream:error` | Main → App | Stream error occurred |
| `IPC.AI_GET_PROVIDER` | `ai:getProvider` | App → Main | Get current provider name |
| `IPC.AI_GET_MODEL` | `ai:getModel` | App → Main | Get current model name |
| `IPC.AI_LIST_PROVIDERS` | `ai:listProviders` | App → Main | List available providers |

## Key Management Channels

| Constant | Channel String | Direction | Description |
|---|---|---|---|
| `IPC.KEYS_SET` | `keys:set` | Shell → Main | Store an API key in the keychain |
| `IPC.KEYS_GET` | `keys:get` | Shell → Main | Get a masked API key |
| `IPC.KEYS_DELETE` | `keys:delete` | Shell → Main | Remove an API key |
| `IPC.KEYS_LIST` | `keys:list` | Shell → Main | List providers with stored keys |
| `IPC.KEYS_HAS` | `keys:has` | Shell → Main | Check if a provider has a key |

## Storage Channels

| Constant | Channel String | Direction | Description |
|---|---|---|---|
| `IPC.STORAGE_SET` | `storage:set` | App → Main | Store a KV value |
| `IPC.STORAGE_GET` | `storage:get` | App → Main | Retrieve a KV value |
| `IPC.STORAGE_DELETE` | `storage:delete` | App → Main | Delete a KV value |
| `IPC.STORAGE_KEYS` | `storage:keys` | App → Main | List all KV keys |
| `IPC.STORAGE_CLEAR` | `storage:clear` | App → Main | Clear all KV data |

## Shell Channels

| Constant | Channel String | Direction | Description |
|---|---|---|---|
| `IPC.SHELL_GET_APP_INFO` | `shell:getAppInfo` | App → Main | Get app manifest |
| `IPC.SHELL_GET_VERSION` | `shell:getVersion` | App → Main | Get shell version |
| `IPC.SHELL_OPEN_EXTERNAL` | `shell:openExternal` | App → Main | Open URL in browser |
| `IPC.SHELL_NOTIFY` | `shell:notify` | App → Main | Show desktop notification |
| `IPC.SHELL_SET_TITLE` | `shell:setTitle` | App → Main | Set window title |
| `IPC.SHELL_THEME` | `shell:theme` | App → Main | Get current theme |

## App Management Channels

Used internally by the shell renderer to manage app lifecycle.

| Constant | Channel String | Direction | Description |
|---|---|---|---|
| `IPC.APP_LIST` | `app:list` | Shell → Main | List installed apps |
| `IPC.APP_LAUNCH` | `app:launch` | Shell → Main | Launch an installed app |
| `IPC.APP_CLOSE` | `app:close` | Shell → Main | Close a running app |

## Store Channels

Used internally by the shell renderer for store operations.

| Constant | Channel String | Direction | Description |
|---|---|---|---|
| `IPC.STORE_FETCH_REGISTRY` | `store:fetchRegistry` | Shell → Main | Fetch registry.json |
| `IPC.STORE_INSTALL_APP` | `store:installApp` | Shell → Main | Install an app from registry |
| `IPC.STORE_UNINSTALL_APP` | `store:uninstallApp` | Shell → Main | Uninstall an app |

## Database Channels

| Constant | Channel String | Direction | Description |
|---|---|---|---|
| `IPC.DB_RUN` | `db:run` | App → Main | Execute a write SQL statement |
| `IPC.DB_QUERY` | `db:query` | App → Main | Execute a SELECT query |
| `IPC.DB_TRANSACTION` | `db:transaction` | App → Main | Execute atomic transaction |

## Dev & Sideloading Channels

| Constant | Channel String | Direction | Description |
|---|---|---|---|
| `IPC.DEV_WARNING` | `dev:warning` | Main → App | Send dev warning to sideloaded app |
| `IPC.STORE_SIDELOAD_APP` | `store:sideload-app` | Shell → Main | Sideload an app from folder |
| `IPC.STORE_UNSIDELOAD_APP` | `store:unsideload-app` | Shell → Main | Remove a sideloaded app |
| `IPC.SHELL_SELECT_FOLDER` | `shell:select-folder` | Shell → Main | Open folder selection dialog |
| `IPC.SIDELOAD_CHANGED` | `sideload:changed` | Main → Shell | Sideloaded app files changed |

## Publish Channels

Used by the publish wizard in the shell renderer.

| Constant | Channel String | Direction | Description |
|---|---|---|---|
| `IPC.PUBLISH_SELECT_FOLDER` | `publish:select-folder` | Shell → Main | Select app folder for publishing |
| `IPC.PUBLISH_READ_FOLDER` | `publish:read-folder` | Shell → Main | Read app folder contents |
| `IPC.PUBLISH_VALIDATE` | `publish:validate` | Shell → Main | Validate app for publishing |
| `IPC.PUBLISH_CREATE_BUNDLE` | `publish:create-bundle` | Shell → Main | Create ZIP bundle |
| `IPC.PUBLISH_OPEN_PR` | `publish:open-pr` | Shell → Main | Open GitHub PR URL |

## Channel Naming Convention

All channels follow a `domain:action` pattern:
- **Domain** groups related functionality (e.g., `ai`, `storage`, `shell`, `db`)
- **Action** describes the operation (e.g., `call`, `set`, `getVersion`)
- **Sub-events** use additional colons (e.g., `ai:stream:chunk`)

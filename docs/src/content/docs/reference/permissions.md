---
title: Permissions Reference
description: Complete reference for all VibeDepot app permissions — names, grant levels, and what they unlock.
---

Apps declare permissions in the `permissions` array of their `manifest.json`. The shell enforces these at runtime.

## Permission Table

| Permission | Constant | Grant Level | What It Unlocks |
|---|---|---|---|
| `ai` | `Permission.AI` | Consent required | AI provider access: `callAI()`, `streamAI()`, `getProvider()`, `getModel()`, `listProviders()` |
| `storage.kv` | `Permission.STORAGE_KV` | Auto-granted | Key-value storage: `set()`, `get()`, `delete()`, `keys()`, `clear()` |
| `storage.files` | `Permission.STORAGE_FILES` | Consent required | File system storage beyond the app sandbox |
| `storage.db` | `Permission.STORAGE_DB` | Consent required | SQLite database: `run()`, `query()`, `transaction()` |
| `network` | `Permission.NETWORK` | Consent required | External network requests |
| `clipboard` | `Permission.CLIPBOARD` | Consent required | Clipboard read/write access |
| `notifications` | `Permission.NOTIFICATIONS` | Consent required | Desktop notifications via `notify()` |

## Grant Levels

### Auto-Granted

Auto-granted permissions are available to every app without user interaction. Currently, only `storage.kv` is auto-granted — basic state persistence is considered essential for all apps.

### Consent Required

Consent-required permissions have cost, privacy, or disruption implications:

- **`ai`** — Makes API calls that cost money (the user's API credits).
- **`storage.db`** — Creates persistent SQLite databases with higher storage impact.
- **`storage.files`** — Accesses files outside the app's normal sandbox.
- **`network`** — Can send data to external servers. Privacy implications.
- **`clipboard`** — Can read potentially sensitive clipboard contents.
- **`notifications`** — Can display desktop notifications that interrupt the user.

## Bridge API Mapping

### Methods requiring `ai` permission

- `vibeDepot.ai.callAI()`
- `vibeDepot.ai.streamAI()`
- `vibeDepot.ai.getProvider()`
- `vibeDepot.ai.getModel()`
- `vibeDepot.ai.listProviders()`

### Methods requiring `storage.kv` permission

- `vibeDepot.storage.set()`
- `vibeDepot.storage.get()`
- `vibeDepot.storage.delete()`
- `vibeDepot.storage.keys()`
- `vibeDepot.storage.clear()`

### Methods requiring `storage.db` permission

- `vibeDepot.db.run()`
- `vibeDepot.db.query()`
- `vibeDepot.db.transaction()`

### Methods requiring `notifications` permission

- `vibeDepot.shell.notify()`

### Methods requiring no permission

- `vibeDepot.shell.getAppInfo()`
- `vibeDepot.shell.getVersion()`
- `vibeDepot.shell.openExternal()`
- `vibeDepot.shell.setTitle()`
- `vibeDepot.shell.theme()`

## Error on Missing Permission

When an app calls a method without the required permission:

```javascript
// DxError thrown:
{
  code: 'PERMISSION_DENIED',
  message: 'App "my-app" does not have "ai" permission',
  suggestion: 'Add "ai" to the permissions array in your manifest.json'
}
```

## Manifest Example

```json
{
  "permissions": ["ai", "storage.kv", "storage.db", "notifications"]
}
```

## Source

Permissions are defined in `packages/shared/src/permissions.ts`.

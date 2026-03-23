---
title: Configuring Permissions
description: How to declare and manage permissions in your VibeDepot app.
---

Every VibeDepot app must declare the permissions it needs in `manifest.json`. The shell enforces these permissions at runtime — if your app tries to use a Bridge API method without the required permission, the call fails with a `PERMISSION_DENIED` error.

## Declaring Permissions

Add permissions to the `permissions` array in your manifest:

```json
{
  "permissions": ["ai", "storage.kv", "storage.db", "notifications"]
}
```

## Permission Tiers

### Auto-Granted

These permissions are granted to every app automatically:

| Permission | What It Unlocks |
|---|---|
| `storage.kv` | Key-value storage (`vibeDepot.storage.*`) |

### Consent-Required

These permissions require the user to grant access:

| Permission | What It Unlocks |
|---|---|
| `ai` | AI provider access (`vibeDepot.ai.*`) |
| `storage.files` | File system storage |
| `storage.db` | SQLite database (`vibeDepot.db.*`) |
| `network` | External network requests |
| `clipboard` | Clipboard read/write |
| `notifications` | Desktop notifications (`vibeDepot.shell.notify()`) |

## Best Practices

### Declare Only What You Need

Request the minimum set of permissions your app actually uses. Reviewers check that declared permissions match actual usage during the publishing process.

### Always Declare `storage.kv`

Even though it's auto-granted, declaring `storage.kv` explicitly makes your manifest self-documenting:

```json
{
  "permissions": ["ai", "storage.kv"]
}
```

### Use Permission Scanning

The CLI validates that your declared permissions match your actual code usage:

```bash
vibedepot validate
```

The permission checker scans your source files for Bridge API calls and reports:
- **Undeclared** — You're using an API that requires a permission you haven't declared.
- **Unused** — You've declared a permission but don't appear to use it.

The `publish` command also auto-detects and adds missing permissions before bundling.

## What Happens Without a Permission

If your app calls a Bridge API method without the required permission:

```javascript
// App manifest has permissions: ["storage.kv"]
// But tries to use AI without declaring "ai"

try {
  await window.vibeDepot.ai.callAI({ messages: [...] });
} catch (err) {
  // err.code === 'PERMISSION_DENIED'
  // err.message === 'App "my-app" does not have "ai" permission'
  // err.suggestion === 'Add "ai" to the permissions array in your manifest.json'
}
```

### Dev Warnings for Sideloaded Apps

When developing with sideloading, VibeDepot shows a visual warning banner at the top of your app window when a permission is missing, instead of silently failing. This helps you catch issues during development.

## Permission-to-API Mapping

| Permission | Bridge API Methods |
|---|---|
| `ai` | `vibeDepot.ai.callAI()`, `vibeDepot.ai.streamAI()`, `vibeDepot.ai.getProvider()`, `vibeDepot.ai.getModel()`, `vibeDepot.ai.listProviders()` |
| `storage.kv` | `vibeDepot.storage.set()`, `.get()`, `.delete()`, `.keys()`, `.clear()` |
| `storage.db` | `vibeDepot.db.run()`, `.query()`, `.transaction()` |
| `notifications` | `vibeDepot.shell.notify()` |

The following Bridge methods require **no permission** and are always available:
- `vibeDepot.shell.getAppInfo()`
- `vibeDepot.shell.getVersion()`
- `vibeDepot.shell.openExternal()`
- `vibeDepot.shell.setTitle()`
- `vibeDepot.shell.theme()`

## Next Steps

- [Permissions Reference](/reference/permissions/) — Full permission table
- [Handling Errors](/guides/error-handling/) — Catching permission errors
- [Manifest Reference](/reference/manifest/) — All manifest fields

---
title: Permission System
description: How VibeDepot's permission system is designed, why it exists, and how enforcement works.
---

The permission system is VibeDepot's primary mechanism for controlling what apps can do. It follows the principle of least privilege — apps should only have access to the capabilities they actually need.

## Design Rationale

VibeDepot runs third-party code. Without permissions, any installed app could:
- Make AI calls (spending the user's API credits)
- Store unlimited data on disk
- Send desktop notifications
- Access the clipboard

The permission system puts the user in control by requiring apps to declare their needs upfront.

## Two-Tier Model

### Auto-Granted Permissions

Some capabilities are so fundamental that requiring consent would create unnecessary friction:

| Permission | Rationale |
|---|---|
| `storage.kv` | Basic state persistence. Without it, apps would lose all data on close. Nearly every app needs this. |

### Consent-Required Permissions

Capabilities that have cost, privacy, or annoyance implications require the user's awareness:

| Permission | Rationale |
|---|---|
| `ai` | Costs money (API credits). Users should know an app will make AI calls. |
| `storage.db` | Creates persistent SQLite databases. Higher storage impact than KV. |
| `storage.files` | File system access beyond the app's sandbox. |
| `network` | External network requests. Privacy and security implications. |
| `clipboard` | Reading/writing the clipboard. Privacy sensitive. |
| `notifications` | Desktop notifications. Can be disruptive. |

## Enforcement Mechanism

Permission enforcement happens at the IPC layer in the main process:

```
App calls vibeDepot.ai.callAI()
       │
       ▼
Preload sends IPC 'ai:call'
       │
       ▼
IPC handler in main process
       │
       ├── getAppIdFromEvent(event)
       │   Maps WebContents ID → app ID
       │
       ├── assertPermission(appId, 'ai')
       │   Reads app manifest, checks permissions array
       │   Throws PERMISSION_DENIED if not found
       │
       └── Execute handler logic
```

The `assertPermission()` function:
1. Loads the app's manifest (from memory for installed apps).
2. Checks if the required permission is in the `permissions` array.
3. If missing, throws a `DxError` with code `PERMISSION_DENIED`.

This check runs **before** any handler logic executes — an app without the right permission never reaches the actual implementation.

## Permission Declaration

Apps declare permissions in their `manifest.json`:

```json
{
  "permissions": ["ai", "storage.kv", "notifications"]
}
```

The CLI's `validate` command cross-references declared permissions against actual usage:

- **Undeclared usage** — Your code calls `vibeDepot.ai.callAI()` but `ai` isn't in permissions. Reported as a warning.
- **Unused declaration** — You declare `network` but never use it. Reported as a warning.

The `publish` command auto-fixes undeclared permissions by scanning source code and updating the manifest.

## Sideloaded App Behavior

During development with sideloading, permission enforcement still applies. However, instead of silently failing, sideloaded apps get a **visual dev warning** — a banner injected at the top of the app window indicating which permission is missing.

This makes permission issues visible during development without requiring a publish cycle to discover them.

## Future Considerations

The permission system is designed to be extensible. New permissions can be added to the `Permission` constant without breaking existing apps. Apps that don't declare new permissions simply can't access new capabilities.

## Next Steps

- [Security Model](/concepts/security-model/) — Broader security architecture
- [Configuring Permissions](/guides/permissions/) — Practical guide for developers
- [Permissions Reference](/reference/permissions/) — Complete permission table

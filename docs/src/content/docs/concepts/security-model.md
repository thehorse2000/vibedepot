---
title: Security Model
description: How VibeDepot isolates apps and protects users through sandboxing, permissions, and validation.
---

VibeDepot runs third-party code from the public registry. The security model ensures apps can only do what they declare, and users stay in control.

## Sandboxing

Every app runs in its own Electron BrowserWindow with these security settings:

- **Context isolation** — Enabled. The app's JavaScript runs in a separate context from the preload script. Apps cannot access Electron or Node.js APIs directly.
- **Node integration** — Disabled. Apps have no access to `require()`, `fs`, `child_process`, or any Node.js module.
- **Preload script** — The only bridge between the app and the main process. Exposes `window.vibeDepot` through Electron's `contextBridge`.

An app's entire surface area is:
1. Standard Web APIs (DOM, fetch, etc.)
2. `window.vibeDepot` Bridge API

Nothing else.

## Permission Enforcement

Apps declare required permissions in `manifest.json`. The main process enforces these at the IPC layer:

1. An app calls a Bridge API method (e.g., `vibeDepot.ai.callAI()`).
2. The preload script sends an IPC message to the main process.
3. The IPC handler looks up the calling app's ID from the WebContents.
4. It checks the app's manifest for the required permission.
5. If the permission is not declared, the call fails with `PERMISSION_DENIED`.

This enforcement happens in `shell/src/main/ipc/register.ts` via the `assertPermission()` function.

## Input Validation

All IPC parameters are validated with Zod schemas before processing:

- Message arrays must have valid `role` and `content` fields.
- Storage keys are limited to 256 characters.
- Notification titles max 256 characters, bodies max 1024.
- Temperature values must be between 0 and 2.
- URLs must be valid format.

Invalid parameters are rejected with an `INVALID_PARAMS` error before reaching any handler logic.

## SQL Allowlist

Apps with the `storage.db` permission can execute SQL, but only from an allowlist:

**Allowed:** `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`, `CREATE INDEX`, `ALTER TABLE`, `DROP TABLE`, `DROP INDEX`, `PRAGMA table_info`, `PRAGMA table_list`, `BEGIN`, `COMMIT`, `ROLLBACK`

**Blocked:** `ATTACH`, `DETACH`, `LOAD_EXTENSION`, and all other `PRAGMA` statements.

This prevents apps from attaching external databases, loading native extensions, or modifying SQLite configuration.

## API Key Security

API keys are stored in the OS keychain:

| Platform | Backend |
|---|---|
| macOS | Keychain |
| Windows | Credential Manager |
| Linux | Secret Service (libsecret) |

Keys are stored via the `keytar` package under the service name `vibedepot`. Apps never receive raw API keys — the main process makes API calls on behalf of apps. The Settings page only displays masked keys (first 8 + last 4 characters).

## Bundle Verification

When installing an app from the registry:

1. The shell downloads the ZIP bundle from the registry's GitHub URL.
2. It computes a SHA256 checksum of the downloaded file.
3. It compares the checksum against the value in `registry.json`.
4. If the checksums don't match, the installation is rejected.

This ensures the bundle hasn't been tampered with between publishing and installation.

## Registry Validation

Before an app enters the registry:

- **Schema validation** — The manifest must conform to the Zod schema.
- **API key scanning** — Source files are checked for hardcoded API key patterns.
- **Bundle size limits** — Apps must be under 5 MB.
- **CI enforcement** — GitHub Actions run validation on every PR.

## Data Isolation

Each app has its own storage namespace:

- **KV storage:** `~/.vibedepot/app-data/{appId}/store.json`
- **SQLite:** `~/.vibedepot/app-data/{appId}/database.sqlite`

Apps cannot access each other's data. The main process routes storage calls based on the calling app's ID.

## What Apps Cannot Do

- Access the filesystem
- Run shell commands or spawn processes
- Read other apps' data
- Access the OS keychain directly
- Make arbitrary IPC calls
- Load Node.js modules
- Modify the shell UI
- Execute blocked SQL statements

## Next Steps

- [Permission System](/concepts/permission-system/) — How permissions are designed and enforced
- [App Lifecycle](/concepts/app-lifecycle/) — How apps are installed, launched, and uninstalled
- [SQL Allowlist Reference](/reference/sql-allowlist/) — Complete SQL statement documentation

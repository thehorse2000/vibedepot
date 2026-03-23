---
title: App Lifecycle
description: How apps are installed, launched, updated, and uninstalled in VibeDepot.
---

Every VibeDepot app goes through a defined lifecycle managed by the shell's main process.

## Installation

When a user installs an app from the store:

```
Registry                    Main Process               Disk
   │                            │                        │
   │  1. Fetch registry.json    │                        │
   │ <──────────────────────────│                        │
   │                            │                        │
   │  2. Download ZIP bundle    │                        │
   │ <──────────────────────────│                        │
   │                            │                        │
   │                            │  3. Verify SHA256      │
   │                            │     checksum           │
   │                            │                        │
   │                            │  4. Extract ZIP        │
   │                            │ ──────────────────────>│
   │                            │     ~/.vibedepot/      │
   │                            │     apps/{appId}/      │
   │                            │                        │
   │                            │  5. Read manifest.json │
   │                            │ <──────────────────────│
   │                            │                        │
   │                            │  6. Update             │
   │                            │     installed-apps.json│
   │                            │ ──────────────────────>│
```

1. The registry client fetches `registry.json` (from cache or network).
2. The app manager downloads the ZIP bundle from the registry's GitHub raw URL.
3. A SHA256 checksum is computed and compared against `registry.json`.
4. If the checksum matches, the ZIP is extracted to `~/.vibedepot/apps/{appId}/`.
5. The `manifest.json` is read and validated.
6. The app's metadata is saved to `installed-apps.json`.

If the checksum doesn't match, installation is rejected.

## Launching

When a user launches an installed app:

1. **Create BrowserWindow** — The window manager creates a new Electron BrowserWindow with context isolation enabled and Node integration disabled.
2. **Load preload** — The app-preload script (`@vibedepot/app-preload`) runs in the window, exposing `window.vibeDepot`.
3. **Load entry** — The app's HTML entry file (from `manifest.entry`) is loaded into the window.
4. **Register mapping** — The WebContents ID is mapped to the app ID for permission enforcement.

The app is now running and can interact with the Bridge API.

## Running

While an app is running:

- **IPC calls** are routed through the preload → main process → handler chain.
- **Permissions** are checked on every IPC call.
- **Storage** operations target the app's isolated data directory.
- **AI calls** use the user's API keys from the OS keychain.

The shell renderer tracks running apps via the `runningAppIds` set in the app store.

## Closing

When an app window is closed (by the user or programmatically):

1. The window's `closed` event fires.
2. The window manager removes the WebContents → app ID mapping.
3. Any open SQLite database connections for the app are closed.
4. The shell renderer is notified to update the UI.

App data (KV storage, SQLite databases) persists after closing.

## Sideloading

Sideloaded apps follow a different installation path:

1. The user selects a local folder containing a `manifest.json`.
2. The shell validates the entry file exists.
3. The app is registered as sideloaded (not extracted from a ZIP).
4. A **file watcher** monitors the folder for changes.
5. On file changes (300ms debounce), the manifest is re-read and the window reloads.

Sideloaded apps are marked with a flag (`--sideloaded` passed via `additionalArguments`) so the preload can enable dev warnings.

## Uninstalling

When a user uninstalls an app:

1. If the app is running, its window is closed first.
2. The app bundle directory (`~/.vibedepot/apps/{appId}/`) is deleted.
3. The app's entry is removed from `installed-apps.json`.
4. Optionally, the app's data directory (`~/.vibedepot/app-data/{appId}/`) is removed.

## Updating

The shell detects available updates by comparing the installed version against the registry:

1. The Library page compares `installedApp.version` with `registryEntry.version`.
2. If the registry has a newer version, an update indicator appears.
3. Updating follows the same flow as installation — download, verify, extract — replacing the old bundle.

## Next Steps

- [Architecture Overview](/concepts/architecture/) — How the components fit together
- [Security Model](/concepts/security-model/) — Sandboxing and isolation details
- [Bridge API Design](/concepts/bridge-api-overview/) — How apps communicate with the shell

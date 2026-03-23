---
title: Architecture Overview
description: How VibeDepot is structured — monorepo layout, Electron processes, and data flow.
---

VibeDepot is a monorepo built with pnpm workspaces. It consists of an Electron desktop app, shared type packages, and a developer CLI.

## Monorepo Layout

```
vibedepot/
├── shell/                    @vibedepot/shell
│   └── src/
│       ├── main/             Electron main process
│       ├── preload/          Shell's preload script
│       └── renderer/         React UI
├── packages/
│   ├── shared/               @vibedepot/shared
│   ├── app-preload/          @vibedepot/app-preload
│   └── cli/                  @vibedepot/cli
└── registry/                 Separate git repo
```

| Package | Purpose |
|---|---|
| `@vibedepot/shell` | Electron desktop app — main process, React renderer, IPC handlers |
| `@vibedepot/shared` | Shared TypeScript types, Zod schemas, IPC channel definitions, permission constants |
| `@vibedepot/app-preload` | Preload script that exposes the `window.vibeDepot` Bridge API to sandboxed apps |
| `@vibedepot/cli` | Developer CLI for scaffolding, previewing, validating, and publishing apps |

## Electron Process Model

VibeDepot uses Electron's multi-process architecture:

```
┌─────────────────────────────────────────────┐
│                 Main Process                 │
│  ┌──────────┐ ┌────────────┐ ┌───────────┐  │
│  │   App    │ │  Registry  │ │    AI     │  │
│  │ Manager  │ │   Client   │ │ Providers │  │
│  └──────────┘ └────────────┘ └───────────┘  │
│  ┌──────────┐ ┌────────────┐ ┌───────────┐  │
│  │ Window   │ │    IPC     │ │  Storage  │  │
│  │ Manager  │ │  Handlers  │ │ & Keychain│  │
│  └──────────┘ └────────────┘ └───────────┘  │
└─────────────────┬───────────────┬───────────┘
                  │               │
        ┌─────────▼───────┐  ┌───▼──────────────┐
        │  Shell Renderer │  │   App Window(s)   │
        │  (React UI)     │  │  (Sandboxed)      │
        │                 │  │                    │
        │  Store page     │  │  window.vibeDepot  │
        │  Library page   │  │  ├── ai.*          │
        │  Settings page  │  │  ├── storage.*     │
        │  Publish page   │  │  ├── shell.*       │
        │                 │  │  └── db.*          │
        └─────────────────┘  └────────────────────┘
```

### Main Process

The main process (`shell/src/main/`) handles:

- **App Manager** — Install, uninstall, launch, and close apps. Downloads ZIP bundles from the registry, verifies checksums, extracts files.
- **Registry Client** — Fetches the app catalog from GitHub with a 3-tier caching strategy: in-memory → disk cache (1-hour TTL) → network. Falls back to stale cache when offline.
- **AI Providers** — Implements Anthropic, OpenAI, and Gemini providers. Each extends an abstract `AIProvider` class with `call()` and `stream()` methods.
- **Window Manager** — Creates and manages BrowserWindows for each running app. Maps WebContents IDs to app IDs for permission checking.
- **IPC Handlers** — Processes all IPC requests from both the shell renderer and app windows. Validates parameters with Zod and enforces permissions.
- **Storage** — Per-app KV storage (JSON files) and SQLite databases.
- **Keychain** — Stores API keys in the OS keychain via keytar.

### Shell Renderer

The shell renderer (`shell/src/renderer/`) is a React app that provides the user interface:

- **Store** — Browse and install apps from the registry with search and filtering.
- **Library** — Manage installed apps (launch, close, uninstall, update, sideload).
- **Settings** — Configure API keys and toggle Publisher Mode.
- **Publish** — Multi-step wizard for bundling and submitting apps.

State is managed with Zustand stores (`useAppStore`, `useSettingsStore`).

### App Windows

Each launched app runs in its own BrowserWindow with:
- **Context isolation** enabled
- **Node integration** disabled
- The **app-preload** script as the only bridge to the main process

Apps can only interact with VibeDepot through `window.vibeDepot`.

## Data Flow: AI Call

When an app calls `window.vibeDepot.ai.callAI()`:

```
App Window                  Main Process
    │                           │
    │  ipcRenderer.invoke       │
    │  'ai:call'                │
    │ ─────────────────────────>│
    │                           │ 1. Validate params (Zod)
    │                           │ 2. Check 'ai' permission
    │                           │ 3. Resolve provider
    │                           │ 4. Get API key from keychain
    │                           │ 5. Call provider SDK
    │                           │
    │  CallAIResponse           │
    │ <─────────────────────────│
    │                           │
```

## Build System

VibeDepot uses **electron-vite** (Vite-based) for the shell and **tsup** for the app-preload package:

1. `pnpm build:preload` — Builds `@vibedepot/app-preload` with tsup into a single CJS bundle
2. `pnpm build` — Builds preload first, then the shell (main + renderer) with electron-vite

The shared package (`@vibedepot/shared`) is bundled inline by consumers — it has no separate build step.

## Next Steps

- [Security Model](/concepts/security-model/) — How sandboxing and isolation work
- [App Lifecycle](/concepts/app-lifecycle/) — Install, launch, close, uninstall flows
- [Bridge API Design](/concepts/bridge-api-overview/) — Why the Bridge exists and how it works

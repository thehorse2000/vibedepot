# VibeDepot

Open-source desktop app store for AI-native applications. Built with Electron, React, and TypeScript.

## Quick Reference

```bash
pnpm dev            # Start Electron dev server
pnpm build          # Build preload + shell (production)
pnpm build:preload  # Build only the preload script
pnpm lint           # ESLint across all packages
```

Requires Node >=18 and pnpm. After cloning, run `pnpm install`.

## Architecture

**Monorepo** managed by pnpm workspaces (`pnpm-workspace.yaml`):

| Package | Path | Purpose |
|---------|------|---------|
| `@vibedepot/shell` | `shell/` | Electron desktop app — main process, React renderer, IPC handlers |
| `@vibedepot/shared` | `packages/shared/` | Shared types, Zod schemas, IPC channel definitions, permission constants |
| `@vibedepot/app-preload` | `packages/app-preload/` | Electron preload script — exposes `window.vibeDepot` Bridge API to sandboxed apps |

**Other directories:**

| Path | Purpose |
|------|---------|
| `registry/` | **Separate git repo** (`vibedepot-registry`) — public app catalog with its own CI. Gitignored from this repo. All apps live here. |

## Shell Structure (`shell/src/`)

- **`main/`** — Electron main process
  - `index.ts` — App entry, window creation
  - `appManager.ts` — App install/uninstall/launch/close lifecycle (downloads from registry, verifies checksums)
  - `registryClient.ts` — Fetches `registry.json` from GitHub, caches locally (1hr TTL), offline fallback
  - `zipExtractor.ts` — Pure Node.js ZIP extraction for app bundles
  - `appStorage.ts` — Per-app key-value storage
  - `keychain.ts` — OS keychain integration via keytar
  - `windowManager.ts` — BrowserWindow management
  - `providers/` — AI provider implementations (Anthropic, OpenAI, Gemini) extending abstract `AIProvider`
  - `ipc/` — IPC handlers with permission checking (`register.ts` is the central registration point)
- **`preload/`** — Shell's own preload (distinct from app-preload)
- **`renderer/`** — React UI
  - `pages/` — Store (browse/install), Library (manage installed), Settings (API keys)
  - `components/` — AppCard, StoreAppCard, AppDetailModal, Sidebar, ApiKeyForm
  - `store/` — Zustand stores (useAppStore, useSettingsStore)

## Bridge API

Apps run in isolated BrowserWindows with context isolation enabled. They interact with the shell exclusively through `window.vibeDepot`:

```
vibeDepot.ai       — callAI(), streamAI(), getProvider(), getModel(), listProviders()
vibeDepot.storage  — set(), get(), delete(), keys(), clear()
vibeDepot.shell    — getAppInfo(), getVersion(), openExternal(), notify(), setTitle(), theme()
```

Defined in `packages/app-preload/src/`. Types in `packages/shared/src/bridge.types.ts`.

## IPC Channels

All IPC goes through channels defined in `packages/shared/src/ipc-channels.ts` with Zod validation in `ipc-schemas.ts`. Key channel groups: `ai:*`, `storage:*`, `keys:*`, `shell:*`, `app:*`, `store:*`.

Permission enforcement happens in `shell/src/main/ipc/register.ts` — handlers check the calling app's declared permissions before processing.

## Permissions

Defined in `packages/shared/src/permissions.ts`:
- **Auto-granted:** `storage.kv`
- **Requires consent:** `storage.files`, `storage.db`, `network`, `clipboard`, `notifications`
- **Always declared:** `ai`

## App Manifest

`packages/shared/src/manifest.types.ts` defines `AppManifest`. Key fields: `id` (kebab-case), `name`, `version` (semver), `description`, `entry` (HTML file), `permissions[]`, `models.providers[]`, `category`.

Categories: `productivity`, `writing`, `coding`, `files`, `research`, `data`, `media`, `integrations`, `utilities`, `fun`.

## Registry (Separate Repo)

Lives in `registry/` as an independent git repo (github: `thehorse2000/vibedepot-registry`). Has its own standalone Zod schemas (doesn't import from `packages/shared`), validation script, and index builder.

```bash
cd registry && npm install
npm run validate      # Validate all apps in registry/apps/
npm run build-index   # Rebuild registry.json
```

Uses `tsx` to run TypeScript scripts directly. GitHub Actions run validation on PRs and auto-publish `registry.json` on merge to main.

## Tech Stack

- **Desktop:** Electron 28, electron-vite
- **Frontend:** React 18, Tailwind CSS 3, Zustand
- **AI SDKs:** @anthropic-ai/sdk, openai, @google/generative-ai
- **Security:** keytar (OS keychain), context isolation, permission system
- **Validation:** Zod
- **Build:** electron-vite (Vite-based), tsup (preload), pnpm workspaces

## Key Conventions

- TypeScript strict mode everywhere (`tsconfig.base.json`)
- ES2022 target, ESNext modules, bundler module resolution
- Shared types live in `packages/shared` — both shell and preload depend on it
- Build preload before shell (`pnpm build` handles ordering)
- No test framework configured yet

---
title: Installation
description: How to install and run VibeDepot locally for development.
---

## Prerequisites

- **Node.js** >= 18
- **pnpm** (install with `npm install -g pnpm`)
- **Git**

## Clone and Install

```bash
git clone https://github.com/thehorse2000/vibedepot.git
cd vibedepot
pnpm install
```

This installs dependencies for all workspace packages: the Electron shell, shared types, and the app preload script.

## Start the Dev Server

```bash
pnpm dev
```

This launches the Electron app in development mode with hot module replacement for the renderer.

## Build for Production

```bash
pnpm build
```

This builds the preload script first, then the shell (Electron main + renderer). The build order is handled automatically.

## Other Commands

| Command | Description |
|---|---|
| `pnpm build:preload` | Build only the preload script |
| `pnpm lint` | Run ESLint across all packages |

## Project Structure

After cloning, the monorepo has this layout:

```
vibedepot/
├── shell/                  # Electron desktop app
│   └── src/
│       ├── main/           # Main process (IPC, providers, app management)
│       ├── preload/        # Shell's own preload script
│       └── renderer/       # React UI (store, library, settings)
├── packages/
│   ├── shared/             # Types, schemas, IPC channels, permissions
│   ├── app-preload/        # Preload script for sandboxed apps
│   └── cli/                # Developer CLI (init, validate, publish)
├── registry/               # Separate git repo — public app catalog
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Data Storage Locations

VibeDepot stores data in the Electron `userData` directory:

| Platform | Path |
|---|---|
| macOS | `~/Library/Application Support/vibedepot/` |
| Windows | `%APPDATA%/vibedepot/` |
| Linux | `~/.config/vibedepot/` |

Within that directory:

```
vibedepot/
├── apps/                   # Installed app bundles
│   └── {appId}/
│       ├── manifest.json
│       └── index.html
├── app-data/               # Per-app data
│   └── {appId}/
│       ├── store.json      # KV storage
│       └── database.sqlite # SQLite database
├── installed-apps.json     # App metadata
└── registry-cache.json     # Cached registry (1-hour TTL)
```

API keys are stored securely in the OS keychain (macOS Keychain, Windows Credential Manager, or Linux Secret Service).

## Installing the CLI

The VibeDepot CLI is a separate package for app development:

```bash
npm install -g @vibedepot/cli
```

Verify the installation:

```bash
vibedepot --version
```

See [Using the CLI](/guides/using-the-cli/) for all available commands.

## Next Steps

- [Quick Start: Users](/getting-started/quick-start-user/) — Browse and install apps
- [Quick Start: Developers](/getting-started/quick-start-developer/) — Build your first app

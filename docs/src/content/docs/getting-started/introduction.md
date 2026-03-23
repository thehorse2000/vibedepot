---
title: What is VibeDepot?
description: An overview of VibeDepot — the open-source desktop app store for AI-native applications.
---

VibeDepot is an open-source desktop application that lets you **browse, install, and run AI-powered apps** in a secure, sandboxed environment. It also provides a complete toolkit for **building and publishing** your own AI apps.

## Key Features

- **App Store** — Browse a community-driven registry of AI apps, install with one click, and launch them in isolated windows.
- **AI Providers** — Built-in support for Anthropic (Claude), OpenAI (GPT), and Google Gemini. Users bring their own API keys.
- **Bridge API** — Apps communicate with the shell through `window.vibeDepot`, a secure API surface with four namespaces: AI, storage, shell, and database.
- **Permission System** — Apps declare what they need. Basic storage is auto-granted; AI, database, network, clipboard, and notifications require consent.
- **Developer CLI** — Scaffold, preview, validate, and publish apps from the command line.
- **Sandboxed Security** — Every app runs in its own Electron BrowserWindow with context isolation, no Node.js access, and SQL allowlists.

## Who is this for?

### End Users

Install VibeDepot, add your API keys in Settings, and start using AI apps from the store. No coding required.

**Start here:** [Quick Start: Users](/getting-started/quick-start-user/)

### App Developers

Build AI-native apps using HTML, CSS, and JavaScript. The Bridge API handles AI calls, storage, and system integration. Publish to the registry for the community.

**Start here:** [Quick Start: Developers](/getting-started/quick-start-developer/)

### Contributors

VibeDepot is MIT-licensed and built with Electron, React, TypeScript, and Zustand. Contributions to the shell, shared packages, CLI, and registry are welcome.

**Start here:** [Architecture Overview](/concepts/architecture/)

## Tech Stack

| Technology | Role |
|---|---|
| Electron 28 | Desktop shell and app sandboxing |
| React 18 | Shell UI (store, library, settings) |
| TypeScript | Strict mode across all packages |
| Zustand | State management in the renderer |
| Tailwind CSS 3 | Styling |
| Zod | Schema validation for IPC and manifests |
| keytar | OS keychain for API key storage |
| better-sqlite3 | Per-app SQLite databases |

## Next Steps

- [Installation](/getting-started/installation/) — Get the project running locally
- [Building Your First App](/guides/building-your-first-app/) — Create an AI app from scratch
- [Bridge API Reference](/reference/bridge-api/) — Complete API documentation

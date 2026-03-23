---
title: "Quick Start: Users"
description: Browse the store, install an app, configure your API keys, and launch your first AI app.
---

This guide walks you through using VibeDepot as an end user — from opening the app to running your first AI-powered application.

## 1. Launch VibeDepot

After [installing](/getting-started/installation/) and running `pnpm dev`, the VibeDepot desktop app opens. You'll see the **Store** page by default.

## 2. Configure an API Key

Before using AI apps, you need to add at least one API key.

1. Click **Settings** in the sidebar.
2. Enter your API key for one or more providers:
   - **Anthropic** — Get a key at [console.anthropic.com](https://console.anthropic.com/)
   - **OpenAI** — Get a key at [platform.openai.com](https://platform.openai.com/)
   - **Gemini** — Get a key at [aistudio.google.com](https://aistudio.google.com/)
3. Click **Save**. Your key is stored in the OS keychain — never in plain text.

## 3. Browse the Store

Switch to the **Store** page to browse available apps:

- **Search** by name, keywords, or description using the search bar.
- **Filter** by category (productivity, writing, coding, etc.) or AI provider.
- **Featured apps** appear in the carousel at the top.

## 4. Install an App

1. Click on an app card to see its details — description, permissions, supported providers, and screenshots.
2. Click **Install**. VibeDepot downloads the app bundle and verifies its checksum.
3. The app appears in your **Library**.

## 5. Launch an App

1. Switch to the **Library** page.
2. Click **Launch** on any installed app.
3. The app opens in its own window, sandboxed from the rest of your system.
4. To close, click the window's close button or use **Close** in the Library.

## 6. Manage Apps

From the Library page, you can:

- **Launch / Close** — Start or stop running apps.
- **Uninstall** — Remove an app and optionally its stored data.
- **Update** — If a newer version is available in the registry, an update indicator appears.

## Theme

Use the theme toggle in the sidebar to switch between light and dark mode. Apps can read the current theme via the Bridge API.

## Next Steps

- [Quick Start: Developers](/getting-started/quick-start-developer/) — Build your own app
- [What is VibeDepot?](/getting-started/introduction/) — Learn more about the project

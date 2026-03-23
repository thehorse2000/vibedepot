<p align="center">
  <h1 align="center">VibeDepot</h1>
  <p align="center">
    The open-source desktop app store for AI-native applications.
    <br />
    <a href="https://github.com/thehorse2000/vibedepot/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/thehorse2000/vibedepot/issues">Request Feature</a>
  </p>
</p>

---

VibeDepot is a desktop app store where users can browse, install, and run sandboxed AI-powered applications. Developers can build apps using plain HTML/CSS/JS and a unified Bridge API that handles AI calls, storage, and system integration — then publish them to a community-driven registry.

## Features

- **AI Providers** — First-class support for Anthropic (Claude), OpenAI (GPT), and Google Gemini. Users bring their own API keys, stored securely in the OS keychain.
- **Sandboxed Apps** — Every app runs in an isolated Electron BrowserWindow with context isolation. No Node.js access, no filesystem access — only the Bridge API.
- **Bridge API** — `window.vibeDepot` provides AI calls, key-value storage, SQLite databases, desktop notifications, and theme detection.
- **Permission System** — Apps declare what they need. `storage.kv` is auto-granted; `ai`, `storage.db`, `network`, `clipboard`, and `notifications` require consent.
- **Public Registry** — A community-driven app catalog on GitHub. Submit apps via PR, and they become available to all VibeDepot users.
- **Developer CLI** — Scaffold, preview, validate, and publish apps from the command line.
- **Sideloading** — Load apps from local folders during development with hot reload on file changes.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### Install & Run

```bash
git clone https://github.com/thehorse2000/vibedepot.git
cd vibedepot
pnpm install
pnpm dev
```

### Build for Production

```bash
pnpm build
```

## Project Structure

VibeDepot is a monorepo managed by pnpm workspaces.

```
vibedepot/
├── shell/                    # Electron desktop app
│   └── src/
│       ├── main/             #   Main process — IPC handlers, AI providers, app management
│       ├── preload/          #   Shell preload script
│       └── renderer/         #   React UI — Store, Library, Settings, Publish pages
├── packages/
│   ├── shared/               # Shared TypeScript types, Zod schemas, IPC channels
│   ├── app-preload/          # Preload script exposing window.vibeDepot to sandboxed apps
│   └── cli/                  # Developer CLI (vibedepot init/preview/validate/publish)
├── registry/                 # Separate git repo — public app catalog
├── docs/                     # Documentation site (Astro Starlight)
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

| Package | Path | Description |
|---------|------|-------------|
| `@vibedepot/shell` | `shell/` | Electron main process, React renderer, IPC handlers |
| `@vibedepot/shared` | `packages/shared/` | Types, Zod schemas, IPC channel definitions, permissions |
| `@vibedepot/app-preload` | `packages/app-preload/` | Preload script — exposes Bridge API to sandboxed apps |
| `@vibedepot/cli` | `packages/cli/` | CLI for scaffolding, validating, and publishing apps |

## Bridge API

Apps interact with VibeDepot through `window.vibeDepot`:

```javascript
// AI — call any supported provider
const response = await window.vibeDepot.ai.callAI({
  messages: [{ role: 'user', content: 'Hello!' }]
});

// Streaming
await window.vibeDepot.ai.streamAI(
  { messages: [{ role: 'user', content: 'Write a poem.' }] },
  (chunk) => console.log(chunk)
);

// Storage — per-app key-value store
await window.vibeDepot.storage.set('key', { any: 'value' });
const data = await window.vibeDepot.storage.get('key');

// SQLite — per-app database (requires storage.db permission)
await window.vibeDepot.db.run('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT)');
const rows = await window.vibeDepot.db.query('SELECT * FROM notes');

// Shell — system integration
const theme = await window.vibeDepot.shell.theme();       // 'light' | 'dark'
await window.vibeDepot.shell.notify('Done', 'Task complete.');
await window.vibeDepot.shell.openExternal('https://example.com');
```

## Building an App

```bash
# Install the CLI
npm install -g @vibedepot/cli

# Scaffold a new app
vibedepot init my-app

# Preview with hot reload
cd my-app
vibedepot preview

# Validate before publishing
vibedepot validate

# Bundle and submit to the registry
vibedepot publish
```

### App Manifest

Every app needs a `manifest.json`:

```json
{
  "id": "my-app",
  "name": "My App",
  "version": "0.1.0",
  "description": "An AI-powered app.",
  "author": "your-name",
  "entry": "index.html",
  "category": "productivity",
  "permissions": ["ai", "storage.kv"],
  "models": {
    "required": true,
    "providers": ["anthropic", "openai", "gemini"]
  }
}
```

### CLI Templates

| Template | Description |
|----------|-------------|
| `vanilla` | Plain HTML/CSS/JS starter |
| `react` | React with Vite |
| `chat` | Chat interface |
| `file-processor` | File handling app |
| `api-integration` | External API integration |

## Architecture

```
┌──────────────────────────────────────────────┐
│                Main Process                   │
│  App Manager · Registry Client · AI Providers │
│  Window Manager · IPC Handlers · Storage      │
└──────────┬──────────────────────┬────────────┘
           │                      │
  ┌────────▼────────┐   ┌────────▼──────────┐
  │  Shell Renderer  │   │  App Window(s)    │
  │  React UI        │   │  Sandboxed        │
  │                  │   │  window.vibeDepot  │
  │  Store           │   │  ├── ai.*         │
  │  Library         │   │  ├── storage.*    │
  │  Settings        │   │  ├── shell.*      │
  │  Publish         │   │  └── db.*         │
  └──────────────────┘   └───────────────────┘
```

**Data flow:** App → Preload (contextBridge) → IPC → Main Process → Zod validation → Permission check → Handler → AI SDK / Storage / Keychain

## Security

- **Context isolation** — Apps run in a separate JavaScript context. No access to Node.js, Electron APIs, or the filesystem.
- **Permission enforcement** — Every IPC call is checked against the app's declared permissions before execution.
- **Input validation** — All parameters are validated with Zod schemas at the IPC boundary.
- **SQL allowlisting** — Only safe SQL statements are permitted (SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, etc.). ATTACH, LOAD_EXTENSION, and most PRAGMAs are blocked.
- **Bundle verification** — SHA256 checksums are verified on app installation.
- **Keychain storage** — API keys are stored in the OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service).

## Tech Stack

| Technology | Role |
|------------|------|
| [Electron 28](https://www.electronjs.org/) | Desktop shell and app sandboxing |
| [React 18](https://react.dev/) | Shell UI |
| [TypeScript](https://www.typescriptlang.org/) | Strict mode across all packages |
| [Tailwind CSS 3](https://tailwindcss.com/) | Styling |
| [Zustand](https://zustand-demo.pmnd.rs/) | State management |
| [Zod](https://zod.dev/) | Schema validation |
| [electron-vite](https://electron-vite.org/) | Build system |
| [keytar](https://github.com/nicedoc/keytar) | OS keychain integration |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Per-app SQLite databases |
| [Anthropic SDK](https://docs.anthropic.com/en/api/client-sdks) | Claude AI provider |
| [OpenAI SDK](https://platform.openai.com/docs) | GPT AI provider |
| [Google Generative AI](https://ai.google.dev/) | Gemini AI provider |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Electron dev server with HMR |
| `pnpm build` | Build preload + shell for production |
| `pnpm build:preload` | Build only the preload script |
| `pnpm lint` | Run ESLint across all packages |

## The Registry

The app registry lives in a [separate repository](https://github.com/thehorse2000/vibedepot-registry). It contains app source files, release bundles, validation scripts, and the auto-generated `registry.json` catalog.

**For developers:**
```bash
vibedepot validate   # Check your app
vibedepot publish    # Bundle and open a GitHub PR
```

**For registry maintainers:**
```bash
cd registry
npm install
npm run validate      # Validate all apps
npm run build-index   # Rebuild registry.json
```

## Documentation

Full documentation is available in the `docs/` directory, built with [Astro Starlight](https://starlight.astro.build/):

```bash
cd docs
npm install
npm run dev     # http://localhost:4321
```

Covers: getting started, guides for building apps, architecture concepts, and complete API reference.

## Contributing

Contributions are welcome! Areas where help is needed:

- **Apps** — Build and publish apps to the registry
- **Shell** — UI improvements, new features, bug fixes
- **Bridge API** — New capabilities for sandboxed apps
- **CLI** — Additional commands and templates
- **Documentation** — Tutorials, guides, and examples

## License

MIT

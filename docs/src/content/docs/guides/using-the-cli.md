---
title: Using the CLI
description: Reference for all VibeDepot CLI commands — init, preview, validate, and publish.
---

The VibeDepot CLI (`@vibedepot/cli`) is a command-line tool for scaffolding, testing, and publishing apps.

## Installation

```bash
npm install -g @vibedepot/cli
```

## Commands

### `vibedepot init [name]`

Scaffold a new VibeDepot app with an interactive wizard.

```bash
vibedepot init my-app
```

**Prompts:**
- **App name** — If not provided as an argument, the CLI asks for it.
- **Category** — Choose from: `productivity`, `writing`, `coding`, `files`, `research`, `data`, `media`, `integrations`, `utilities`, `fun`.
- **Template** — Choose a starter template.

**Templates:**

| Template | Description | Default Permissions |
|---|---|---|
| `vanilla` | Plain HTML/CSS/JS | `storage.kv` |
| `react` | React with Vite | `ai`, `storage.kv` |
| `chat` | Chat interface | `ai`, `storage.kv` |
| `file-processor` | File handling app | `ai`, `storage.kv`, `storage.files` |
| `api-integration` | External API app | `ai`, `storage.kv`, `network` |

**Output:**
```
my-app/
├── manifest.json    # Pre-filled with your choices
└── index.html       # Template-specific starter code
```

For the `react` template, additional files and a `package.json` are included. Run `npm install` and `npm run build` before previewing.

---

### `vibedepot preview [path]`

Preview your app in VibeDepot via sideloading.

```bash
vibedepot preview           # Current directory
vibedepot preview ./my-app  # Specific path
```

**Behavior:**
- **macOS** — Opens VibeDepot.app with a `--sideload` argument.
- **Linux** — Runs `vibedepot-shell --sideload`.
- **Windows / Fallback** — Prints manual sideloading instructions.

Changes to your app files auto-reload in the running window.

**Requirements:**
- A valid `manifest.json` must exist in the target directory.
- VibeDepot must be installed and running.

---

### `vibedepot validate [path]`

Validate your app against all publishing requirements.

```bash
vibedepot validate           # Current directory
vibedepot validate ./my-app  # Specific path
```

**Checks performed:**

| # | Check | Status on Failure |
|---|---|---|
| 1 | Manifest schema | Fail |
| 2 | Entry file exists | Fail |
| 3 | Bundle size ≤ 5 MB | Fail |
| 4 | No hardcoded API keys | Fail |
| 5 | Permissions match source usage | Warn |
| 6 | Valid semver version | Fail |
| 7 | Kebab-case app ID | Fail |
| 8 | Thumbnail exists | Warn |

**Exit codes:**
- `0` — All checks pass (warnings are OK)
- `1` — One or more checks failed

**Example output:**
```
Validation Results:

  ✓ Manifest schema: Valid manifest.json
  ✓ Entry file: Found index.html
  ✓ Bundle size: 0.12 MB
  ✓ API key scan: No hardcoded keys found
  ⚠ Permissions: Unused: network
  ✓ Version: v0.1.0
  ✓ App ID: my-app
  ⚠ Thumbnail: No thumbnail (optional)
```

---

### `vibedepot publish [path]`

Bundle and submit your app to the registry.

```bash
vibedepot publish           # Current directory
vibedepot publish ./my-app  # Specific path
```

**Steps performed:**

1. **Permission auto-detection** — Scans source code for Bridge API usage. If permissions are used but not declared, they're automatically added to `manifest.json`.
2. **Validation** — Runs all 8 checks from `vibedepot validate`.
3. **Bundle creation** — Creates a ZIP file and computes a SHA256 checksum.
4. **GitHub PR** — Opens your browser with a pre-filled PR URL.

**Output:**
```
Validating...

  ✓ Manifest schema: Valid manifest.json
  ✓ Entry file: Found index.html
  ...

Creating bundle...
  Bundle: /path/to/my-app-0.1.0.zip
  Checksum: a1b2c3d4...

Opening GitHub...

✓ Done! Follow the instructions in your browser to create the pull request.
  Bundle location: /path/to/my-app-0.1.0.zip
```

## Next Steps

- [Building Your First App](/guides/building-your-first-app/) — Full app tutorial
- [Publishing to the Registry](/guides/publishing/) — The complete publishing workflow
- [Manifest Reference](/reference/manifest/) — All manifest fields

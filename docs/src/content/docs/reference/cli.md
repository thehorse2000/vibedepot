---
title: CLI Commands Reference
description: Complete reference for all VibeDepot CLI commands — init, preview, validate, and publish.
---

The VibeDepot CLI (`@vibedepot/cli`) provides four commands for app development and publishing.

## Installation

```bash
npm install -g @vibedepot/cli
```

## `vibedepot init [name]`

Scaffold a new VibeDepot app.

**Usage:**
```bash
vibedepot init              # Interactive prompt for name
vibedepot init my-app       # Use "my-app" as the name
```

**Interactive prompts:**

| Prompt | Options |
|---|---|
| App name | Free text (if not provided as argument) |
| Category | `productivity`, `writing`, `coding`, `files`, `research`, `data`, `media`, `integrations`, `utilities`, `fun` |
| Template | `vanilla`, `react`, `chat`, `file-processor`, `api-integration` |

**Templates:**

| Template | Files Created | Permissions |
|---|---|---|
| `vanilla` | `index.html`, `manifest.json` | `storage.kv` |
| `react` | React project with `package.json`, Vite config | `ai`, `storage.kv` |
| `chat` | Chat UI template | `ai`, `storage.kv` |
| `file-processor` | File handling template | `ai`, `storage.kv`, `storage.files` |
| `api-integration` | API integration template | `ai`, `storage.kv`, `network` |

**Generated manifest:**
- `id` — Derived from the name (lowercased, non-alphanumeric replaced with hyphens)
- `name` — Title-cased version of the name
- `version` — `0.1.0`
- `entry` — `index.html` (or `dist/index.html` for React template)
- `models` — Included if template uses AI, with all three providers

**Post-creation steps (React template):**
```bash
cd my-app
npm install
npm run build
```

---

## `vibedepot preview [path]`

Preview your app in VibeDepot via sideloading.

**Usage:**
```bash
vibedepot preview            # Current directory
vibedepot preview ./my-app   # Specific path
```

**Requirements:**
- A `manifest.json` must exist in the target directory
- VibeDepot must be installed

**Platform behavior:**

| Platform | Behavior |
|---|---|
| macOS | Runs `open -a "VibeDepot" --args --sideload="{path}"` |
| Linux | Runs `vibedepot-shell --sideload="{path}"` |
| Windows | Prints manual sideloading instructions |

If the app can't be opened automatically, manual instructions are displayed.

**Features:**
- File changes auto-reload in the running app window
- No restart needed — save and see updates immediately

---

## `vibedepot validate [path]`

Validate your app against all publishing requirements.

**Usage:**
```bash
vibedepot validate            # Current directory
vibedepot validate ./my-app   # Specific path
```

**Checks:**

| # | Check | Fail/Warn | What It Checks |
|---|---|---|---|
| 1 | Manifest schema | Fail | All required fields present, correct types, valid values |
| 2 | Entry file | Fail | The file at `manifest.entry` exists on disk |
| 3 | Bundle size | Fail | Total folder size ≤ 5 MB |
| 4 | API key scan | Fail | No strings matching API key patterns in source files |
| 5 | Permissions | Warn | Declared permissions match Bridge API usage in source |
| 6 | Version | Fail | `manifest.version` is valid semver (`X.Y.Z`) |
| 7 | App ID | Fail | `manifest.id` is kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`) |
| 8 | Thumbnail | Warn | `manifest.thumbnail` file exists (optional) |

**Exit codes:**
- `0` — All checks pass (warnings are OK)
- `1` — One or more checks failed

**Output format:**
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

## `vibedepot publish [path]`

Bundle and submit your app to the registry.

**Usage:**
```bash
vibedepot publish            # Current directory
vibedepot publish ./my-app   # Specific path
```

**Steps performed:**

1. **Permission auto-detection** — Scans source for Bridge API calls and adds undeclared permissions to `manifest.json` automatically.
2. **Validation** — Runs all 8 checks from `validate`. Aborts on any failure.
3. **Bundle creation** — Creates a ZIP file named `{id}-{version}.zip` and computes a SHA256 checksum.
4. **Open PR** — Constructs a GitHub PR URL and opens it in the default browser.

**Output:**
```
Auto-adding detected permissions: notifications

Validating...

  ✓ Manifest schema: Valid manifest.json
  ...

Creating bundle...
  Bundle: /path/to/my-app-0.1.0.zip
  Checksum: a1b2c3d4e5f6...

Opening GitHub...

✓ Done! Follow the instructions in your browser to create the pull request.
  Bundle location: /path/to/my-app-0.1.0.zip
```

## Global Options

```bash
vibedepot --version    # Print CLI version
vibedepot --help       # Show help
vibedepot <cmd> --help # Show help for a specific command
```

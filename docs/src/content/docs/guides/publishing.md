---
title: Publishing to the Registry
description: How to bundle, validate, and submit your app to the VibeDepot public registry.
---

The VibeDepot registry is a community-driven app catalog hosted on GitHub. Publishing your app makes it available to every VibeDepot user.

## Overview

The publishing process:

1. **Validate** your app locally
2. **Publish** via CLI — creates a bundle and opens a GitHub PR
3. **Review** — registry maintainers review your PR
4. **Merge** — CI auto-publishes `registry.json` on merge to main

## Step 1: Validate

Run the validator to catch issues before publishing:

```bash
cd my-app
vibedepot validate
```

All 8 checks must pass (warnings are OK):

| Check | Pass Criteria |
|---|---|
| Manifest schema | Valid against the Zod schema |
| Entry file | `manifest.entry` file exists |
| Bundle size | Total size ≤ 5 MB |
| API key scan | No hardcoded API key patterns found in source |
| Permissions | Declared permissions match usage in source |
| Version | Valid semver (e.g. `1.0.0`) |
| App ID | Kebab-case format (e.g. `my-app`) |
| Thumbnail | File exists at `manifest.thumbnail` path (warning only) |

## Step 2: Publish

```bash
vibedepot publish
```

This command:

1. **Auto-detects permissions** — Scans your source for Bridge API usage and adds any undeclared permissions to your manifest.
2. **Validates** — Runs the same checks as `vibedepot validate`.
3. **Creates a bundle** — Zips your app folder and computes a SHA256 checksum.
4. **Opens GitHub** — Constructs a PR URL and opens it in your browser.

The bundle ZIP is saved locally so you can attach it to the PR.

## Step 3: Create the PR

In your browser, GitHub's PR creation page opens pre-filled. You need to:

1. Fork the [vibedepot-registry](https://github.com/thehorse2000/vibedepot-registry) repo if you haven't already.
2. Add your app files to `apps/{your-app-id}/`:
   - `manifest.json`
   - Your app files (HTML, CSS, JS, images)
   - `releases/{version}.zip` (the bundle from step 2)
3. Submit the pull request.

## What Reviewers Look For

- **Valid manifest** — Schema passes, all required fields present
- **No security issues** — No hardcoded keys, no malicious code
- **Reasonable permissions** — Only requests what the app actually uses
- **Working app** — Entry file loads, basic functionality works
- **Bundle size** — Under 5 MB

## Registry Structure

The registry repo has this layout:

```
vibedepot-registry/
├── apps/
│   └── {app-id}/
│       ├── manifest.json
│       ├── index.html
│       ├── thumbnail.png
│       └── releases/
│           └── 0.1.0.zip
├── schemas/                # Zod validation schemas
├── scripts/                # validate.ts, build-index.ts
├── registry.json           # Auto-generated catalog
└── package.json
```

## CI Pipeline

On every PR:
- **Validation** runs against all app manifests
- Schema checks, entry file checks, and ID uniqueness are enforced

On merge to main:
- **Index builder** regenerates `registry.json` from all app manifests
- Computes checksums, bundle URLs, and metadata

## Updating Your App

To publish an update:

1. Bump the `version` in your `manifest.json`.
2. Run `vibedepot publish` again.
3. Submit a new PR with the updated files and release ZIP.

## Next Steps

- [Using the CLI](/guides/using-the-cli/) — All CLI commands in detail
- [Manifest Reference](/reference/manifest/) — Complete manifest field documentation
- [Registry Entry Format](/reference/registry-entry/) — What registry.json contains

---
title: The App Registry
description: How the VibeDepot public app registry works — structure, validation, caching, and publishing.
---

The VibeDepot registry is a community-driven catalog of apps hosted as a separate GitHub repository. It's the source of truth for what apps are available in the store.

## How It Works

The registry is a GitHub repo ([vibedepot-registry](https://github.com/thehorse2000/vibedepot-registry)) containing:

1. **App source files** — Each app lives in `apps/{app-id}/` with a manifest, entry HTML, and assets.
2. **Release bundles** — ZIP files in `apps/{app-id}/releases/{version}.zip`.
3. **Validation scripts** — TypeScript scripts that validate all apps against Zod schemas.
4. **Registry index** — An auto-generated `registry.json` containing metadata for every published app.

## Registry Structure

```
vibedepot-registry/
├── apps/
│   ├── email-writer/
│   │   ├── manifest.json
│   │   ├── index.html
│   │   ├── thumbnail.png
│   │   └── releases/
│   │       └── 0.1.0.zip
│   └── code-reviewer/
│       ├── manifest.json
│       └── ...
├── schemas/
│   ├── manifest.schema.ts
│   └── registry-entry.schema.ts
├── scripts/
│   ├── validate.ts
│   └── build-index.ts
├── registry.json           # Auto-generated
└── package.json
```

## The `registry.json` File

This is the file the VibeDepot shell fetches to populate the store. It's an array of `RegistryEntry` objects:

```json
[
  {
    "id": "email-writer",
    "name": "Email Writer",
    "version": "0.1.0",
    "description": "AI-powered email drafting assistant.",
    "author": "vibedepot",
    "category": "productivity",
    "keywords": ["email", "writing", "ai"],
    "permissions": ["ai", "storage.kv"],
    "providers": ["anthropic", "openai", "gemini"],
    "thumbnail": "thumbnail.png",
    "bundle": "https://raw.githubusercontent.com/.../0.1.0.zip",
    "checksum": "a1b2c3d4e5f6...",
    "installs": 0,
    "updatedAt": "2025-01-15T12:00:00Z",
    "featured": false
  }
]
```

See the [Registry Entry Reference](/reference/registry-entry/) for all fields.

## CI Pipeline

### On Pull Requests

GitHub Actions runs the validation script (`npm run validate`):

- Schema validation for every app manifest
- Entry file existence checks
- API key pattern scanning
- App ID uniqueness across the registry

PRs that fail validation cannot be merged.

### On Merge to Main

The index builder (`npm run build-index`) runs automatically:

1. Reads every app's `manifest.json`
2. Computes SHA256 checksums for release ZIPs
3. Generates GitHub raw content URLs for bundles
4. Outputs the updated `registry.json`

## Caching Strategy

The VibeDepot shell uses a three-tier caching strategy for registry data:

### 1. Memory Cache

During a session, the registry is cached in memory. No disk or network access needed for subsequent requests.

### 2. Disk Cache (1-Hour TTL)

The registry is saved to `~/.vibedepot/registry-cache.json` with a timestamp. If the cache is less than 1 hour old, it's used directly. If it's fresh from disk, a background refresh is triggered.

### 3. Network Fetch

If the disk cache is stale or missing, the shell fetches `registry.json` from GitHub.

### Offline Fallback

If the network is unavailable, the shell uses the stale disk cache rather than showing an empty store. Users see the last-known catalog until connectivity is restored.

## Publishing Flow

From an app developer's perspective:

1. Run `vibedepot validate` to check your app.
2. Run `vibedepot publish` to create a bundle and open a GitHub PR.
3. Registry maintainers review the PR.
4. On merge, CI rebuilds `registry.json` and the app appears in the store.

See [Publishing to the Registry](/guides/publishing/) for the complete guide.

## Standalone Schemas

The registry uses its own Zod schemas (in `schemas/`) rather than importing from `@vibedepot/shared`. This keeps the registry repo independent — it can be cloned and run without the full monorepo. The schemas are kept in sync manually.

## Next Steps

- [App Lifecycle](/concepts/app-lifecycle/) — How apps go from registry to running
- [Publishing to the Registry](/guides/publishing/) — Developer publishing guide
- [Registry Entry Reference](/reference/registry-entry/) — Complete field documentation

---
title: Registry Entry Format
description: Complete reference for the RegistryEntry type — the format used in registry.json for each published app.
---

The `registry.json` file contains an array of `RegistryEntry` objects. This is the data the VibeDepot shell fetches to populate the store.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique app identifier (kebab-case) |
| `name` | `string` | Yes | Display name |
| `version` | `string` | Yes | Current version (semver) |
| `description` | `string` | Yes | Short description |
| `longDescription` | `string` | No | Extended description for the detail modal |
| `author` | `string` | Yes | Author name |
| `category` | `string` | No | App category (one of the 10 [categories](/reference/manifest/#categories)) |
| `keywords` | `string[]` | No | Search keywords |
| `permissions` | `string[]` | Yes | Required [permissions](/reference/permissions/) |
| `providers` | `string[]` | No | Supported AI providers (from `manifest.models.providers`) |
| `thumbnail` | `string` | No | Thumbnail image path |
| `bundle` | `string` | Yes | Full URL to the release ZIP on GitHub |
| `checksum` | `string` | Yes | SHA256 hex digest of the bundle ZIP |
| `installs` | `number` | Yes | Number of installs (tracked by registry) |
| `updatedAt` | `string` | Yes | ISO 8601 datetime of last update |
| `featured` | `boolean` | No | Whether the app appears in the featured carousel |

## Example

```json
{
  "id": "email-writer",
  "name": "Email Writer",
  "version": "0.1.0",
  "description": "AI-powered email drafting assistant.",
  "longDescription": "Write professional emails with AI. Supports multiple tones and languages.",
  "author": "vibedepot",
  "category": "productivity",
  "keywords": ["email", "writing", "ai"],
  "permissions": ["ai", "storage.kv"],
  "providers": ["anthropic", "openai", "gemini"],
  "thumbnail": "thumbnail.png",
  "bundle": "https://raw.githubusercontent.com/thehorse2000/vibedepot-registry/main/apps/email-writer/releases/0.1.0.zip",
  "checksum": "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
  "installs": 42,
  "updatedAt": "2025-01-15T12:00:00Z",
  "featured": true
}
```

## How It Differs from AppManifest

The `RegistryEntry` is derived from the `AppManifest` but has some differences:

| Field | In Manifest | In Registry Entry | Notes |
|---|---|---|---|
| `id`, `name`, `version`, `description`, `author` | Yes | Yes | Same |
| `category`, `keywords`, `permissions` | Yes | Yes | Same |
| `entry` | Yes | No | Not needed — contained in the bundle |
| `models` | Yes (object) | No | Flattened to `providers` array |
| `providers` | No | Yes | Extracted from `models.providers` |
| `bundle` | No | Yes | Full GitHub raw URL to the ZIP |
| `checksum` | No | Yes | SHA256 of the bundle ZIP |
| `installs` | No | Yes | Download count |
| `updatedAt` | No | Yes | Last published timestamp |
| `featured` | No | Yes | Curator flag for the featured carousel |
| `authorUrl`, `license`, `homepage`, `repository` | Yes | No | Metadata not needed for store display |
| `screenshots` | Yes | No | Not included in registry index |
| `minShellVersion`, `maxBundleSize` | Yes | No | Build-time constraints only |

## How It's Generated

The `build-index.ts` script in the registry repo generates `registry.json`:

1. Reads every `apps/{id}/manifest.json`
2. Extracts relevant fields
3. Computes SHA256 checksums of release ZIPs
4. Constructs GitHub raw content URLs for bundles
5. Sets `installs: 0` for new apps
6. Sets `updatedAt` to the current timestamp
7. Writes the array to `registry.json`

## Source

The `RegistryEntry` type is defined in `packages/shared/src/registry.types.ts`.

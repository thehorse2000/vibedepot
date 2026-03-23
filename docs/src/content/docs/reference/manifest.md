---
title: App Manifest Reference
description: Complete reference for all fields in a VibeDepot app's manifest.json file.
---

Every VibeDepot app must include a `manifest.json` file in its root directory. This file defines the app's identity, permissions, AI requirements, and metadata.

## Fields

### Required Fields

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier. Must be kebab-case (e.g. `my-app`). Lowercase letters, numbers, and hyphens only. |
| `name` | `string` | Display name shown in the store and library. |
| `version` | `string` | Semantic version (e.g. `1.0.0`). Must match `X.Y.Z` format. |
| `description` | `string` | Short description shown in app cards. |
| `author` | `string` | Author name or organization. |
| `entry` | `string` | Path to the HTML entry file, relative to the app root (e.g. `index.html` or `dist/index.html`). |
| `permissions` | `string[]` | Array of [permission strings](/reference/permissions/). |

### Optional Fields

| Field | Type | Description |
|---|---|---|
| `longDescription` | `string` | Extended description shown in the app detail modal. |
| `authorUrl` | `string` | URL to the author's website or profile. |
| `license` | `string` | License identifier (e.g. `MIT`, `Apache-2.0`). |
| `thumbnail` | `string` | Path to a thumbnail image, relative to the app root. |
| `screenshots` | `string[]` | Array of paths to screenshot images. |
| `category` | `string` | App category. See [categories](#categories) below. |
| `keywords` | `string[]` | Search keywords for store discovery. |
| `models` | `object` | AI model configuration. See [models](#models) below. |
| `minShellVersion` | `string` | Minimum VibeDepot version required. |
| `maxBundleSize` | `string` | Maximum bundle size declaration. |
| `changelog` | `string` | Changelog text or URL. |
| `homepage` | `string` | App homepage URL. |
| `repository` | `string` | Source code repository URL. |

## Models

The `models` object configures AI provider requirements:

```json
{
  "models": {
    "required": true,
    "providers": ["anthropic", "openai", "gemini"],
    "default": "anthropic",
    "minContextWindow": 8000
  }
}
```

| Field | Type | Description |
|---|---|---|
| `required` | `boolean` | Whether AI is required for the app to function. |
| `providers` | `string[]` | Supported AI providers: `'anthropic'`, `'openai'`, `'gemini'`. |
| `default` | `string` | Preferred provider used when no explicit provider is specified. |
| `minContextWindow` | `number` | Minimum context window size in tokens. |

## Categories

Apps can be assigned to one of these categories:

| Category | Description |
|---|---|
| `productivity` | Task management, organization, workflow tools |
| `writing` | Writing assistants, editors, content creation |
| `coding` | Code generation, review, debugging tools |
| `files` | File management and processing |
| `research` | Research assistants, summarizers, analyzers |
| `data` | Data analysis, visualization, transformation |
| `media` | Image, audio, video processing |
| `integrations` | Connectors to external services |
| `utilities` | General-purpose tools |
| `fun` | Games, entertainment, creative tools |

## Full Example

```json
{
  "id": "email-writer",
  "name": "Email Writer",
  "version": "0.1.0",
  "description": "AI-powered email drafting assistant.",
  "longDescription": "Write professional emails with AI assistance. Supports multiple tones, languages, and formats.",
  "author": "vibedepot",
  "authorUrl": "https://github.com/thehorse2000",
  "license": "MIT",
  "entry": "index.html",
  "thumbnail": "thumbnail.png",
  "screenshots": ["screenshots/compose.png", "screenshots/settings.png"],
  "category": "productivity",
  "keywords": ["email", "writing", "ai", "productivity"],
  "models": {
    "required": true,
    "providers": ["anthropic", "openai", "gemini"],
    "default": "anthropic"
  },
  "permissions": ["ai", "storage.kv"],
  "homepage": "https://github.com/thehorse2000/email-writer",
  "repository": "https://github.com/thehorse2000/email-writer"
}
```

## Validation

The CLI validates manifests against a Zod schema. Run:

```bash
vibedepot validate
```

This checks:
- All required fields are present and correctly typed
- `id` is kebab-case
- `version` is valid semver
- `entry` file exists on disk
- `permissions` contains valid permission strings
- `category` is one of the 10 valid categories (if provided)
- `models.providers` contains valid provider names (if provided)

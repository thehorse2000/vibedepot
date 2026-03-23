---
name: vibedepot-docs
description: >
  Write, update, and maintain VibeDepot project documentation using the Astro
  Starlight framework. Use this skill whenever the user asks to: write docs,
  create documentation pages, document an API, explain a feature, add a guide,
  update the docs site, write a how-to, add a reference page, scaffold the
  Starlight site, or document anything in the VibeDepot project. Also triggers
  for phrases like "add docs for", "document this", "write a guide for",
  "update the docs", or "create a page about". Always use this skill when
  working on anything in a /docs directory or Astro/Starlight project.
---

# VibeDepot Documentation Skill (Starlight / Astro)

This skill governs how documentation is written and structured for the
**VibeDepot** project using [Astro Starlight](https://starlight.astro.build).

---

## 1. Quick-Start Checklist

Before writing any doc page, confirm:

- [ ] You know which **section** the page belongs to (see §3 — Site Structure)
- [ ] You know the **audience** (End User / Vibecoder / Developer)
- [ ] You have the correct **frontmatter** fields (see §4)
- [ ] You are using **MDX** (`.mdx`) for pages with components, plain **MD** (`.md`) for prose-only pages
- [ ] Cross-links use Starlight's **root-relative paths** (e.g. `/guides/install-app/`)

---

## 2. Project Context

VibeDepot is an open-source Electron desktop app store for AI-native applications.
Three personas drive all documentation decisions:

| Persona | Tech Comfort | Primary Docs Need |
|---|---|---|
| **End User** | Low | Installation, onboarding, using apps |
| **Vibecoder** | Low–Medium | GUI publish flow, no CLI required |
| **Developer** | High | Bridge API, manifest spec, CLI reference |

Every page must be written for **one primary persona**. State this in frontmatter (`audience` tag).

---

## 3. Site Structure

The Starlight site lives at `docs/` in the monorepo root. Use this canonical
section map when placing or linking pages. Do **not** invent new top-level sections
without explicit instruction.

```
docs/
├── astro.config.mjs          ← sidebar config lives here
├── src/
│   ├── content/
│   │   └── docs/
│   │       ├── index.mdx                    ← homepage (hero)
│   │       ├── getting-started/
│   │       │   ├── installation.md          ← download & install the shell
│   │       │   ├── api-key-setup.md         ← add first API key
│   │       │   ├── first-app.md             ← install & launch first app
│   │       │   └── default-model.md         ← choose default AI model
│   │       ├── using-vibedepot/
│   │       │   ├── store.md                 ← browsing & searching
│   │       │   ├── installing-apps.md       ← install flow
│   │       │   ├── updating-apps.md         ← update flow
│   │       │   ├── uninstalling-apps.md
│   │       │   ├── library.md               ← library view
│   │       │   └── settings.md              ← all settings sections
│   │       ├── publishing/
│   │       │   ├── overview.md              ← which path to take
│   │       │   ├── gui-publish.md           ← vibecoder drag-drop flow
│   │       │   ├── cli-quickstart.md        ← developer 5-min guide
│   │       │   ├── cli-reference.md         ← all vibedepot-cli commands
│   │       │   ├── manifest-reference.md    ← full manifest.json spec
│   │       │   ├── bundle-format.md         ← zip structure rules
│   │       │   └── registry-pr.md           ← PR checklist & CI checks
│   │       ├── bridge-api/
│   │       │   ├── overview.md              ← what the Bridge API is
│   │       │   ├── ai.md                    ← window.vibeDepot.ai
│   │       │   ├── storage.md               ← KV / files / SQLite
│   │       │   ├── network.md               ← net.fetch / get / post
│   │       │   ├── clipboard.md
│   │       │   ├── shell.md                 ← shell utilities
│   │       │   └── permissions.md           ← full permission reference
│   │       ├── templates/
│   │       │   ├── overview.md
│   │       │   ├── vanilla.md
│   │       │   ├── react.md
│   │       │   ├── vue.md
│   │       │   ├── chat.md
│   │       │   ├── file-processor.md
│   │       │   └── api-integration.md
│   │       ├── security/
│   │       │   ├── key-storage.md           ← keychain model
│   │       │   ├── sandbox.md               ← WebView isolation
│   │       │   └── permission-model.md
│   │       └── reference/
│   │           ├── error-codes.md
│   │           ├── categories.md
│   │           └── changelog.md
│   └── components/           ← custom MDX components (see §6)
```

For full sidebar YAML and `astro.config.mjs` template, see
`references/astro-config.md`.

---

## 4. Frontmatter Reference

Every page **must** include this frontmatter block:

```yaml
---
title: "Page Title Here"
description: "One sentence summary shown in SEO and sidebar previews."
sidebar:
  order: 10          # controls position within its section; increment by 10
  badge:             # optional — "New" | "Beta" | "Deprecated"
    text: New
    variant: tip     # tip | note | caution | danger
audience: end-user   # end-user | vibecoder | developer | all
---
```

**Rules:**
- `title` is sentence case for guides, Title Case for reference pages
- `description` must be under 160 characters
- `audience` is custom — used by components and search filtering
- Never use `draft: true` on pages that are being shipped; delete unfinished pages instead

---

## 5. Writing Style Guide

### Voice & Tone

| Rule | Good | Bad |
|---|---|---|
| Second-person imperative | "Click **Install**." | "The user should click Install." |
| Plain language for End User / Vibecoder | "Paste your key here." | "Input your credential string." |
| Precise for Developer reference | "Returns `{ text: string, usage: UsageObject }`" | "Returns the AI response." |
| Active voice | "The shell verifies the checksum." | "The checksum is verified by the shell." |
| Short sentences | Max 20 words per sentence in guides | — |

### Callout Usage

Use Starlight's built-in `:::` callout syntax — **not** custom HTML.

```md
:::note
Use for supplementary information that doesn't block progress.
:::

:::tip
Use for shortcuts, best practices, or time-savers.
:::

:::caution
Use when the user could make a recoverable mistake.
:::

:::danger
Use ONLY for irreversible actions (data deletion, key exposure).
:::
```

**Security callouts** — always use `:::danger` when documenting:
- API key handling
- Uninstall + delete data flow
- Any action that cannot be undone

### Code Blocks

Always specify the language. Use the `title` attribute for filenames.

````md
```json title="manifest.json"
{
  "id": "my-app",
  "version": "1.0.0"
}
```
````

For shell commands, use `bash` and prefix with `#` comments explaining each step:

````md
```bash
# Install the CLI globally
npm install -g vibedepot-cli

# Scaffold a new app
vibedepot init
```
````

### Tables

Use tables for: API method signatures, permission lists, error codes, config options.
Use prose for: conceptual explanations, flows, comparisons with nuance.

---

## 6. MDX Components

These custom components are available in `.mdx` files. Import from
`~/components/`. For full prop documentation see `references/components.md`.

| Component | When to Use | Import |
|---|---|---|
| `<PermissionBadge>` | Inline permission callout with icon | `import PermissionBadge from '~/components/PermissionBadge.astro'` |
| `<ApiMethod>` | Structured API method signature block | `import ApiMethod from '~/components/ApiMethod.astro'` |
| `<PlatformTabs>` | Show macOS / Windows / Linux variants | `import PlatformTabs from '~/components/PlatformTabs.astro'` |
| `<PersonaBadge>` | "For: End User / Vibecoder / Developer" tag | `import PersonaBadge from '~/components/PersonaBadge.astro'` |
| `<StepFlow>` | Numbered step-by-step with screenshots | `import StepFlow from '~/components/StepFlow.astro'` |
| `<SecurityNote>` | Prominent security warning with shield icon | `import SecurityNote from '~/components/SecurityNote.astro'` |

Component scaffolds (copy-paste ready) are in `references/components.md`.

---

## 7. Page Templates

Use these templates as starting points. Replace `[PLACEHOLDER]` text.

### 7.1 — Guide Page (End User / Vibecoder)

```mdx
---
title: "[Action] [Thing]"
description: "Learn how to [action] in VibeDepot."
sidebar:
  order: 10
audience: end-user
---

import PersonaBadge from '~/components/PersonaBadge.astro';
import StepFlow from '~/components/StepFlow.astro';

<PersonaBadge for="end-user" />

[One paragraph: what this page covers and why it matters to the user.]

## Before You Start

- [Prerequisite 1]
- [Prerequisite 2]

## Steps

<StepFlow>
1. **[Step title]** — [What the user does. What the system does in response.]
2. **[Step title]** — [What the user does.]
</StepFlow>

## What Happens Next

[Where the user is now; what they can do next. Link to next logical page.]

## Troubleshooting

| Problem | Solution |
|---|---|
| [Error message or symptom] | [Plain-language fix] |
```

### 7.2 — API Reference Page (Developer)

```mdx
---
title: "[Module Name] — Bridge API"
description: "Reference for window.vibeDepot.[module]."
sidebar:
  order: 10
audience: developer
---

import ApiMethod from '~/components/ApiMethod.astro';
import PermissionBadge from '~/components/PermissionBadge.astro';
import SecurityNote from '~/components/SecurityNote.astro';

## Overview

[One paragraph explaining what this module does and when to use it.]

**Required permission:** <PermissionBadge name="[permission]" /> *(or "None — available to all apps")*

<SecurityNote>
  [Any security constraint specific to this module. Omit if not applicable.]
</SecurityNote>

## Methods

<ApiMethod
  name="[methodName](params)"
  returns="[ReturnType]"
  permission="[permission or none]"
>
[Description of what the method does.]

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `param` | `string` | Yes | [Description] |

**Returns:** `[TypeDescription]`

**Example:**

```js
const result = await window.vibeDepot.[module].[method]([params]);
```

**Errors thrown:**
- `PermissionDeniedError` — if permission not declared in manifest
- `[OtherError]` — [when this happens]
</ApiMethod>

---

[Repeat `<ApiMethod>` block for each method]
```

### 7.3 — Concept / Overview Page

```mdx
---
title: "[Concept] Overview"
description: "Understand [concept] in VibeDepot."
sidebar:
  order: 1
audience: all
---

## What Is [Concept]?

[One paragraph definition.]

## Why It Works This Way

[Explain the architectural or security reason for the design decision.]

## [Key Aspect 1]

[Explanation with diagram or table if helpful.]

## [Key Aspect 2]

[Explanation.]

## Related

- [Link to related page 1]
- [Link to related page 2]
```

---

## 8. Sidebar Configuration

When adding a new page, **always** update `docs/astro.config.mjs`.

For the full config template and sidebar YAML, see `references/astro-config.md`.

**Key rules:**
- Every new page needs an entry in the `sidebar` array
- Group pages under the correct `label` group (matching §3 sections)
- Set `collapsed: true` on all non-getting-started groups by default
- `autogenerate` is disabled — all entries are manual for ordering control

---

## 9. Cross-Linking Conventions

| Situation | Pattern |
|---|---|
| Link to another doc page | `[Install an App](/using-vibedepot/installing-apps/)` |
| Link to a specific section | `[Permission Reference](/bridge-api/permissions/#storage-files)` |
| Link to external URL | `[Anthropic API Keys](https://console.anthropic.com/)` — always opens in new tab via Starlight's default behaviour |
| Reference a manifest field | Use inline code: `` `permissions` `` |
| Reference a Bridge API method | Use inline code: `` `window.vibeDepot.ai.callAI()` `` |

Never hardcode the base URL — Starlight handles canonical URLs.

---

## 10. Phase-Gating Convention

Some features are unreleased. Gate them clearly:

```md
:::note[Coming in Phase 3]
The GUI publish flow described below is planned for Phase 3.
CLI publishing is available now — see [CLI Quickstart](/publishing/cli-quickstart/).
:::
```

Use the phase labels: **Phase 1**, **Phase 2**, **Phase 3**, **Phase 4**.

---

## 11. Reference Files

Read these files when you need deeper detail:

| File | When to Read |
|---|---|
| `references/astro-config.md` | Setting up the site, adding to the sidebar, configuring plugins |
| `references/components.md` | Full prop API and usage examples for all custom MDX components |
| `references/seo-and-meta.md` | OG images, sitemap config, canonical URLs |

---

## 12. Output Rules (Claude Code)

When writing documentation in Claude Code:

1. **Create the file** at the correct path inside `docs/src/content/docs/`
2. **Update `astro.config.mjs`** — add the new page to the sidebar
3. **Never create placeholder files** — every file you write must be complete and shippable
4. **If a component is used in MDX**, check `docs/src/components/` first — create it if it doesn't exist, following the scaffold in `references/components.md`
5. **Run** `npm run build` (or `pnpm build`) inside `docs/` after writing to catch broken links and MDX errors

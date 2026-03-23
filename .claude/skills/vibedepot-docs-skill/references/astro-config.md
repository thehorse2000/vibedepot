# Astro Config Reference — VibeDepot Docs

## Full `astro.config.mjs`

Copy this as the baseline. The `sidebar` array is the single source of truth
for navigation — every page must have an entry here.

```js
// docs/astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'VibeDepot',
      description: 'The open-source desktop app store for AI-native apps.',
      logo: {
        src: './src/assets/logo.svg',
        replacesTitle: false,
      },
      social: {
        github: 'https://github.com/vibedepot/vibedepot',
      },
      editLink: {
        baseUrl: 'https://github.com/vibedepot/vibedepot/edit/main/docs/',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Getting Started',
          collapsed: false,
          items: [
            { label: 'Welcome to VibeDepot', link: '/' },
            { label: 'Installation', link: '/getting-started/installation/' },
            { label: 'Add Your API Key', link: '/getting-started/api-key-setup/' },
            { label: 'Install Your First App', link: '/getting-started/first-app/' },
            { label: 'Choose a Default Model', link: '/getting-started/default-model/' },
          ],
        },
        {
          label: 'Using VibeDepot',
          collapsed: true,
          items: [
            { label: 'Browsing the Store', link: '/using-vibedepot/store/' },
            { label: 'Installing Apps', link: '/using-vibedepot/installing-apps/' },
            { label: 'Updating Apps', link: '/using-vibedepot/updating-apps/' },
            { label: 'Uninstalling Apps', link: '/using-vibedepot/uninstalling-apps/' },
            { label: 'Your Library', link: '/using-vibedepot/library/' },
            { label: 'Settings', link: '/using-vibedepot/settings/' },
          ],
        },
        {
          label: 'Publishing Apps',
          collapsed: true,
          items: [
            { label: 'Publishing Overview', link: '/publishing/overview/' },
            { label: 'GUI Publish Flow', link: '/publishing/gui-publish/' },
            { label: 'CLI Quickstart', link: '/publishing/cli-quickstart/' },
            { label: 'CLI Reference', link: '/publishing/cli-reference/' },
            { label: 'Manifest Reference', link: '/publishing/manifest-reference/' },
            { label: 'Bundle Format', link: '/publishing/bundle-format/' },
            { label: 'Registry PR Guide', link: '/publishing/registry-pr/' },
          ],
        },
        {
          label: 'Bridge API',
          collapsed: true,
          items: [
            { label: 'Overview', link: '/bridge-api/overview/' },
            { label: 'AI Module', link: '/bridge-api/ai/' },
            { label: 'Storage Module', link: '/bridge-api/storage/' },
            { label: 'Network Module', link: '/bridge-api/network/' },
            { label: 'Clipboard Module', link: '/bridge-api/clipboard/' },
            { label: 'Shell Module', link: '/bridge-api/shell/' },
            { label: 'Permissions', link: '/bridge-api/permissions/' },
          ],
        },
        {
          label: 'App Templates',
          collapsed: true,
          items: [
            { label: 'Templates Overview', link: '/templates/overview/' },
            { label: 'Vanilla (HTML/JS/CSS)', link: '/templates/vanilla/' },
            { label: 'React', link: '/templates/react/' },
            { label: 'Vue', link: '/templates/vue/' },
            { label: 'Chat UI', link: '/templates/chat/' },
            { label: 'File Processor', link: '/templates/file-processor/' },
            { label: 'API Integration', link: '/templates/api-integration/' },
          ],
        },
        {
          label: 'Security',
          collapsed: true,
          items: [
            { label: 'API Key Storage', link: '/security/key-storage/' },
            { label: 'App Sandbox', link: '/security/sandbox/' },
            { label: 'Permission Model', link: '/security/permission-model/' },
          ],
        },
        {
          label: 'Reference',
          collapsed: true,
          items: [
            { label: 'Error Codes', link: '/reference/error-codes/' },
            { label: 'App Categories', link: '/reference/categories/' },
            { label: 'Changelog', link: '/reference/changelog/' },
          ],
        },
      ],
    }),
  ],
});
```

---

## Adding a New Page to the Sidebar

1. Create the `.md` or `.mdx` file at the correct path under `docs/src/content/docs/`
2. Find the matching `label` group in the `sidebar` array
3. Add an `{ label: '...', link: '/section/slug/' }` entry at the correct position
4. Use `sidebar.order` in frontmatter as a secondary hint (Starlight prefers explicit sidebar entries)

**Example — adding "Sideloading Apps" under Using VibeDepot:**

```js
{
  label: 'Using VibeDepot',
  collapsed: true,
  items: [
    // ... existing items ...
    { label: 'Sideloading Apps', link: '/using-vibedepot/sideloading/', badge: { text: 'Beta', variant: 'caution' } },
  ],
},
```

---

## Starlight Plugins Used

| Plugin | Purpose | Install |
|---|---|---|
| `@astrojs/starlight` | Core framework | Included |
| `starlight-openapi` | Auto-generate API pages from OpenAPI spec (Phase 2+) | `npm i starlight-openapi` |
| `@astrojs/sitemap` | Sitemap generation | `npm i @astrojs/sitemap` |

---

## Custom CSS

`docs/src/styles/custom.css` overrides Starlight CSS variables for VibeDepot branding.

```css
/* docs/src/styles/custom.css */
:root {
  --sl-color-accent-low: #1a1a2e;
  --sl-color-accent: #6c63ff;
  --sl-color-accent-high: #a29bfe;
  --sl-font: 'Inter', system-ui, sans-serif;
}

[data-theme='dark'] {
  --sl-color-accent-low: #2d2b55;
  --sl-color-accent: #a29bfe;
  --sl-color-accent-high: #d4d0ff;
}
```

---

## Initial Setup Commands

Run once to scaffold the docs site inside the monorepo:

```bash
# From monorepo root
npm create astro@latest docs -- --template starlight
cd docs
npm install

# Start dev server
npm run dev
# → http://localhost:4321
```

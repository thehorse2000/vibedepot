# SEO & Meta Reference — VibeDepot Docs

## Page-Level Meta

Starlight uses `title` and `description` from frontmatter for `<title>` and
`<meta name="description">`. No additional action needed per page.

**Guidelines:**
- `title` must be unique across the entire site
- `description` between 120–160 characters — complete sentences, no jargon
- Don't repeat the section name in `title` (Starlight appends " | VibeDepot" automatically)

---

## Open Graph / Social Images

Starlight auto-generates OG images from page titles. To override for specific
high-traffic pages (homepage, Bridge API overview), add a custom image:

```yaml
---
title: "Bridge API Overview"
description: "The complete interface between VibeDepot apps and the shell."
hero:
  image:
    file: ../../assets/og/bridge-api.png
---
```

OG image assets go in `docs/src/assets/og/`. Recommended size: **1200x630px**.

---

## Sitemap

Enable in `astro.config.mjs`:

```js
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://vibedepot.io',
  integrations: [sitemap(), starlight({ ... })],
});
```

The sitemap is auto-generated at `/sitemap-index.xml` on build.

---

## Canonical URLs

Set `site` in `astro.config.mjs` to the production URL:

```js
export default defineConfig({
  site: 'https://vibedepot.io',
  base: '/docs', // if docs live at vibedepot.io/docs
  ...
});
```

---

## robots.txt

Create `docs/public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://vibedepot.io/sitemap-index.xml
```

---

## Analytics

If analytics are added in a future phase, inject via Starlight's `head` config:

```js
starlight({
  head: [
    {
      tag: 'script',
      attrs: {
        src: 'https://plausible.io/js/script.js',
        'data-domain': 'vibedepot.io',
        defer: true,
      },
    },
  ],
})
```

Use privacy-preserving analytics only (Plausible, Fathom) — consistent with
VibeDepot's local-first, no-tracking philosophy.

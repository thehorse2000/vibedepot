---
title: Building Your First App
description: A step-by-step guide to building a complete VibeDepot AI app with storage, streaming, and error handling.
---

This guide walks you through building a complete AI-powered app from scratch — a writing assistant that streams AI responses and saves drafts to storage.

## Prerequisites

- [VibeDepot installed](/getting-started/installation/) and running (`pnpm dev`)
- [CLI installed](/getting-started/installation/#installing-the-cli) (`npm install -g @vibedepot/cli`)
- At least one API key configured in VibeDepot Settings

## Step 1: Scaffold the App

```bash
vibedepot init writing-buddy
```

Choose **vanilla** template and **writing** category.

## Step 2: Design the Manifest

Edit `writing-buddy/manifest.json`:

```json
{
  "id": "writing-buddy",
  "name": "Writing Buddy",
  "version": "0.1.0",
  "description": "AI writing assistant with draft saving.",
  "author": "your-name",
  "entry": "index.html",
  "category": "writing",
  "keywords": ["writing", "ai", "drafts"],
  "permissions": ["ai", "storage.kv"],
  "models": {
    "required": true,
    "providers": ["anthropic", "openai", "gemini"],
    "default": "anthropic"
  }
}
```

The `ai` permission enables AI calls. `storage.kv` is auto-granted but should still be declared for clarity.

## Step 3: Build the UI

Replace `writing-buddy/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Writing Buddy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 24px;
      max-width: 720px;
      margin: 0 auto;
    }
    h1 { margin-bottom: 16px; }
    textarea {
      width: 100%; height: 120px; padding: 12px;
      border: 1px solid #d1d5db; border-radius: 8px;
      font-size: 14px; resize: vertical;
    }
    .actions { margin-top: 12px; display: flex; gap: 8px; }
    button {
      padding: 8px 16px; border: none; border-radius: 6px;
      cursor: pointer; font-size: 14px;
    }
    .primary { background: #3b82f6; color: white; }
    .secondary { background: #e5e7eb; }
    #output {
      margin-top: 20px; padding: 16px;
      background: #f8fafc; border-radius: 8px;
      white-space: pre-wrap; min-height: 100px;
    }
    #status { margin-top: 8px; color: #6b7280; font-size: 13px; }
  </style>
</head>
<body>
  <h1>Writing Buddy</h1>
  <textarea id="prompt" placeholder="Describe what you'd like to write..."></textarea>
  <div class="actions">
    <button class="primary" id="generate">Generate</button>
    <button class="secondary" id="save">Save Draft</button>
    <button class="secondary" id="load">Load Draft</button>
  </div>
  <div id="output"></div>
  <div id="status"></div>

  <script>
    const prompt = document.getElementById('prompt');
    const output = document.getElementById('output');
    const status = document.getElementById('status');

    // Generate with streaming
    document.getElementById('generate').addEventListener('click', async () => {
      if (!prompt.value.trim()) return;
      output.textContent = '';
      status.textContent = 'Generating...';

      try {
        await window.vibeDepot.ai.streamAI(
          {
            messages: [
              { role: 'system', content: 'You are a helpful writing assistant.' },
              { role: 'user', content: prompt.value }
            ]
          },
          (chunk) => {
            output.textContent += chunk;
          }
        );
        status.textContent = 'Done.';
      } catch (err) {
        status.textContent = 'Error: ' + err.message;
      }
    });

    // Save draft to KV storage
    document.getElementById('save').addEventListener('click', async () => {
      await window.vibeDepot.storage.set('draft', {
        prompt: prompt.value,
        output: output.textContent,
        savedAt: new Date().toISOString()
      });
      status.textContent = 'Draft saved.';
    });

    // Load draft from KV storage
    document.getElementById('load').addEventListener('click', async () => {
      const draft = await window.vibeDepot.storage.get('draft');
      if (draft) {
        prompt.value = draft.prompt || '';
        output.textContent = draft.output || '';
        status.textContent = 'Draft loaded from ' + draft.savedAt;
      } else {
        status.textContent = 'No saved draft found.';
      }
    });

    // Adapt to system theme
    window.vibeDepot.shell.theme().then((theme) => {
      if (theme === 'dark') {
        document.body.style.background = '#1e293b';
        document.body.style.color = '#f1f5f9';
      }
    });
  </script>
</body>
</html>
```

## Step 4: Test with Sideloading

```bash
cd writing-buddy
vibedepot preview
```

Or sideload manually from the Library page (requires Publisher Mode in Settings).

Changes to `index.html` auto-reload — no need to re-sideload.

## Step 5: Validate

```bash
vibedepot validate
```

Fix any issues before publishing. See [validation checks](/guides/using-the-cli/#validate) for details.

## Step 6: Publish

```bash
vibedepot publish
```

This creates a ZIP bundle, computes a SHA256 checksum, and opens a GitHub PR. See [Publishing to the Registry](/guides/publishing/) for the full process.

## What You've Learned

- Scaffolding an app with the CLI
- Declaring permissions and AI providers in the manifest
- Using `streamAI()` for real-time AI responses
- Saving and loading data with KV storage
- Reading the system theme
- Testing with sideloading
- Validating and publishing

## Next Steps

- [Using AI Providers](/guides/using-ai-providers/) — Provider selection, models, and streaming in depth
- [Working with Storage](/guides/storage/) — KV and SQLite storage patterns
- [Bridge API Reference](/reference/bridge-api/) — Full API documentation

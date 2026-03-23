---
title: "Quick Start: Developers"
description: Scaffold, build, and preview your first VibeDepot AI app in minutes.
---

This guide takes you from zero to a working AI app running inside VibeDepot.

## 1. Install the CLI

```bash
npm install -g @vibedepot/cli
```

## 2. Scaffold a New App

```bash
vibedepot init my-ai-app
```

The CLI asks you to choose:
- **Category** — productivity, writing, coding, etc.
- **Template** — `vanilla`, `react`, `chat`, `file-processor`, or `api-integration`

For this guide, choose **vanilla**.

This creates a `my-ai-app/` directory with:
```
my-ai-app/
├── manifest.json
└── index.html
```

## 3. Edit Your App

Open `my-ai-app/index.html` and add a simple AI call:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My AI App</title>
  <style>
    body { font-family: system-ui; padding: 24px; }
    button { padding: 8px 16px; cursor: pointer; }
    #output { margin-top: 16px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>My AI App</h1>
  <button id="ask">Ask AI</button>
  <div id="output"></div>

  <script>
    document.getElementById('ask').addEventListener('click', async () => {
      const output = document.getElementById('output');
      output.textContent = 'Thinking...';

      try {
        const response = await window.vibeDepot.ai.callAI({
          messages: [
            { role: 'user', content: 'Tell me a fun fact about space.' }
          ]
        });
        output.textContent = response.content;
      } catch (err) {
        output.textContent = 'Error: ' + err.message;
      }
    });
  </script>
</body>
</html>
```

## 4. Update the Manifest

Open `my-ai-app/manifest.json` and fill in the details:

```json
{
  "id": "my-ai-app",
  "name": "My AI App",
  "version": "0.1.0",
  "description": "A simple app that asks AI for fun facts.",
  "author": "your-name",
  "entry": "index.html",
  "category": "fun",
  "permissions": ["ai", "storage.kv"],
  "models": {
    "required": true,
    "providers": ["anthropic", "openai", "gemini"]
  }
}
```

Key fields:
- **`id`** — Unique kebab-case identifier
- **`entry`** — The HTML file VibeDepot loads
- **`permissions`** — What your app needs access to
- **`models.providers`** — Which AI providers your app supports

See the [Manifest Reference](/reference/manifest/) for all fields.

## 5. Preview Your App

```bash
cd my-ai-app
vibedepot preview
```

This opens VibeDepot and sideloads your app. Changes to your files auto-reload in the app window.

Alternatively, sideload manually:
1. Open VibeDepot and enable **Publisher Mode** in Settings.
2. Go to **Library** and click **Sideload App**.
3. Select your `my-ai-app/` folder.

## 6. Validate

Before publishing, run the validator:

```bash
vibedepot validate
```

This checks:
- Manifest schema validity
- Entry file exists
- Bundle size (max 5 MB)
- No hardcoded API keys
- Permissions match usage
- Valid semver version
- Kebab-case app ID
- Thumbnail presence (optional)

## 7. Publish

When you're ready to share:

```bash
vibedepot publish
```

This validates your app, creates a ZIP bundle with a SHA256 checksum, and opens a GitHub PR against the registry.

See [Publishing to the Registry](/guides/publishing/) for the full workflow.

## Next Steps

- [Building Your First App](/guides/building-your-first-app/) — Deeper tutorial with more features
- [Using AI Providers](/guides/using-ai-providers/) — Streaming, provider selection, error handling
- [Bridge API Reference](/reference/bridge-api/) — Complete API documentation

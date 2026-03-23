---
name: vibedepot-ai-app
description: >
  Create a complete AI-powered app for the VibeDepot desktop app store. Use this
  skill when the user asks to: build a VibeDepot app, create an AI app, scaffold
  a new app, make a VibeDepot plugin, or build anything that runs inside the
  VibeDepot shell. Also triggers for: "new app", "build an app", "create app",
  "make an app for vibedepot", "scaffold app", or "AI app". Always use this skill
  when the user wants to create a new application that uses the VibeDepot Bridge API.
---

# VibeDepot AI App Development Skill

This skill creates complete, production-ready AI apps that run inside the VibeDepot desktop shell. Every app uses the `window.vibeDepot` Bridge API and follows VibeDepot conventions.

---

## 1. Gathering Requirements

Before writing any code, clarify these with the user:

1. **App name and ID** — Display name (e.g., "Code Reviewer") and kebab-case ID (e.g., `code-reviewer`)
2. **What does the app do?** — Core functionality in one sentence
3. **Category** — One of: `productivity`, `writing`, `coding`, `files`, `research`, `data`, `media`, `integrations`, `utilities`, `fun`
4. **AI usage pattern** — Single-shot (`callAI`), streaming (`streamAI`), multi-turn conversation, or a mix
5. **Storage needs** — Key-value only (`storage.kv`, auto-granted) or SQLite (`storage.db`, consent required)
6. **Extra permissions** — `network`, `clipboard`, `notifications`, `storage.files` (only if needed)

If the user gives a clear description, infer reasonable defaults and confirm before proceeding.

---

## 2. App Structure

Every VibeDepot app lives in its own directory with this structure:

```
registry/apps/{app-id}/
├── manifest.json    # App metadata, permissions, AI config
├── index.html       # Entry point (referenced by manifest.entry)
├── app.js           # Application logic using Bridge API
├── style.css        # Styling
└── thumbnail.png    # Optional — 256x256 app icon
```

Always create files in `registry/apps/{app-id}/`.

---

## 3. Manifest (`manifest.json`)

Every app MUST have a valid manifest. Use this template:

```json
{
  "id": "{app-id}",
  "name": "{App Name}",
  "version": "0.1.0",
  "description": "{Short description — shown in store listing}",
  "longDescription": "{Extended description — 2-3 sentences with feature highlights}",
  "author": "vibedepot",
  "license": "MIT",
  "entry": "index.html",
  "thumbnail": "thumbnail.png",
  "category": "{category}",
  "keywords": ["{keyword1}", "{keyword2}", "{keyword3}"],
  "models": {
    "required": true,
    "providers": ["anthropic", "openai", "gemini"],
    "default": "anthropic"
  },
  "permissions": ["ai", "storage.kv"]
}
```

**Rules:**
- `id` must be kebab-case, unique across the registry
- `version` must be valid semver, start at `0.1.0`
- `entry` is always relative to the app directory
- `permissions` — only declare what the app actually uses
- `models.required` — set `true` if the app cannot function without AI
- `models.providers` — list all providers the app works with (always include all three unless there's a reason not to)
- Add `storage.db` to permissions only if using SQLite
- Add `notifications`, `clipboard`, `network`, `storage.files` only if needed

---

## 4. Bridge API Reference

Apps run in sandboxed BrowserWindows. All shell interaction goes through `window.vibeDepot`:

### 4.1 AI (`window.vibeDepot.ai`) — requires `ai` permission

```javascript
// Single-shot call — waits for full response
const result = await window.vibeDepot.ai.callAI({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: userInput }
  ],
  maxTokens: 1024,        // optional
  temperature: 0.7,       // optional
  provider: 'anthropic',  // optional — falls back to manifest default
  model: 'claude-sonnet-4-20250514' // optional — uses provider default
});
// result = { content: string, model: string, usage: { inputTokens, outputTokens } }

// Streaming — chunks arrive via callback
await window.vibeDepot.ai.streamAI(
  {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: userInput }
    ],
    maxTokens: 2048
  },
  (chunk) => {
    outputEl.textContent += chunk;
  }
);

// Utility methods
const provider = await window.vibeDepot.ai.getProvider();     // 'anthropic' | 'openai' | 'gemini'
const model = await window.vibeDepot.ai.getModel();           // e.g. 'claude-sonnet-4-20250514'
const available = await window.vibeDepot.ai.listProviders();  // ['anthropic', 'openai']
```

**When to use which:**
- `callAI()` — Short responses, structured data, when you need the full result before rendering
- `streamAI()` — Long-form text, better UX for generation tasks, real-time feedback

### 4.2 Storage (`window.vibeDepot.storage`) — `storage.kv` auto-granted

```javascript
await window.vibeDepot.storage.set('key', { any: 'json-serializable value' });
const value = await window.vibeDepot.storage.get('key');       // null if not found
const deleted = await window.vibeDepot.storage.delete('key');  // boolean
const allKeys = await window.vibeDepot.storage.keys();         // string[]
await window.vibeDepot.storage.clear();                        // delete all
```

**Best practices:**
- Store settings, preferences, conversation history, drafts
- Cap stored lists (e.g., keep last 50 items) to prevent unbounded growth
- Data is per-app isolated — apps cannot read each other's storage

### 4.3 Database (`window.vibeDepot.db`) — requires `storage.db` permission

```javascript
// Create tables
await window.vibeDepot.db.run(
  'CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT, body TEXT, created_at TEXT)'
);

// Insert
await window.vibeDepot.db.run(
  'INSERT INTO notes (title, body, created_at) VALUES (?, ?, ?)',
  [title, body, new Date().toISOString()]
);

// Query
const notes = await window.vibeDepot.db.query('SELECT * FROM notes ORDER BY created_at DESC');

// Transaction
await window.vibeDepot.db.transaction([
  { sql: 'UPDATE notes SET title = ? WHERE id = ?', params: ['New Title', 1] },
  { sql: 'DELETE FROM notes WHERE id = ?', params: [2] }
]);
```

**SQL allowlist:** SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, CREATE INDEX, ALTER TABLE, DROP TABLE, DROP INDEX, PRAGMA table_info, PRAGMA table_list, BEGIN, COMMIT, ROLLBACK.

### 4.4 Shell (`window.vibeDepot.shell`) — no permission required (except `notify`)

```javascript
const info = await window.vibeDepot.shell.getAppInfo();    // AppManifest object
const version = await window.vibeDepot.shell.getVersion(); // e.g. '1.0.0'
await window.vibeDepot.shell.openExternal('https://example.com');
await window.vibeDepot.shell.notify('Title', 'Body');      // requires 'notifications' permission
await window.vibeDepot.shell.setTitle('My App — Working...');
const theme = await window.vibeDepot.shell.theme();        // 'light' | 'dark'
```

---

## 5. Error Handling

ALWAYS wrap Bridge API calls in try/catch. Handle these error codes:

```javascript
try {
  const result = await window.vibeDepot.ai.callAI({ messages, maxTokens: 1024 });
} catch (err) {
  switch (err.code) {
    case 'MISSING_API_KEY':
      showError('No API key configured. Go to Settings to add one.');
      break;
    case 'AI_PROVIDER_ERROR':
      showError('AI service error. Please try again.');
      break;
    case 'PERMISSION_DENIED':
      showError('This app needs AI permission to work.');
      break;
    default:
      showError(`Something went wrong: ${err.message}`);
  }
}
```

For storage operations, also catch errors — storage may fail if disk is full or permissions are wrong.

---

## 6. HTML Entry Point Pattern

Use this structure for `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{App Name}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="container">
    <header>
      <h1>{App Name}</h1>
      <p class="subtitle">{Short tagline}</p>
    </header>

    <!-- App UI here -->

  </div>

  <script src="app.js"></script>
</body>
</html>
```

**Rules:**
- No external CDN links — apps must be self-contained
- No build tools required — plain HTML/CSS/JS
- Keep it simple — no frameworks needed for most apps
- The app runs inside an Electron BrowserWindow with context isolation

---

## 7. CSS Styling Pattern

Use this base for `style.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #1a1a2e;
  background: #f8f9fa;
  padding: 24px;
}

.container {
  max-width: 720px;
  margin: 0 auto;
}

header {
  margin-bottom: 24px;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
}

.subtitle {
  color: #666;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 0.85rem;
}

textarea, select, input[type="text"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  background: #fff;
  transition: border-color 0.15s;
}

textarea:focus, select:focus, input[type="text"]:focus {
  outline: none;
  border-color: #6c5ce7;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background: #6c5ce7;
  color: white;
  transition: background 0.15s;
}

button:hover {
  background: #5a4bd1;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.output {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  white-space: pre-wrap;
  font-size: 0.9rem;
  min-height: 100px;
}

.loading {
  text-align: center;
  color: #666;
  padding: 20px;
  font-style: italic;
}

.error {
  color: #e74c3c;
  background: #ffeaea;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.85rem;
}
```

Adjust colors, layout, and components to match the app's purpose. Keep styling clean and native-feeling.

---

## 8. JavaScript App Pattern

Use this structure for `app.js`:

```javascript
// {App Name} — VibeDepot App
// Uses window.vibeDepot Bridge API

// ── State ──────────────────────────────────────────────
let conversationHistory = []; // For multi-turn apps

// ── AI Functions ───────────────────────────────────────

async function handleGenerate() {
  const userInput = document.getElementById('userInput').value.trim();
  if (!userInput) return;

  setLoading(true);

  try {
    const result = await window.vibeDepot.ai.callAI({
      messages: [
        { role: 'system', content: 'Your system prompt here.' },
        { role: 'user', content: userInput }
      ],
      maxTokens: 1024
    });

    showOutput(result.content);
  } catch (err) {
    showError(err);
  } finally {
    setLoading(false);
  }
}

async function handleStream() {
  const userInput = document.getElementById('userInput').value.trim();
  if (!userInput) return;

  setLoading(true);
  clearOutput();
  showOutputSection();

  try {
    await window.vibeDepot.ai.streamAI(
      {
        messages: [
          { role: 'system', content: 'Your system prompt here.' },
          { role: 'user', content: userInput }
        ],
        maxTokens: 2048
      },
      (chunk) => {
        appendOutput(chunk);
      }
    );
  } catch (err) {
    showError(err);
  } finally {
    setLoading(false);
  }
}

// ── Storage Functions ──────────────────────────────────

async function saveToStorage(key, data) {
  try {
    await window.vibeDepot.storage.set(key, data);
  } catch (err) {
    console.error('Storage save failed:', err);
  }
}

async function loadFromStorage(key) {
  try {
    return await window.vibeDepot.storage.get(key);
  } catch (err) {
    console.error('Storage load failed:', err);
    return null;
  }
}

// ── UI Helpers ─────────────────────────────────────────

function setLoading(loading) {
  document.getElementById('loading').style.display = loading ? 'block' : 'none';
  document.querySelectorAll('button').forEach(btn => btn.disabled = loading);
}

function showOutput(text) {
  const output = document.getElementById('output');
  output.textContent = text;
  document.getElementById('outputSection').style.display = 'block';
}

function clearOutput() {
  document.getElementById('output').textContent = '';
}

function appendOutput(text) {
  document.getElementById('output').textContent += text;
}

function showOutputSection() {
  document.getElementById('outputSection').style.display = 'block';
}

function showError(err) {
  const msg = err.code === 'MISSING_API_KEY'
    ? 'No API key configured. Go to VibeDepot Settings to add one.'
    : err.code === 'AI_PROVIDER_ERROR'
    ? 'AI service error. Please try again.'
    : `Error: ${err.message}`;

  const output = document.getElementById('output');
  output.innerHTML = `<div class="error">${escapeHtml(msg)}</div>`;
  document.getElementById('outputSection').style.display = 'block';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Init ───────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', async () => {
  // Set window title from manifest
  try {
    const info = await window.vibeDepot.shell.getAppInfo();
    if (info) await window.vibeDepot.shell.setTitle(info.name);
  } catch {}

  // Load saved state
  // const saved = await loadFromStorage('state');
  // if (saved) restoreState(saved);
});
```

---

## 9. Multi-Turn Conversation Pattern

For chat-style apps, maintain a message history:

```javascript
let messages = [
  { role: 'system', content: 'You are a helpful assistant.' }
];

async function sendMessage(userText) {
  messages.push({ role: 'user', content: userText });

  const result = await window.vibeDepot.ai.callAI({
    messages,
    maxTokens: 1024
  });

  messages.push({ role: 'assistant', content: result.content });

  // Optionally persist conversation
  await window.vibeDepot.storage.set('conversation', messages);

  return result.content;
}

async function loadConversation() {
  const saved = await window.vibeDepot.storage.get('conversation');
  if (saved && Array.isArray(saved)) {
    messages = saved;
  }
}
```

---

## 10. Theme Support

Detect and respond to the system theme:

```javascript
async function applyTheme() {
  const theme = await window.vibeDepot.shell.theme();
  document.body.classList.toggle('dark', theme === 'dark');
}

// Call on init
window.addEventListener('DOMContentLoaded', applyTheme);
```

Add dark mode CSS:

```css
body.dark {
  background: #1a1a2e;
  color: #e0e0e0;
}

body.dark .output,
body.dark textarea,
body.dark select,
body.dark input[type="text"] {
  background: #2d2d44;
  border-color: #3d3d5c;
  color: #e0e0e0;
}
```

---

## 11. Output Checklist

Before delivering the app, verify:

- [ ] `manifest.json` has all required fields and valid values
- [ ] `id` is kebab-case and descriptive
- [ ] `permissions` only includes what the app actually uses
- [ ] `models.providers` includes all three providers unless there's a specific reason not to
- [ ] `index.html` loads `style.css` and `app.js`, has no external CDN links
- [ ] `app.js` uses `window.vibeDepot` Bridge API (never raw `fetch` to AI providers)
- [ ] All AI calls are wrapped in try/catch with error code handling
- [ ] Storage operations have error handling
- [ ] `escapeHtml()` is used when rendering user-generated or AI-generated content as HTML
- [ ] Loading states and disabled buttons during async operations
- [ ] `DOMContentLoaded` handler sets window title via `shell.setTitle()`
- [ ] CSS is clean, native-feeling, and responsive
- [ ] No inline styles for complex layouts (use CSS classes)
- [ ] Files are in `registry/apps/{app-id}/`

---

## 12. Workflow

1. **Clarify** — Gather app name, purpose, category, and any special requirements
2. **Create directory** — `registry/apps/{app-id}/`
3. **Write manifest.json** — Metadata, permissions, AI config
4. **Write index.html** — Entry point with semantic structure
5. **Write style.css** — Clean, native-feeling styles with dark mode support
6. **Write app.js** — Full app logic using Bridge API patterns above
7. **Review** — Walk through the output checklist
8. **Report** — Tell the user what was created and how to test it (`vibedepot preview` or sideloading)

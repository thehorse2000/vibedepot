import { existsSync, mkdirSync, writeFileSync, cpSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { APP_CATEGORIES } from '../lib/manifest.js';

const TEMPLATES = ['vanilla', 'react', 'chat', 'file-processor', 'api-integration'];

export async function initCommand(name?: string): Promise<void> {
  const answers = await inquirer.prompt([
    ...(name
      ? []
      : [
          {
            type: 'input',
            name: 'name',
            message: 'App name:',
            default: 'my-app',
          },
        ]),
    {
      type: 'list',
      name: 'category',
      message: 'Category:',
      choices: [...APP_CATEGORIES],
    },
    {
      type: 'list',
      name: 'template',
      message: 'Template:',
      choices: TEMPLATES,
    },
  ]);

  const appName = name || answers.name;
  const id = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const displayName = appName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const targetDir = resolve(appName);

  if (existsSync(targetDir)) {
    console.error(`Error: Directory "${appName}" already exists.`);
    process.exit(1);
  }

  mkdirSync(targetDir, { recursive: true });

  // Copy template files
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const templateDir = join(__dirname, '..', 'templates', answers.template);

  if (existsSync(templateDir)) {
    cpSync(templateDir, targetDir, { recursive: true });
  } else {
    // Fallback: create a basic vanilla template inline
    writeFileSync(
      join(targetDir, 'index.html'),
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      padding: 24px;
      min-height: 100vh;
    }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>${displayName}</h1>
  <p>Your VibeDepot app is ready. Start building!</p>

  <script>
    // Bridge API is available at window.vibeDepot
    // vibeDepot.ai.callAI({ messages: [...] })    — AI calls
    // vibeDepot.storage.set(key, value)            — KV storage
    // vibeDepot.storage.get(key)                   — KV retrieval
    // vibeDepot.shell.notify(title, body)          — Notifications
    // vibeDepot.shell.theme()                      — Get system theme
  </script>
</body>
</html>
`
    );
  }

  // Determine permissions based on template
  const permissions: string[] = ['storage.kv'];
  if (['react', 'chat', 'file-processor'].includes(answers.template)) {
    permissions.unshift('ai');
  }
  if (answers.template === 'api-integration') {
    permissions.unshift('ai');
    permissions.push('network');
  }
  if (answers.template === 'file-processor') {
    permissions.push('storage.files');
  }

  // Generate manifest
  const manifest = {
    id,
    name: displayName,
    version: '0.1.0',
    description: '',
    author: '',
    entry: answers.template === 'react' ? 'dist/index.html' : 'index.html',
    category: answers.category,
    permissions,
    ...(permissions.includes('ai')
      ? {
          models: {
            required: true,
            providers: ['anthropic', 'openai', 'gemini'],
          },
        }
      : {}),
  };

  writeFileSync(
    join(targetDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  );

  console.log(`\n✓ Created ${displayName} in ./${appName}/`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${appName}`);
  if (answers.template === 'react') {
    console.log(`  npm install          # Install dependencies`);
    console.log(`  npm run build        # Build for production`);
  }
  console.log(`  vibedepot preview    # Preview in VibeDepot`);
  console.log(`  vibedepot validate   # Check before publishing`);
  console.log(`  vibedepot publish    # Submit to the registry`);
  if (answers.template === 'react') {
    console.log(`\nDevelopment:`);
    console.log(`  npm run dev          # Start Vite dev server`);
  }
}

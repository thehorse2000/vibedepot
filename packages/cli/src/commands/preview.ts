import { existsSync } from 'fs';
import { resolve, join } from 'path';
import { exec } from 'child_process';
import { platform } from 'os';

export async function previewCommand(path?: string): Promise<void> {
  const appDir = resolve(path || '.');
  const manifestPath = join(appDir, 'manifest.json');

  if (!existsSync(manifestPath)) {
    console.error('Error: No manifest.json found in ' + appDir);
    console.error('Run "vibedepot init" to create a new app, or navigate to your app folder.');
    process.exit(1);
  }

  console.log('Previewing in VibeDepot...');
  console.log('Changes will auto-reload on save.\n');

  const os = platform();

  if (os === 'darwin') {
    // macOS: try to open the VibeDepot shell with the sideload argument
    exec(
      `open -a "VibeDepot" --args --sideload="${appDir}"`,
      (err) => {
        if (err) {
          console.log(
            'Could not find VibeDepot.app. To preview:\n' +
            '  1. Open VibeDepot\n' +
            '  2. Go to Library\n' +
            '  3. Click "Sideload App"\n' +
            `  4. Select: ${appDir}`
          );
        }
      }
    );
  } else if (os === 'win32') {
    console.log(
      'To preview your app:\n' +
      '  1. Open VibeDepot\n' +
      '  2. Go to Library\n' +
      '  3. Click "Sideload App"\n' +
      `  4. Select: ${appDir}`
    );
  } else {
    // Linux
    exec(
      `vibedepot-shell --sideload="${appDir}"`,
      (err) => {
        if (err) {
          console.log(
            'To preview your app:\n' +
            '  1. Open VibeDepot\n' +
            '  2. Go to Library\n' +
            '  3. Click "Sideload App"\n' +
            `  4. Select: ${appDir}`
          );
        }
      }
    );
  }
}

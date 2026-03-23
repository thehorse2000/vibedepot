#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { previewCommand } from './commands/preview.js';
import { validateCommand } from './commands/validate.js';
import { publishCommand } from './commands/publish.js';

const program = new Command();

program
  .name('vibedepot')
  .description('CLI tool for VibeDepot app development and publishing')
  .version('0.1.0');

program
  .command('init [name]')
  .description('Scaffold a new VibeDepot app')
  .action(initCommand);

program
  .command('preview [path]')
  .description('Preview your app in the VibeDepot sandbox')
  .action(previewCommand);

program
  .command('validate [path]')
  .description('Validate your app before publishing')
  .action(validateCommand);

program
  .command('publish [path]')
  .description('Bundle and submit your app to the registry')
  .action(publishCommand);

program.parse();

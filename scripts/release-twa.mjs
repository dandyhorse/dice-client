#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const appVersionName = process.argv[2];
if (!appVersionName) {
  throw new Error('Usage: npm run twa:release -- <versionName>');
}

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const twaRoot = path.join(clientRoot, 'android-twa');

const update = spawnSync(
  'npx',
  ['--yes', '@bubblewrap/cli@1.24.1', 'update', `--appVersionName=${appVersionName}`],
  { cwd: twaRoot, stdio: 'inherit' },
);
if (update.status !== 0) process.exit(update.status ?? 1);

const build = spawnSync('node', [path.join(clientRoot, 'scripts', 'build-twa.mjs')], {
  cwd: clientRoot,
  stdio: 'inherit',
});
if (build.status !== 0) process.exit(build.status ?? 1);

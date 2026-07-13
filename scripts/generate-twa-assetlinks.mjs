#!/usr/bin/env node

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const twaRoot = path.join(clientRoot, 'android-twa');
const outputDir = path.join(clientRoot, 'public', '.well-known');
const outputFile = path.join(outputDir, 'assetlinks.json');

await mkdir(outputDir, { recursive: true });

const result = spawnSync(
  'npx',
  [
    '--yes',
    '@bubblewrap/cli@1.24.1',
    'fingerprint',
    'generateAssetLinks',
    `--manifest=${path.join(twaRoot, 'twa-manifest.json')}`,
    `--output=${outputFile}`,
  ],
  { cwd: twaRoot, stdio: 'inherit' },
);

if (result.status !== 0) process.exit(result.status ?? 1);
process.stdout.write(`Generated ${outputFile}\n`);

#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localFile = path.join(clientRoot, 'public', '.well-known', 'assetlinks.json');
const remoteUrl = 'https://www.farklepit.ru/.well-known/assetlinks.json';

const normalize = (value) => JSON.stringify(value);
const local = JSON.parse(await readFile(localFile, 'utf8'));
const response = await fetch(remoteUrl, { redirect: 'error' });

if (!response.ok) {
  throw new Error(`TWA verification failed: ${remoteUrl} returned HTTP ${response.status}`);
}

const remote = await response.json();
if (normalize(remote) !== normalize(local)) {
  throw new Error(`TWA verification failed: ${remoteUrl} does not match ${localFile}`);
}

process.stdout.write(`TWA Digital Asset Links verified: ${remoteUrl}\n`);

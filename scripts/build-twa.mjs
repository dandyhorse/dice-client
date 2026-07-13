#!/usr/bin/env node

import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const twaRoot = path.join(clientRoot, 'android-twa');
const manifestPath = path.join(twaRoot, 'twa-manifest.json');
const outputDir = path.join(clientRoot, '..', 'builds');
const publicApkDir = process.env.TWA_PUBLIC_APK_DIR ?? '/var/www/farklepit/downloads';
const secretsPath = process.env.TWA_SECRETS_FILE ?? path.join(homedir(), '.config', 'farklepit', 'twa.env');

const runBubblewrap = (args, env = process.env) => {
  const result = spawnSync('npx', ['--yes', '@bubblewrap/cli@1.24.1', ...args], {
    cwd: twaRoot,
    env,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

const parseSecrets = (source) =>
  Object.fromEntries(
    source
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=');
        if (separator === -1) throw new Error(`Invalid TWA secret entry in ${secretsPath}`);
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );

const copyFileAtomically = async (source, destination) => {
  await mkdir(path.dirname(destination), { recursive: true });
  const temporaryDestination = `${destination}.tmp-${process.pid}`;
  await copyFile(source, temporaryDestination);
  await rename(temporaryDestination, destination);
};

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const secrets = parseSecrets(await readFile(secretsPath, 'utf8'));
for (const key of [
  'BUBBLEWRAP_KEYSTORE_PASSWORD',
  'BUBBLEWRAP_KEY_PASSWORD',
  'TWA_SIGNING_KEY_PATH',
]) {
  if (!secrets[key]) throw new Error(`Missing ${key} in ${secretsPath}`);
}

runBubblewrap(['update', '--skipVersionUpgrade']);
const patchResult = spawnSync('node', [path.join(clientRoot, 'scripts', 'patch-twa-project.mjs')], {
  cwd: clientRoot,
  stdio: 'inherit',
});
if (patchResult.status !== 0) process.exit(patchResult.status ?? 1);

const verifyResult = spawnSync('node', [path.join(clientRoot, 'scripts', 'verify-twa.mjs')], {
  cwd: clientRoot,
  stdio: 'inherit',
});
if (verifyResult.status !== 0) process.exit(verifyResult.status ?? 1);

runBubblewrap(
  [
    'build',
    `--signingKeyPath=${secrets.TWA_SIGNING_KEY_PATH}`,
    `--signingKeyAlias=${manifest.signingKey.alias}`,
  ],
  { ...process.env, ...secrets },
);

const sourceApk = path.join(twaRoot, 'app-release-signed.apk');
const releaseName = `farklepit-twa-v${manifest.appVersionCode}.apk`;
const releaseApk = path.join(outputDir, releaseName);
const latestApk = path.join(outputDir, 'farklepit-twa-latest.apk');
const publicApk = path.join(publicApkDir, 'farklepit-android.apk');

await mkdir(outputDir, { recursive: true });
await copyFileAtomically(sourceApk, releaseApk);
await copyFileAtomically(sourceApk, latestApk);
await copyFileAtomically(sourceApk, publicApk);

const sha256 = createHash('sha256').update(await readFile(releaseApk)).digest('hex');
const checksum = `${sha256}  ${releaseName}\n`;
await writeFile(`${releaseApk}.sha256`, checksum);
await writeFile(path.join(outputDir, 'farklepit-twa-latest.apk.sha256'), checksum);

process.stdout.write(`APK: ${releaseApk}\nPublic APK: ${publicApk}\nSHA-256: ${sha256}\n`);

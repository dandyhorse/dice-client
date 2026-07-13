#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const launcherPath = path.join(
  clientRoot,
  'android-twa',
  'app',
  'src',
  'main',
  'java',
  'ru',
  'farklepit',
  'game',
  'LauncherActivity.java',
);

const importAnchor = 'import android.os.Bundle;';
const launchUrlAnchor = '    @Override\n    protected Uri getLaunchingUrl() {';
const method = `    @Override
    protected TrustedWebActivityDisplayMode getDisplayMode() {
        final int cutoutMode = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
                ? WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                : WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT;
        return new TrustedWebActivityDisplayMode.ImmersiveMode(true, cutoutMode);
    }

`;

let source = await readFile(launcherPath, 'utf8');

if (!source.includes('TrustedWebActivityDisplayMode getDisplayMode()')) {
  if (!source.includes(importAnchor) || !source.includes(launchUrlAnchor)) {
    throw new Error(`Unexpected Bubblewrap LauncherActivity template: ${launcherPath}`);
  }
  source = source.replace(
    importAnchor,
    `${importAnchor}\nimport android.view.WindowManager;\n\nimport androidx.browser.trusted.TrustedWebActivityDisplayMode;`,
  );
  source = source.replace(launchUrlAnchor, `${method}${launchUrlAnchor}`);
  await writeFile(launcherPath, source);
}

process.stdout.write(`Patched TWA immersive cutout mode: ${launcherPath}\n`);

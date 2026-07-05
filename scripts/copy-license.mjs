#!/usr/bin/env node
/**
 * Copies the repository root LICENSE into the current package directory.
 * Invoked from package prepack scripts before build.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = process.cwd();
const source = path.join(root, 'LICENSE');
const dest = path.join(target, 'LICENSE');

if (!fs.existsSync(source)) {
  console.error(`copy-license: root LICENSE not found at ${source}`);
  process.exit(1);
}

fs.copyFileSync(source, dest);

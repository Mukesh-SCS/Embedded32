#!/usr/bin/env node
/**
 * Copy generated TypeDoc output into the Next.js public directory for static serving.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const MONOREPO_ROOT = path.resolve(SITE_ROOT, '../..');
const API_SRC = path.join(MONOREPO_ROOT, 'docs', 'api');
const API_DEST = path.join(SITE_ROOT, 'public', 'api-ref');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`sync-content: missing ${src} — run npm run docs:api from monorepo root first`);
    return false;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  return true;
}

function main() {
  if (fs.existsSync(API_DEST)) {
    fs.rmSync(API_DEST, { recursive: true, force: true });
  }
  const ok = copyRecursive(API_SRC, API_DEST);
  if (ok) {
    console.log(`sync-content: copied API docs to public/api-ref`);
  }
}

main();

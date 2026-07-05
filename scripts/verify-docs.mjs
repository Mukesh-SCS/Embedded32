#!/usr/bin/env node
/**
 * Verify documentation artifacts that exist today (API docs).
 * Site build (apps/site) is added when Phase 9 lands.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  return result.status === 0;
}

function main() {
  console.log('Documentation verification');

  if (!run('npm', ['run', 'docs:api', '--silent'])) {
    console.error('FAIL: npm run docs:api');
    process.exit(1);
  }

  const indexHtml = path.join(ROOT, 'docs', 'api', 'index.html');
  if (!fs.existsSync(indexHtml)) {
    console.error('FAIL: docs/api/index.html not generated');
    process.exit(1);
  }

  const siteDir = path.join(ROOT, 'apps', 'site');
  if (!fs.existsSync(path.join(siteDir, 'package.json'))) {
    console.log('  ⏭ apps/site not implemented yet (Phase 9) — skipped');
  }

  console.log('  ✓ API documentation generated');
}

main();

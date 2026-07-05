#!/usr/bin/env node
/**
 * Build the static site export and stage it under .e2e-pages/Embedded32/
 * for Playwright tests that mirror GitHub Pages hosting.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'apps/site/out');
const STAGE_ROOT = path.join(ROOT, '.e2e-pages');
const STAGE = path.join(STAGE_ROOT, 'Embedded32');

function run(cmd, args, env = {}) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

console.log('Preparing E2E Pages export...');

const stageOnly = process.env.E2E_STAGE_ONLY === '1';

if (!stageOnly) {
  run('npm', ['run', 'docs:api']);
  run('npm', ['run', 'build', '--workspace', 'apps/site'], { NODE_ENV: 'production' });
  run('node', ['scripts/verify-pages-build.mjs']);
} else if (!fs.existsSync(path.join(OUT, 'index.html'))) {
  console.error('E2E_STAGE_ONLY set but apps/site/out is missing');
  process.exit(1);
}

if (!fs.existsSync(path.join(OUT, 'index.html'))) {
  console.error('Missing apps/site/out/index.html');
  process.exit(1);
}

if (fs.existsSync(STAGE_ROOT)) {
  fs.rmSync(STAGE_ROOT, { recursive: true, force: true });
}
fs.mkdirSync(STAGE, { recursive: true });
copyDir(OUT, STAGE);

if (!fs.existsSync(path.join(STAGE, '404.html')) && fs.existsSync(path.join(STAGE, 'index.html'))) {
  fs.copyFileSync(path.join(STAGE, 'index.html'), path.join(STAGE, '404.html'));
}

console.log(`Staged export at ${STAGE}`);

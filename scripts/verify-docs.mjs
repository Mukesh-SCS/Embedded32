#!/usr/bin/env node
/**
 * Verify documentation artifacts: TypeDoc API output and docs site build.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function run(command, args, cwd = ROOT) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (!result.ok && result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }
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
  console.log('  ✓ API documentation generated');

  const siteDir = path.join(ROOT, 'apps', 'site');
  const sitePkg = path.join(siteDir, 'package.json');
  if (!fs.existsSync(sitePkg)) {
    console.error('FAIL: apps/site/package.json missing');
    process.exit(1);
  }

  if (!run('npm', ['run', 'build'], siteDir)) {
    console.error('FAIL: apps/site build');
    process.exit(1);
  }

  const siteApiRef = path.join(siteDir, 'public', 'api-ref', 'index.html');
  if (!fs.existsSync(siteApiRef)) {
    console.error('FAIL: apps/site/public/api-ref/index.html not synced');
    process.exit(1);
  }

  console.log('  ✓ Documentation site build');
}

main();

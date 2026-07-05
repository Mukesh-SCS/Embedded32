#!/usr/bin/env node
/**
 * Verify key examples run after build and contain no absolute paths.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const EXAMPLES = ['examples/j1939-basic.ts', 'examples/j1939-diagnostics.ts'];

const ABSOLUTE_PATH_PATTERNS = [/^[A-Za-z]:\\/m, /\/Users\/[^/\s]+/, /\/home\/[^/\s]+/];

function runExample(relPath) {
  const full = path.join(ROOT, relPath);
  const result = spawnSync('npx', ['tsx', full], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    timeout: 60_000,
  });
  return {
    ok: result.status === 0,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
    status: result.status ?? 1,
  };
}

function scanFile(relPath) {
  const content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  for (const pattern of ABSOLUTE_PATH_PATTERNS) {
    if (pattern.test(content)) {
      return `absolute path pattern in ${relPath}`;
    }
  }
  return null;
}

function main() {
  console.log('Example verification');

  for (const file of EXAMPLES) {
    const issue = scanFile(file);
    if (issue) {
      console.error(`FAIL hygiene: ${issue}`);
      process.exit(1);
    }
  }
  console.log('  ✓ no absolute paths in checked examples');

  for (const file of EXAMPLES) {
    console.log(`  ▶ ${file}`);
    const result = runExample(file);
    if (!result.ok) {
      console.error(`FAIL ${file} (exit ${result.status})`);
      console.error(result.output);
      process.exit(1);
    }
  }

  console.log(`All ${EXAMPLES.length} examples passed`);
}

main();

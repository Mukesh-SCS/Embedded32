#!/usr/bin/env node
/**
 * Run Jest coverage on core libraries and enforce per-package line thresholds.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PACKAGES = [
  {
    id: 'can',
    dir: 'embedded32-can',
    minLines: 60,
    command: ['npm', 'run', 'test:coverage', '--silent'],
  },
  {
    id: 'j1939',
    dir: 'embedded32-j1939',
    minLines: 70,
    command: [
      'npm',
      'run',
      'test:coverage',
      '--silent',
      '--',
      '--coverageReporters=json-summary',
      '--coverageReporters=text',
    ],
  },
  {
    id: 'core',
    dir: 'embedded32-core',
    minLines: 0,
    command: [
      'npx',
      'jest',
      '--coverage',
      '--coverageReporters=json-summary',
      '--coverageReporters=text',
      '--silent',
    ],
  },
  {
    id: 'bridge',
    dir: 'embedded32-bridge',
    minLines: 0,
    command: ['npm', 'run', 'test', '--silent', '--', '--coverage', '--coverageReporters=json-summary', '--coverageReporters=text'],
  },
];

function runInPackage(pkgDir, command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: path.join(ROOT, pkgDir),
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status ?? 1,
  };
}

function readCoverageSummary(pkgDir) {
  const summaryPath = path.join(ROOT, pkgDir, 'coverage', 'coverage-summary.json');
  if (!fs.existsSync(summaryPath)) {
    return null;
  }
  const data = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  const total = data.total;
  if (!total) return null;
  return {
    lines: total.lines.pct,
    statements: total.statements.pct,
    functions: total.functions.pct,
    branches: total.branches.pct,
  };
}

function main() {
  console.log('Coverage report for core libraries\n');

  const rows = [];
  let failed = 0;

  for (const pkg of PACKAGES) {
    process.stdout.write(`▶ ${pkg.id} ... `);
    const result = runInPackage(pkg.dir, pkg.command);
    if (!result.ok) {
      console.log('FAIL');
      console.error(result.stderr || result.stdout);
      failed++;
      continue;
    }
    const summary = readCoverageSummary(pkg.dir);
    if (!summary) {
      console.log('FAIL (no coverage-summary.json)');
      failed++;
      continue;
    }
    if (pkg.minLines > 0 && summary.lines < pkg.minLines) {
      console.log(`FAIL (lines ${summary.lines}% < ${pkg.minLines}%)`);
      failed++;
      continue;
    }
    console.log('ok');
    rows.push({ id: pkg.id, minLines: pkg.minLines, ...summary });
  }

  if (rows.length > 0) {
    console.log('\n| Package | Min lines | Lines | Statements | Functions | Branches |');
    console.log('|---------|-----------|-------|------------|-----------|----------|');
    for (const row of rows) {
      console.log(
        `| ${row.id} | ${row.minLines || '-'} | ${row.lines}% | ${row.statements}% | ${row.functions}% | ${row.branches}% |`
      );
    }
  }

  if (failed > 0) {
    process.exit(1);
  }
}

main();

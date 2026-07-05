#!/usr/bin/env node
/**
 * Fail CI when known obsolete documentation phrases reappear.
 * Complements human review in docs/maintainers/documentation-consistency-audit.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SCAN_ROOTS = [
  'README.md',
  'ROADMAP.md',
  'CHANGELOG.md',
  'SECURITY.md',
  'SUPPORT.md',
  'CONTRIBUTING.md',
  'docs',
  'apps/site',
  'labs',
  'embedded32-can',
  'embedded32-core',
  'embedded32-j1939',
  'embedded32-sim',
  'embedded32-tools',
  'embedded32-bridge',
  'embedded32-ethernet',
  'embedded32-supervisor',
  'embedded32-cli',
  'embedded32-sdk-js',
  'embedded32-dashboard',
  'examples',
];

const SKIP_DIRS = new Set(['node_modules', '.next', 'out', 'dist', 'coverage', 'api', '.git']);

/** phrase, optional allowed path substring (if phrase is OK in that file) */
const OBSOLETE_PATTERNS = [
  { pattern: /labs are planned/i, hint: 'Labs are shipped under labs/' },
  { pattern: /placeholder index:\s*labs\/README/i, hint: 'labs/README.md is the lab catalog' },
  { pattern: /coming in Phase 10/i, hint: 'Browser demo is implemented at /demo' },
  { pattern: /Placeholder until Phase 10/i, hint: 'Demo route is live' },
  { pattern: /future browser demo/i, hint: 'Demo exists in apps/demo' },
  { pattern: /planned browser (demo|playground)/i, hint: 'Demo is implemented' },
  { pattern: /docs site \(planned\)/i, hint: 'Site is built' },
  { pattern: /browser demo \(planned\)/i, hint: 'Demo is built' },
  { pattern: /will appear in `SECURITY\.md` \(Phase 6\)/i, hint: 'SECURITY.md is complete' },
  { pattern: /details will be documented in `SECURITY\.md`/i, hint: 'Link SECURITY.md directly' },
  { pattern: /vercel\.com/i, hint: 'GitHub Pages is the deployment target' },
  { pattern: /deploy to Vercel/i, hint: 'Use GitHub Pages' },
  { pattern: /Complete SAE J1939 implementation/i, hint: 'Use educational J1939 subset' },
  {
    pattern: /npm install embedded32-dashboard/i,
    hint: 'Dashboard is @embedded32/dashboard and private',
  },
  { pattern: /npm install -g embedded32-cli/i, hint: 'Use @embedded32/cli' },
  { pattern: /Planned lab 4/i, hint: 'Lab 4 exists at labs/lab-04-diagnostics-and-faults' },
  { pattern: /structured coursework \(Phase 5\)/i, hint: 'Phase 5 is complete' },
  { pattern: /structured lab sequence \(Phase 5\)/i, hint: 'Labs are available now' },
];

const REQUIRED_PHRASES = [
  { file: 'docs/deployment/GITHUB_PAGES.md', pattern: /GitHub Pages/i },
  { file: 'SECURITY.md', pattern: /Reporting a vulnerability/i },
  { file: 'labs/README.md', pattern: /lab-01-can-basics/i },
];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(md|mdx|tsx?|json)$/i.test(entry.name)) acc.push(full);
  }
  return acc;
}

function collectFiles() {
  const files = new Set();
  for (const root of SCAN_ROOTS) {
    const full = path.join(ROOT, root);
    if (!fs.existsSync(full)) continue;
    if (fs.statSync(full).isDirectory()) walk(full).forEach((f) => files.add(f));
    else files.add(full);
  }
  return [...files].filter(
    (f) =>
      !f.includes(
        `${path.sep}docs${path.sep}maintainers${path.sep}documentation-consistency-audit.md`
      )
  );
}

function main() {
  console.log('Documentation status verification');
  const errors = [];
  const files = collectFiles();

  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const text = fs.readFileSync(file, 'utf8');

    if (rel.includes('docs/maintainers/documentation-consistency-audit.md')) continue;
    if (rel.includes('docs/maintainers/baseline-status.md')) continue;
    if (rel.includes('docs/maintainers/repository-audit.md')) continue;
    if (rel.includes('docs/maintainers/open-source-upgrade-summary.md')) continue;

    for (const { pattern, hint } of OBSOLETE_PATTERNS) {
      if (pattern.test(text)) {
        errors.push(`${rel}: obsolete phrase (${hint})`);
      }
    }
  }

  for (const { file, pattern } of REQUIRED_PHRASES) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) {
      errors.push(`Missing required doc file: ${file}`);
      continue;
    }
    const text = fs.readFileSync(full, 'utf8');
    if (!pattern.test(text)) {
      errors.push(`${file}: missing expected content (${pattern})`);
    }
  }

  if (errors.length) {
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error(`\nFAIL: ${errors.length} documentation consistency problem(s).`);
    process.exit(1);
  }

  console.log(`  ✓ Scanned ${files.length} files`);
  console.log('  ✓ No obsolete documentation phrases detected');
}

main();

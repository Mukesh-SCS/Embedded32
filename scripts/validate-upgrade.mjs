#!/usr/bin/env node
/**
 * Final validation checklist for the 15-phase open-source upgrade.
 * Verifies that expected artifacts exist - does not re-run the full verify suite.
 *
 * Usage: npm run validate:upgrade
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CHECKS = [
  // Phase 1
  { phase: 1, label: 'Repository audit doc', path: 'docs/maintainers/repository-audit.md' },
  { phase: 1, label: 'Package audit script', path: 'scripts/audit-packages.mjs' },
  // Phase 2
  { phase: 2, label: 'Smoke install script', path: 'scripts/smoke-install-packages.mjs' },
  { phase: 2, label: 'Copy license script', path: 'scripts/copy-license.mjs' },
  // Phase 3
  { phase: 3, label: 'ESLint config', path: 'eslint.config.js' },
  { phase: 3, label: 'Root verify script', path: 'package.json', contains: '"verify"' },
  // Phase 4
  { phase: 4, label: 'Getting started guide', path: 'docs/getting-started.md' },
  { phase: 4, label: 'TypeDoc config', path: 'typedoc.json' },
  { phase: 4, label: 'Citation doc', path: 'docs/citation.md' },
  // Phase 5
  { phase: 5, label: 'Labs index', path: 'labs/README.md' },
  { phase: 5, label: 'Lab 01', path: 'labs/lab-01-can-basics/solution/lab.ts' },
  { phase: 5, label: 'Lab verify script', path: 'scripts/verify-labs.mjs' },
  { phase: 5, label: 'Sample traces', path: 'examples/traces/normal-operation.json' },
  // Phase 6
  { phase: 6, label: 'CONTRIBUTING', path: 'CONTRIBUTING.md' },
  { phase: 6, label: 'CODE_OF_CONDUCT', path: 'CODE_OF_CONDUCT.md' },
  { phase: 6, label: 'CITATION.cff', path: 'CITATION.cff' },
  { phase: 6, label: 'Issue template bug', path: '.github/ISSUE_TEMPLATE/bug.yml' },
  // Phase 7
  { phase: 7, label: 'CI workflow', path: '.github/workflows/ci.yml' },
  { phase: 7, label: 'CodeQL workflow', path: '.github/workflows/codeql.yml' },
  { phase: 7, label: 'Dependabot', path: '.github/dependabot.yml' },
  { phase: 7, label: 'package-lock.json', path: 'package-lock.json' },
  // Phase 8
  { phase: 8, label: 'Release workflow', path: '.github/workflows/release.yml' },
  { phase: 8, label: 'Release dry-run script', path: 'scripts/release-dry-run.mjs' },
  { phase: 8, label: 'Release process doc', path: 'docs/maintainers/release-process.md' },
  // Phase 9
  { phase: 9, label: 'Documentation site', path: 'apps/site/package.json' },
  { phase: 9, label: 'Site docs route', path: 'apps/site/src/app/docs/[[...slug]]/page.tsx' },
  // Phase 10
  { phase: 10, label: 'Browser demo package', path: 'apps/demo/src/index.ts' },
  { phase: 10, label: 'Demo site route', path: 'apps/site/src/app/demo/DemoClient.tsx' },
  // Phase 11
  { phase: 11, label: 'Deploy Pages workflow', path: '.github/workflows/deploy-pages.yml' },
  { phase: 11, label: 'GitHub Pages doc', path: 'docs/deployment/GITHUB_PAGES.md' },
  { phase: 11, label: 'Pages build verify', path: 'scripts/verify-pages-build.mjs' },
  // Phase 12
  { phase: 12, label: 'Zenodo runbook', path: 'docs/maintainers/zenodo-release.md' },
  { phase: 12, label: 'Citation verify script', path: 'scripts/verify-citation.mjs' },
  // Phase 13
  { phase: 13, label: 'Evidence README', path: 'evidence/README.md' },
  { phase: 13, label: 'Evidence latest metrics', path: 'evidence/metrics-latest.json' },
  { phase: 13, label: 'Evidence verify script', path: 'scripts/verify-evidence.mjs' },
  // Phase 14
  { phase: 14, label: 'ROADMAP', path: 'ROADMAP.md', contains: '15-phase' },
  // Phase 15
  { phase: 15, label: 'Upgrade summary', path: 'docs/maintainers/open-source-upgrade-summary.md' },
];

function checkEntry(entry) {
  const full = path.join(ROOT, entry.path);
  if (!fs.existsSync(full)) {
    return { ok: false, reason: 'missing' };
  }
  if (entry.contains) {
    const text = fs.readFileSync(full, 'utf8');
    if (!text.includes(entry.contains)) {
      return { ok: false, reason: `missing content: ${entry.contains}` };
    }
  }
  return { ok: true };
}

function main() {
  console.log('Open-source upgrade validation (Phases 1–15 artifacts)\n');

  const byPhase = new Map();
  let failed = 0;

  for (const entry of CHECKS) {
    const result = checkEntry(entry);
    const status = result.ok ? '✓' : '✗';
    const phase = entry.phase;
    if (!byPhase.has(phase)) byPhase.set(phase, []);
    byPhase.get(phase).push({ entry, result, status });
    if (!result.ok) failed++;
  }

  for (const phase of [...byPhase.keys()].sort((a, b) => a - b)) {
    console.log(`Phase ${phase}`);
    for (const { entry, result, status } of byPhase.get(phase)) {
      const detail = result.ok ? '' : ` (${result.reason})`;
      console.log(`  ${status} ${entry.label}${detail}`);
    }
    console.log('');
  }

  if (failed > 0) {
    console.error(`FAIL: ${failed} artifact check(s) missing.`);
    process.exit(1);
  }

  console.log(`PASS: all ${CHECKS.length} upgrade artifacts present.`);
  console.log('Run npm run verify for full behavioral validation.');
}

main();

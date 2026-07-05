#!/usr/bin/env node
/**
 * Collect verifiable project metrics into evidence/snapshots/.
 *
 * Usage:
 *   node scripts/collect-evidence.mjs
 *   node scripts/collect-evidence.mjs --skip-verify
 *   node scripts/collect-evidence.mjs --skip-verify --use-existing-coverage
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EVIDENCE_DIR = path.join(ROOT, 'evidence');
const SNAPSHOTS_DIR = path.join(EVIDENCE_DIR, 'snapshots');

const PUBLIC_PACKAGE_DIRS = [
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
];

const COVERAGE_PACKAGES = [
  { id: 'j1939', dir: 'embedded32-j1939' },
  { id: 'core', dir: 'embedded32-core' },
  { id: 'can', dir: 'embedded32-can' },
];

function parseArgs(argv) {
  return {
    skipVerify: argv.includes('--skip-verify'),
    useExistingCoverage: argv.includes('--use-existing-coverage'),
  };
}

function run(command, args, cwd = ROOT) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  return {
    ok: result.status === 0,
    stdout: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

function gitValue(args) {
  const result = run('git', args);
  return result.ok ? result.stdout.trim() : null;
}

function countMarkdownDocs() {
  const docsRoot = path.join(ROOT, 'docs');
  let count = 0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'api') continue;
        walk(full);
      } else if (entry.name.endsWith('.md')) {
        count++;
      }
    }
  }
  if (fs.existsSync(docsRoot)) walk(docsRoot);
  return count;
}

function countSiteRoutes() {
  const outDir = path.join(ROOT, 'apps', 'site', 'out');
  if (!fs.existsSync(outDir)) return null;
  let routes = 0;
  function walk(dir, depth = 0) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === '_next' || entry.name === 'api-ref') continue;
      const full = path.join(dir, entry.name);
      if (fs.existsSync(path.join(full, 'index.html'))) routes++;
      walk(full, depth + 1);
    }
  }
  if (fs.existsSync(path.join(outDir, 'index.html'))) routes++;
  walk(outDir);
  return routes;
}

function listLabs() {
  const labsRoot = path.join(ROOT, 'labs');
  if (!fs.existsSync(labsRoot)) return [];
  return fs
    .readdirSync(labsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('lab-'))
    .map((d) => d.name)
    .sort();
}

function listWorkflows() {
  const wf = path.join(ROOT, '.github', 'workflows');
  if (!fs.existsSync(wf)) return [];
  return fs
    .readdirSync(wf)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .sort();
}

function readCoverageSummary(pkgDir) {
  const summaryPath = path.join(ROOT, pkgDir, 'coverage', 'coverage-summary.json');
  if (!fs.existsSync(summaryPath)) return null;
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

function collectCoverage(opts) {
  if (!opts.useExistingCoverage) {
    const ok = run('npm', ['run', 'test:coverage', '--silent']);
    if (!ok.ok) return { collected: false, error: 'test:coverage failed', packages: {} };
  }
  const packages = {};
  for (const pkg of COVERAGE_PACKAGES) {
    const summary = readCoverageSummary(pkg.dir);
    if (summary) packages[pkg.id] = summary;
  }
  return { collected: Object.keys(packages).length > 0, packages };
}

function zenodoDoiIssued() {
  const cff = fs.readFileSync(path.join(ROOT, 'CITATION.cff'), 'utf8');
  return /^\s*-\s*type:\s*doi\s*$/m.test(cff) && /value:\s*10\.\d+\//.test(cff);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const collectedAt = new Date().toISOString();
  const dateStamp = collectedAt.slice(0, 10);

  let verifyPassed = null;
  if (!opts.skipVerify) {
    console.log('Running npm run verify for evidence snapshot...');
    const verify = run('npm', ['run', 'verify', '--silent']);
    verifyPassed = verify.ok;
    if (!verify.ok) {
      console.error('verify failed - snapshot will record verifyPassed: false');
    }
  }

  const labs = listLabs();
  const tracesDir = path.join(ROOT, 'examples', 'traces');
  const traceCount = fs.existsSync(tracesDir)
    ? fs.readdirSync(tracesDir).filter((f) => f.endsWith('.json')).length
    : 0;

  const educationDir = path.join(ROOT, 'docs', 'education');
  const educationDocs = fs.existsSync(educationDir)
    ? fs.readdirSync(educationDir).filter((f) => f.endsWith('.md')).length
    : 0;

  console.log('Collecting coverage metrics...');
  const coverage = collectCoverage(opts);

  const metrics = {
    format: 'embedded32-evidence-v1',
    collectedAt,
    git: {
      branch: gitValue(['branch', '--show-current']),
      commit: gitValue(['rev-parse', 'HEAD']),
      commitShort: gitValue(['rev-parse', '--short', 'HEAD']),
    },
    verification: {
      npmVerifyPassed: verifyPassed,
      verifySkipped: opts.skipVerify,
    },
    packages: {
      publicCount: PUBLIC_PACKAGE_DIRS.length,
      directories: PUBLIC_PACKAGE_DIRS,
    },
    education: {
      labCount: labs.length,
      labs,
      syntheticTraceCount: traceCount,
      educationDocCount: educationDocs,
      browserDemoPresent: fs.existsSync(path.join(ROOT, 'apps', 'demo', 'src', 'index.ts')),
    },
    documentation: {
      markdownDocCount: countMarkdownDocs(),
      siteStaticRouteCount: countSiteRoutes(),
      apiReferenceIndexPresent: fs.existsSync(path.join(ROOT, 'docs', 'api', 'index.html')),
      citationDocPresent: fs.existsSync(path.join(ROOT, 'docs', 'citation.md')),
    },
    quality: {
      coverage,
      coverageBaselineDoc: 'docs/maintainers/coverage-baseline.md',
    },
    automation: {
      workflowCount: listWorkflows().length,
      workflows: listWorkflows(),
      rootScripts: Object.keys(
        JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).scripts ?? {}
      ),
    },
    deployment: {
      githubPagesWorkflowPresent: fs.existsSync(
        path.join(ROOT, '.github', 'workflows', 'deploy-pages.yml')
      ),
      publishedUrl: 'https://mukesh-scs.github.io/Embedded32/',
      npmPublished: false,
    },
    citation: {
      cffPresent: fs.existsSync(path.join(ROOT, 'CITATION.cff')),
      zenodoDoiIssued: zenodoDoiIssued(),
    },
    notes: [
      'Metrics are collected from the repository and local commands - not from GitHub/npm download APIs.',
      'Outreach metrics (stars, classroom pilots) are recorded manually in evidence/outreach-log.md.',
    ],
  };

  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  const snapshotPath = path.join(SNAPSHOTS_DIR, `${dateStamp}.json`);
  const latestPath = path.join(EVIDENCE_DIR, 'metrics-latest.json');

  fs.writeFileSync(snapshotPath, `${JSON.stringify(metrics, null, 2)}\n`);
  fs.writeFileSync(latestPath, `${JSON.stringify(metrics, null, 2)}\n`);

  console.log(`\nEvidence snapshot written:`);
  console.log(`  ${path.relative(ROOT, snapshotPath)}`);
  console.log(`  ${path.relative(ROOT, latestPath)}`);
  console.log(
    `\nSummary: ${labs.length} labs, ${PUBLIC_PACKAGE_DIRS.length} public packages, ${metrics.documentation.markdownDocCount} docs markdown files`
  );
  if (coverage.collected) {
    console.log(
      `Coverage: j1939 ${coverage.packages.j1939?.lines}%, core ${coverage.packages.core?.lines}%, can ${coverage.packages.can?.lines}%`
    );
  }
}

main();

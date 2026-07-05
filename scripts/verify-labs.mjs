#!/usr/bin/env node
/**
 * Verify classroom lab solutions: run each solution script, check output markers,
 * scan lab files for absolute paths and credential-like patterns.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

const LABS = [
  {
    id: 'lab-01-can-basics',
    solution: 'labs/lab-01-can-basics/solution/lab.ts',
    expected: 'labs/lab-01-can-basics/expected-output/sample.txt',
    checks: [],
  },
  {
    id: 'lab-02-j1939-messaging',
    solution: 'labs/lab-02-j1939-messaging/solution/lab.ts',
    expected: 'labs/lab-02-j1939-messaging/expected-output/sample.txt',
    checks: [{ lineIncludes: 'LAB02_NAME', valueIncludes: 'EEC1' }],
  },
  {
    id: 'lab-03-multi-ecu-simulation',
    solution: 'labs/lab-03-multi-ecu-simulation/solution/lab.ts',
    expected: 'labs/lab-03-multi-ecu-simulation/expected-output/sample.txt',
    checks: [{ parseMarker: 'LAB03_FRAME_COUNT', min: 8 }],
  },
  {
    id: 'lab-04-diagnostics-and-faults',
    solution: 'labs/lab-04-diagnostics-and-faults/solution/lab.ts',
    expected: 'labs/lab-04-diagnostics-and-faults/expected-output/sample.txt',
    checks: [],
  },
];

const CREDENTIAL_PATTERNS = [
  /api[_-]?key\s*=\s*['"][^'"]+['"]/i,
  /password\s*=\s*['"][^'"]+['"]/i,
  /BEGIN (RSA |OPENSSH )?PRIVATE KEY/,
  /AKIA[0-9A-Z]{16}/,
];

const ABSOLUTE_PATH_PATTERNS = [/^[A-Za-z]:\\/m, /\/Users\/[^/\s]+/, /\/home\/[^/\s]+/];

function log(msg, color = '') {
  console.log(`${color}${msg}${colors.reset}`);
}

function runTsx(scriptRel) {
  const scriptPath = path.join(ROOT, scriptRel);
  const result = spawnSync('npx', ['tsx', scriptPath], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    timeout: 120_000,
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

function readExpectedLines(expectedRel) {
  const filePath = path.join(ROOT, expectedRel);
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function parseMarker(stdout, name) {
  const match = stdout.match(new RegExp(`${name}=(\\S+)`));
  return match ? match[1] : null;
}

function collectLabFiles(dirRel) {
  const base = path.join(ROOT, dirRel);
  const files = [];
  for (const entry of ['starter', 'solution']) {
    const folder = path.join(base, entry);
    if (fs.existsSync(folder)) {
      for (const name of fs.readdirSync(folder)) {
        if (name.endsWith('.ts') || name.endsWith('.mjs') || name.endsWith('.js')) {
          files.push(path.join(folder, name));
        }
      }
    }
  }
  return files;
}

function scanHygiene() {
  const issues = [];
  for (const lab of LABS) {
    for (const filePath of collectLabFiles(`labs/${lab.id}`)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const rel = path.relative(ROOT, filePath);

      for (const pattern of ABSOLUTE_PATH_PATTERNS) {
        if (pattern.test(content)) {
          issues.push(`${rel}: contains absolute path pattern ${pattern}`);
        }
      }
      for (const pattern of CREDENTIAL_PATTERNS) {
        if (pattern.test(content)) {
          issues.push(`${rel}: possible credential pattern`);
        }
      }
    }
  }
  return issues;
}

function verifyLab(lab) {
  log(`\n▶ ${lab.id}`, colors.cyan);

  if (!fs.existsSync(path.join(ROOT, lab.solution))) {
    return { ok: false, error: `Missing solution: ${lab.solution}` };
  }

  const run = runTsx(lab.solution);
  if (!run.ok) {
    return { ok: false, error: `Exit ${run.status}\n${run.stdout}` };
  }

  const expectedLines = readExpectedLines(lab.expected);
  for (const line of expectedLines) {
    if (!run.stdout.includes(line)) {
      return { ok: false, error: `Expected line not found: ${line}` };
    }
  }

  for (const check of lab.checks) {
    if (check.lineIncludes && check.valueIncludes) {
      const lines = run.stdout.split(/\r?\n/);
      const hit = lines.some(
        (l) => l.includes(check.lineIncludes) && l.includes(check.valueIncludes)
      );
      if (!hit) {
        return {
          ok: false,
          error: `Check failed: output should include ${check.lineIncludes} and ${check.valueIncludes}`,
        };
      }
    }
    if (check.parseMarker && check.min != null) {
      const value = parseMarker(run.stdout, check.parseMarker);
      const num = Number(value);
      if (!Number.isFinite(num) || num < check.min) {
        return {
          ok: false,
          error: `${check.parseMarker} should be >= ${check.min}, got ${value}`,
        };
      }
    }
  }

  log(`  ✓ solution output matches expected markers`, colors.green);
  return { ok: true };
}

function main() {
  log('Embedded32 lab verification', colors.cyan);

  const hygieneIssues = scanHygiene();
  if (hygieneIssues.length > 0) {
    log('\nHygiene scan failed:', colors.red);
    for (const issue of hygieneIssues) {
      log(`  • ${issue}`, colors.red);
    }
    process.exit(1);
  }
  log('  ✓ lab files: no absolute paths or credential patterns', colors.green);

  let failed = 0;
  for (const lab of LABS) {
    const result = verifyLab(lab);
    if (!result.ok) {
      failed++;
      log(`  ✗ ${result.error}`, colors.red);
    }
  }

  log('');
  if (failed > 0) {
    log(`Lab verification failed (${failed}/${LABS.length})`, colors.red);
    process.exit(1);
  }

  log(`All ${LABS.length} lab solutions passed`, colors.green);
}

main();

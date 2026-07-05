#!/usr/bin/env node
/**
 * Validate evidence snapshots - structure, required fields, no secrets.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EVIDENCE_DIR = path.join(ROOT, 'evidence');
const SNAPSHOTS_DIR = path.join(EVIDENCE_DIR, 'snapshots');

const errors = [];

function fail(message) {
  errors.push(message);
}

function requireField(obj, pathLabel, type) {
  const parts = pathLabel.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null || !(p in cur)) {
      fail(`Missing field: ${pathLabel}`);
      return;
    }
    cur = cur[p];
  }
  if (type === 'array' && !Array.isArray(cur)) fail(`${pathLabel} must be an array`);
  if (type === 'boolean' && typeof cur !== 'boolean') fail(`${pathLabel} must be boolean`);
  if (type === 'number' && typeof cur !== 'number') fail(`${pathLabel} must be number`);
  if (type === 'string' && typeof cur !== 'string') fail(`${pathLabel} must be string`);
}

function scanForSecrets(text, relPath) {
  const patterns = [
    /AKIA[0-9A-Z]{16}/,
    /ghp_[A-Za-z0-9]{20,}/,
    /npm_[A-Za-z0-9]{20,}/,
    /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
  ];
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      fail(`Possible secret in ${relPath}`);
    }
  }
}

function validateMetrics(metrics, relPath) {
  if (metrics.format !== 'embedded32-evidence-v1') {
    fail(`${relPath}: unexpected format ${metrics.format}`);
  }

  const required = [
    'collectedAt',
    'git.branch',
    'git.commit',
    'verification',
    'packages.publicCount',
    'education.labCount',
    'documentation.markdownDocCount',
    'automation.workflowCount',
    'citation.cffPresent',
    'citation.zenodoDoiIssued',
  ];
  for (const field of required) {
    const parts = field.split('.');
    let cur = metrics;
    for (const p of parts) {
      if (cur == null || !(p in cur)) {
        fail(`${relPath}: missing ${field}`);
        cur = null;
        break;
      }
      cur = cur[p];
    }
  }

  requireField(metrics, 'education.labCount', 'number');
  requireField(metrics, 'packages.publicCount', 'number');
  requireField(metrics, 'citation.zenodoDoiIssued', 'boolean');

  if (metrics.education.labCount < 4) {
    fail(`${relPath}: expected at least 4 labs, got ${metrics.education.labCount}`);
  }
  if (metrics.packages.publicCount < 10) {
    fail(`${relPath}: expected at least 10 public packages`);
  }

  if (
    metrics.verification.npmVerifyPassed === true &&
    metrics.verification.verifySkipped === true
  ) {
    fail(`${relPath}: npmVerifyPassed cannot be true when verifySkipped is true`);
  }
}

function main() {
  console.log('Evidence verification');

  const readme = path.join(EVIDENCE_DIR, 'README.md');
  const latest = path.join(EVIDENCE_DIR, 'metrics-latest.json');
  const outreach = path.join(EVIDENCE_DIR, 'outreach-log.md');

  for (const file of [readme, latest, outreach]) {
    if (!fs.existsSync(file)) {
      fail(`Missing ${path.relative(ROOT, file)}`);
    }
  }

  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fail('Missing evidence/snapshots/');
  } else {
    const snapshots = fs.readdirSync(SNAPSHOTS_DIR).filter((f) => f.endsWith('.json'));
    if (snapshots.length === 0) {
      fail('No JSON snapshots in evidence/snapshots/ - run npm run evidence:collect');
    }
  }

  if (errors.length === 0 && fs.existsSync(latest)) {
    const text = fs.readFileSync(latest, 'utf8');
    scanForSecrets(text, 'evidence/metrics-latest.json');
    try {
      validateMetrics(JSON.parse(text), 'evidence/metrics-latest.json');
    } catch {
      fail('metrics-latest.json is not valid JSON');
    }
  }

  if (fs.existsSync(SNAPSHOTS_DIR)) {
    for (const file of fs.readdirSync(SNAPSHOTS_DIR)) {
      if (!file.endsWith('.json')) continue;
      const full = path.join(SNAPSHOTS_DIR, file);
      const text = fs.readFileSync(full, 'utf8');
      scanForSecrets(text, path.relative(ROOT, full));
      try {
        validateMetrics(JSON.parse(text), path.relative(ROOT, full));
      } catch {
        fail(`${file} is not valid JSON`);
      }
    }
  }

  if (fs.existsSync(outreach)) {
    scanForSecrets(fs.readFileSync(outreach, 'utf8'), 'evidence/outreach-log.md');
  }

  if (errors.length) {
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error(`\nFAIL: ${errors.length} evidence problem(s).`);
    process.exit(1);
  }

  console.log('  ✓ evidence/README.md, outreach-log.md, metrics-latest.json');
  console.log('  ✓ snapshots validated (structure, lab/package counts, no secrets)');
}

main();

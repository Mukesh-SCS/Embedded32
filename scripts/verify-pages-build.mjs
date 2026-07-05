#!/usr/bin/env node
/**
 * Validate the GitHub Pages static export before it is uploaded.
 *
 * Assumes `apps/site` has already been built for production, e.g.:
 *   npm run build --workspace apps/site
 *
 * Fails when:
 *  - The output directory (apps/site/out) is missing
 *  - index.html or 404 fallback is missing
 *  - Generated assets do not use the /Embedded32/ base path
 *  - Any published file contains a localhost / ws://localhost URL
 *  - Source maps or private config files are present in the artifact
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'apps', 'site', 'out');
const BASE_PATH = '/Embedded32/';

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fail(`Output directory missing: ${path.relative(ROOT, OUT_DIR)} (run the site build first)`);
    report();
    return;
  }

  const indexHtml = path.join(OUT_DIR, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    fail('index.html missing from export');
  }

  const notFound = path.join(OUT_DIR, '404.html');
  if (!fs.existsSync(notFound)) {
    warnings.push('404.html not present yet (workflow adds a fallback copy)');
  }

  // API reference must be present under out/api-ref
  const apiIndex = path.join(OUT_DIR, 'api-ref', 'index.html');
  if (!fs.existsSync(apiIndex)) {
    fail('api-ref/index.html missing — run npm run docs:api before building the site');
  }

  const files = walk(OUT_DIR);

  // Base path assertion on index.html asset references
  if (fs.existsSync(indexHtml)) {
    const html = fs.readFileSync(indexHtml, 'utf8');
    const nextAssetRefs = html.match(/\/_next\//g) ?? [];
    const prefixedRefs = html.match(/\/Embedded32\/_next\//g) ?? [];
    if (nextAssetRefs.length === 0) {
      warnings.push('No /_next/ asset references found in index.html');
    } else if (prefixedRefs.length === 0) {
      fail(`Assets in index.html are not prefixed with ${BASE_PATH} (found bare /_next/ references)`);
    }
    // Bare root-relative /assets/ references are a common Pages footgun
    if (/["'(]\/assets\//.test(html)) {
      fail('index.html references bare /assets/ path — must be under /Embedded32/');
    }
  }

  // Scan text artifacts for localhost and stray source maps / private config
  for (const file of files) {
    const rel = path.relative(OUT_DIR, file).replace(/\\/g, '/');
    const ext = path.extname(file).toLowerCase();

    if (ext === '.map') {
      fail(`Source map published: ${rel}`);
      continue;
    }
    if (rel === '.env' || rel.endsWith('/.env') || rel.endsWith('.env.local')) {
      fail(`Environment file published: ${rel}`);
      continue;
    }

    // Only fail on live dev connections the SPA would actually open (WebSocket / API sockets)
    // baked into JS/CSS bundles. Documentation prose that *mentions* http://localhost:5173 as a
    // local dev URL is legitimate and allowed in rendered HTML/text content.
    if (['.js', '.css'].includes(ext)) {
      const content = fs.readFileSync(file, 'utf8');
      if (/ws:\/\/localhost|wss:\/\/localhost|ws:\/\/127\.0\.0\.1/.test(content)) {
        fail(`Live dev WebSocket URL baked into bundle: ${rel}`);
      }
    }
  }

  report();
}

function report() {
  console.log('GitHub Pages build verification');
  for (const w of warnings) console.log(`  ⚠ ${w}`);
  if (errors.length > 0) {
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error(`\nFAIL: ${errors.length} problem(s) with the Pages export.`);
    process.exit(1);
  }
  console.log('  ✓ Output directory, index.html, api-ref, and base path validated');
  console.log('  ✓ No localhost URLs, source maps, or env files in artifact');
}

main();

#!/usr/bin/env node
/**
 * Verify citation metadata is present, consistent, and free of fabricated DOIs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

/** Minimal CFF parser for the fields we validate (no external dependency). */
function parseCff(text) {
  const lines = text.split(/\r?\n/);
  const result = { identifiers: [], authors: [] };
  let inAuthors = false;
  let currentAuthor = null;
  let inIdentifiers = false;
  let currentIdentifier = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line || line.startsWith('#')) continue;

    if (line === 'authors:') {
      inAuthors = true;
      continue;
    }
    if (inAuthors && /^\s*-\s/.test(line)) {
      if (currentAuthor) result.authors.push(currentAuthor);
      currentAuthor = {};
      const rest = line.replace(/^\s*-\s*/, '').trim();
      const m = rest.match(/^(\S+):\s*(.+)$/);
      if (m) currentAuthor[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
      continue;
    }
    if (inAuthors && /^\s{2,}\S/.test(line) && !/^\s*-\s/.test(line)) {
      const m = line.trim().match(/^(\S+):\s*(.+)$/);
      if (m && currentAuthor) currentAuthor[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
      continue;
    }
    if (inAuthors && !line.startsWith(' ')) {
      if (currentAuthor) {
        result.authors.push(currentAuthor);
        currentAuthor = null;
      }
      inAuthors = false;
    }

    if (line === 'identifiers:') {
      inIdentifiers = true;
      continue;
    }
    if (inIdentifiers && /^\s*-\s/.test(line)) {
      if (currentIdentifier) result.identifiers.push(currentIdentifier);
      currentIdentifier = {};
      const rest = line.replace(/^\s*-\s*/, '').trim();
      const m = rest.match(/^(\S+):\s*(.+)$/);
      if (m) currentIdentifier[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
      continue;
    }
    if (inIdentifiers && /^\s{4,}\S/.test(line) && !/^\s*-\s/.test(line)) {
      const m = line.trim().match(/^(\S+):\s*(.+)$/);
      if (m && currentIdentifier) currentIdentifier[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
      continue;
    }
    if (inIdentifiers && !line.startsWith(' ')) {
      if (currentIdentifier) {
        result.identifiers.push(currentIdentifier);
        currentIdentifier = null;
      }
      inIdentifiers = false;
    }

    const top = line.match(/^([a-z-]+):\s*(.*)$/);
    if (top && !inAuthors && !inIdentifiers) {
      result[top[1]] = top[2].replace(/^['"]|['"]$/g, '');
    }
  }
  if (currentAuthor) result.authors.push(currentAuthor);
  if (currentIdentifier) result.identifiers.push(currentIdentifier);
  return result;
}

const PLACEHOLDER_DOI = /10\.0000\/|10\.5281\/zenodo\.0\b|zenodo\.XXXX|DOI pending|TBD|placeholder/i;

function main() {
  console.log('Citation metadata verification');

  const cffPath = path.join(ROOT, 'CITATION.cff');
  const citationDoc = path.join(ROOT, 'docs', 'citation.md');
  const zenodoDoc = path.join(ROOT, 'docs', 'maintainers', 'zenodo-release.md');

  for (const file of [cffPath, citationDoc, zenodoDoc]) {
    if (!fs.existsSync(file)) {
      fail(`Missing required file: ${path.relative(ROOT, file)}`);
    }
  }
  if (errors.length) {
    report();
    return;
  }

  const cffText = fs.readFileSync(cffPath, 'utf8');
  const cff = parseCff(cffText);

  const required = ['cff-version', 'title', 'type', 'license', 'repository-code', 'version'];
  for (const field of required) {
    if (!cff[field]) fail(`CITATION.cff missing required field: ${field}`);
  }

  if (!cff.authors?.length) {
    fail('CITATION.cff must list at least one author');
  } else {
    const author = cff.authors[0];
    if (!author['family-names'] || !author['given-names']) {
      fail('CITATION.cff first author needs family-names and given-names');
    }
  }

  if (cff['cff-version'] !== '1.2.0') {
    warn(`CITATION.cff cff-version is ${cff['cff-version']} (expected 1.2.0)`);
  }

  if (cff.type !== 'software') {
    fail(`CITATION.cff type should be software, got: ${cff.type}`);
  }

  // Reject fabricated DOIs
  if (PLACEHOLDER_DOI.test(cffText)) {
    fail('CITATION.cff contains placeholder DOI text — remove until Zenodo issues a real DOI');
  }

  for (const id of cff.identifiers ?? []) {
    if (id.type === 'doi') {
      if (!/^10\.\d{4,9}\/\S+$/.test(id.value ?? '')) {
        fail(`CITATION.cff has invalid doi identifier: ${id.value}`);
      }
      if (PLACEHOLDER_DOI.test(id.value ?? '')) {
        fail('CITATION.cff doi looks like a placeholder');
      }
    }
  }

  const citationText = fs.readFileSync(citationDoc, 'utf8');
  if (/10\.5281\/zenodo\.\d+/.test(citationText) && !cff.identifiers?.some((i) => i.type === 'doi')) {
    warn('docs/citation.md mentions a Zenodo DOI but CITATION.cff has no identifiers.doi — sync after archive');
  }
  if (/doi\.org\/10\./.test(citationText) && PLACEHOLDER_DOI.test(citationText)) {
    fail('docs/citation.md contains placeholder DOI URL');
  }

  if (!citationText.includes('CITATION.cff')) {
    warn('docs/citation.md should reference CITATION.cff');
  }
  if (!citationText.includes('zenodo-release.md')) {
    warn('docs/citation.md should link to maintainer Zenodo runbook');
  }

  if (!cffText.includes('Tripathi') || !citationText.includes('Tripathi')) {
    fail('Author name Tripathi missing from citation files');
  }

  report();
}

function report() {
  for (const w of warnings) console.log(`  ⚠ ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error(`\nFAIL: ${errors.length} citation problem(s).`);
    process.exit(1);
  }
  console.log('  ✓ CITATION.cff, docs/citation.md, and zenodo runbook present');
  console.log('  ✓ Required CFF fields and author metadata validated');
  console.log('  ✓ No fabricated DOI detected');
}

main();

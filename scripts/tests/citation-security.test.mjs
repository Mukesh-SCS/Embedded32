import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const citationDoc = path.join(ROOT, 'docs', 'citation.md');

const PLACEHOLDER_DOI =
  /10\.0000\/|10\.5281\/zenodo\.0\b|zenodo\.XXXX|DOI pending|TBD|placeholder/i;

function hasPlaceholderDoiUrl(citationText) {
  return citationText.includes('https://doi.org/10.') && PLACEHOLDER_DOI.test(citationText);
}

test('valid DOI literal prefix is detected without broad regex', () => {
  const text = 'See https://doi.org/10.5281/zenodo.123456 for details';
  assert.equal(text.includes('https://doi.org/10.'), true);
});

test('invalid DOI scheme is not treated as approved prefix', () => {
  const text = 'ftp://doi.org/10.1234/example';
  assert.equal(text.includes('https://doi.org/10.'), false);
});

test('placeholder DOI inside unrelated text fails validation helper', () => {
  const text = 'Placeholder https://doi.org/10.0000/zenodo.0 should fail';
  assert.equal(hasPlaceholderDoiUrl(text), true);
});

test('missing DOI does not trigger placeholder helper', () => {
  const text = 'Citation metadata without a DOI URL';
  assert.equal(hasPlaceholderDoiUrl(text), false);
});

test('committed citation doc does not contain placeholder DOI URLs', () => {
  if (!fs.existsSync(citationDoc)) return;
  const citationText = fs.readFileSync(citationDoc, 'utf8');
  assert.equal(hasPlaceholderDoiUrl(citationText), false);
});

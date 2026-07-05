import test from 'node:test';
import assert from 'node:assert/strict';

const LAB_SLUG_PATTERN = /^lab-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_LAB_SLUG_LENGTH = 64;
const MAX_TITLE_LENGTH = 200;
const BLOCKED_URL_SCHEMES = new Set(['javascript:', 'data:', 'vbscript:', 'file:', 'blob:']);
const HTML_TAG_PATTERN = /<[^>]*>/g;
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

function isValidLabSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  if (slug.length > MAX_LAB_SLUG_LENGTH) return false;
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) return false;
  if (slug.includes('%')) return false;
  return LAB_SLUG_PATTERN.test(slug);
}

function sanitizePlainTextTitle(title, fallback = 'Untitled') {
  if (!title || typeof title !== 'string') return fallback;
  const stripped = title
    .replace(HTML_TAG_PATTERN, '')
    .replace(CONTROL_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!stripped) return fallback;
  return stripped.length > MAX_TITLE_LENGTH
    ? `${stripped.slice(0, MAX_TITLE_LENGTH)}…`
    : stripped;
}

const BLOCKED_SCHEME_PREFIXES = ['javascript:', 'data:', 'vbscript:', 'file:', 'blob:'];

function hasBlockedScheme(value) {
  const lower = value.trim().toLowerCase();
  return BLOCKED_SCHEME_PREFIXES.some((scheme) => lower.startsWith(scheme));
}

function resolveSafeUrl(href, options = {}) {
  if (!href || typeof href !== 'string') return null;
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (hasBlockedScheme(trimmed)) return { kind: 'blocked', href: trimmed };
  if (trimmed.startsWith('#')) return { kind: 'fragment', href: trimmed };
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return { kind: 'relative', href: trimmed };
  }
  if (trimmed.startsWith('./') || trimmed.startsWith('../') || !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    if (trimmed.includes('..') || trimmed.includes('\\')) return null;
    return { kind: 'relative', href: trimmed };
  }
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  const scheme = parsed.protocol.toLowerCase();
  if (BLOCKED_URL_SCHEMES.has(scheme)) return { kind: 'blocked', href: trimmed };
  if (scheme === 'https:') return { kind: 'https', href: parsed.toString() };
  if (scheme === 'http:' && options.allowHttp) return { kind: 'http', href: parsed.toString() };
  if (scheme === 'mailto:') return { kind: 'mailto', href: parsed.toString() };
  return null;
}

function resolveSafeImageSrc(src, options = {}) {
  if (!src || typeof src !== 'string') return null;
  const trimmed = src.trim();
  if (!trimmed) return null;
  if (hasBlockedScheme(trimmed)) return null;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  if (!trimmed.includes('://')) {
    if (trimmed.includes('..') || trimmed.includes('\\')) return null;
    return trimmed;
  }
  const resolved = resolveSafeUrl(trimmed, { allowHttp: false });
  if (!resolved || resolved.kind === 'blocked') return null;
  if (resolved.kind === 'https' && options.allowExternalHttps) return resolved.href;
  return null;
}

test('accepts valid lab slug', () => {
  assert.equal(isValidLabSlug('lab-can-basics'), true);
});

test('rejects traversal lab slugs', () => {
  assert.equal(isValidLabSlug('../secrets'), false);
  assert.equal(isValidLabSlug('lab-evil/extra'), false);
  assert.equal(isValidLabSlug('lab-evil\\extra'), false);
});

test('rejects javascript links', () => {
  const result = resolveSafeUrl('javascript:alert(1)');
  assert.equal(result?.kind, 'blocked');
});

test('rejects data:text/html links', () => {
  const result = resolveSafeUrl('data:text/html,<script>alert(1)</script>');
  assert.equal(result?.kind, 'blocked');
});

test('allows valid internal relative links', () => {
  const result = resolveSafeUrl('/Embedded32/docs/getting-started/');
  assert.equal(result?.kind, 'relative');
});

test('sanitizes HTML in lab titles', () => {
  const title = sanitizePlainTextTitle('<b>Engine</b> Lab Title');
  assert.equal(title, 'Engine Lab Title');
});

test('rejects malicious image sources', () => {
  assert.equal(resolveSafeImageSrc('javascript:alert(1)'), null);
  assert.equal(resolveSafeImageSrc('data:image/png;base64,abc'), null);
});

test('allows repository-relative images', () => {
  assert.equal(resolveSafeImageSrc('/images/diagram.png'), '/images/diagram.png');
});

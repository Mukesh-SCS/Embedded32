export const LAB_SLUG_PATTERN = /^lab-[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_LAB_SLUG_LENGTH = 64;
export const MAX_TITLE_LENGTH = 200;

const BLOCKED_URL_SCHEMES = new Set(['javascript:', 'data:', 'vbscript:', 'file:', 'blob:']);

const HTML_TAG_PATTERN = /<[^>]*>/g;
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

/**
 * Validate a classroom lab slug against a strict allowlist.
 */
export function isValidLabSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  if (slug.length > MAX_LAB_SLUG_LENGTH) return false;
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) return false;
  if (slug.includes('%')) return false;
  return LAB_SLUG_PATTERN.test(slug);
}

/**
 * Sanitize Markdown-derived titles for plain-text rendering.
 */
export function sanitizePlainTextTitle(title: string, fallback = 'Untitled'): string {
  if (!title || typeof title !== 'string') return fallback;

  let withoutTags = title;
  let previous: string;
  do {
    previous = withoutTags;
    withoutTags = withoutTags.replace(HTML_TAG_PATTERN, '');
  } while (withoutTags !== previous);

  const stripped = withoutTags.replace(CONTROL_CHARS, '').replace(/\s+/g, ' ').trim();
  if (!stripped) return fallback;
  return stripped.length > MAX_TITLE_LENGTH ? `${stripped.slice(0, MAX_TITLE_LENGTH)}…` : stripped;
}

/**
 * Encode a path segment for safe use in href values.
 */
export function encodeRouteSegment(segment: string): string {
  return encodeURIComponent(segment);
}

export type SafeUrlKind = 'relative' | 'fragment' | 'https' | 'http' | 'mailto' | 'blocked';

export interface SafeUrlResult {
  kind: SafeUrlKind;
  href: string;
}

/**
 * Validate Markdown link and image URLs.
 */
const BLOCKED_SCHEME_PREFIXES = ['javascript:', 'data:', 'vbscript:', 'file:', 'blob:'];

function hasBlockedScheme(value: string): boolean {
  const lower = value.trim().toLowerCase();
  return BLOCKED_SCHEME_PREFIXES.some((scheme) => lower.startsWith(scheme));
}

export function resolveSafeUrl(
  href: string,
  options?: { allowHttp?: boolean }
): SafeUrlResult | null {
  if (!href || typeof href !== 'string') return null;
  const trimmed = href.trim();
  if (!trimmed) return null;

  if (hasBlockedScheme(trimmed)) {
    return { kind: 'blocked', href: trimmed };
  }

  if (trimmed.startsWith('#')) {
    return { kind: 'fragment', href: trimmed };
  }

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return { kind: 'relative', href: trimmed };
  }

  if (
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
  ) {
    if (trimmed.includes('..') || trimmed.includes('\\')) {
      return null;
    }
    return { kind: 'relative', href: trimmed };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const scheme = parsed.protocol.toLowerCase();
  if (BLOCKED_URL_SCHEMES.has(scheme)) {
    return { kind: 'blocked', href: trimmed };
  }

  if (scheme === 'https:') {
    return { kind: 'https', href: parsed.toString() };
  }
  if (scheme === 'http:' && options?.allowHttp) {
    return { kind: 'http', href: parsed.toString() };
  }
  if (scheme === 'mailto:') {
    return { kind: 'mailto', href: parsed.toString() };
  }

  return null;
}

/**
 * Validate image sources - repository-relative or approved HTTPS only.
 */
export function resolveSafeImageSrc(
  src: string,
  options?: { allowExternalHttps?: boolean }
): string | null {
  if (!src || typeof src !== 'string') return null;
  const trimmed = src.trim();
  if (!trimmed) return null;

  if (hasBlockedScheme(trimmed)) return null;

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  if (!trimmed.includes('://')) {
    if (hasBlockedScheme(trimmed) || trimmed.includes('..') || trimmed.includes('\\')) return null;
    return trimmed;
  }

  const resolved = resolveSafeUrl(trimmed, { allowHttp: false });
  if (!resolved || resolved.kind === 'blocked') return null;
  if (resolved.kind === 'https' && options?.allowExternalHttps) {
    return resolved.href;
  }
  return null;
}

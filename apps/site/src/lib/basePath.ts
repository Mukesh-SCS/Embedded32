/**
 * Base path for GitHub Pages project site (https://<user>.github.io/Embedded32/).
 * Next.js <Link> and next/image prefix this automatically, but raw <a href> and
 * static asset URLs (e.g. links inside rendered markdown) must be prefixed manually.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Prefix an internal absolute path (starting with "/") with the base path. */
export function withBasePath(href: string): string {
  if (!href.startsWith('/')) return href;
  if (BASE_PATH && href.startsWith(`${BASE_PATH}/`)) return href;
  return `${BASE_PATH}${href}`;
}

import fs from 'node:fs';
import path from 'node:path';

export const MONOREPO_ROOT = path.resolve(process.cwd(), '../..');

const EXCLUDED_DOC_DIRS = new Set(['maintainers', 'api']);

export type DocMeta = {
  slug: string[];
  title: string;
  section: string;
  filePath: string;
};

export type LabMeta = {
  slug: string;
  title: string;
  dirName: string;
};

export type PackageMeta = {
  slug: string;
  name: string;
  dirName: string;
  description: string;
};

const PACKAGE_DIRS: Record<string, string> = {
  can: 'embedded32-can',
  core: 'embedded32-core',
  j1939: 'embedded32-j1939',
  sim: 'embedded32-sim',
  tools: 'embedded32-tools',
  bridge: 'embedded32-bridge',
  ethernet: 'embedded32-ethernet',
  supervisor: 'embedded32-supervisor',
  cli: 'embedded32-cli',
  'sdk-js': 'embedded32-sdk-js',
};

function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function titleFromMarkdown(content: string, fallback: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function walkMarkdownFiles(dir: string, baseDir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DOC_DIRS.has(entry.name)) continue;
      walkMarkdownFiles(full, baseDir, acc);
    } else if (entry.name.endsWith('.md') && entry.name.toLowerCase() !== 'readme.md') {
      acc.push(full);
    }
  }
  return acc;
}

export function listDocs(): DocMeta[] {
  const docsRoot = path.join(MONOREPO_ROOT, 'docs');
  const files = walkMarkdownFiles(docsRoot, docsRoot);
  const readmePath = path.join(docsRoot, 'README.md');
  if (fs.existsSync(readmePath)) files.unshift(readmePath);

  return files
    .map((filePath) => {
      const rel = path.relative(docsRoot, filePath).replace(/\\/g, '/');
      const slug =
        rel === 'README.md'
          ? []
          : rel.replace(/\.md$/i, '').split('/');
      const content = readText(filePath);
      const section = slug[0] ?? 'overview';
      return {
        slug,
        title: titleFromMarkdown(content, slug[slug.length - 1] ?? 'Documentation'),
        section,
        filePath,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getDocBySlug(slug: string[]): { meta: DocMeta; content: string } | null {
  const docsRoot = path.join(MONOREPO_ROOT, 'docs');
  const rel =
    slug.length === 0
      ? 'README.md'
      : `${slug.join('/')}.md`;
  const filePath = path.join(docsRoot, rel);
  if (!fs.existsSync(filePath)) return null;

  const content = readText(filePath);
  const section = slug[0] ?? 'overview';
  return {
    meta: {
      slug,
      title: titleFromMarkdown(content, slug[slug.length - 1] ?? 'Documentation'),
      section,
      filePath,
    },
    content: rewriteMarkdownLinks(content, path.dirname(rel)),
  };
}

export function listLabs(): LabMeta[] {
  const labsRoot = path.join(MONOREPO_ROOT, 'labs');
  if (!fs.existsSync(labsRoot)) return [];

  return fs
    .readdirSync(labsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('lab-'))
    .map((d) => {
      const readme = path.join(labsRoot, d.name, 'README.md');
      const content = fs.existsSync(readme) ? readText(readme) : '';
      return {
        slug: d.name,
        title: titleFromMarkdown(content, d.name),
        dirName: d.name,
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getLabReadme(slug: string): { meta: LabMeta; content: string } | null {
  const readme = path.join(MONOREPO_ROOT, 'labs', slug, 'README.md');
  if (!fs.existsSync(readme)) return null;
  const content = readText(readme);
  return {
    meta: {
      slug,
      title: titleFromMarkdown(content, slug),
      dirName: slug,
    },
    content: rewriteMarkdownLinks(content, `labs/${slug}`),
  };
}

export function listPackages(): PackageMeta[] {
  return Object.entries(PACKAGE_DIRS)
    .map(([slug, dirName]) => {
      const pkgPath = path.join(MONOREPO_ROOT, dirName, 'package.json');
      let name = `@embedded32/${slug}`;
      let description = '';
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(readText(pkgPath)) as { name?: string; description?: string };
        name = pkg.name ?? name;
        description = pkg.description ?? '';
      }
      return { slug, name, dirName, description };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getPackageReadme(slug: string): { meta: PackageMeta; content: string } | null {
  const dirName = PACKAGE_DIRS[slug];
  if (!dirName) return null;
  const readme = path.join(MONOREPO_ROOT, dirName, 'README.md');
  if (!fs.existsSync(readme)) return null;
  const content = readText(readme);
  const packages = listPackages();
  const meta = packages.find((p) => p.slug === slug);
  if (!meta) return null;
  return {
    meta,
    content: rewriteMarkdownLinks(content, dirName),
  };
}

function rewriteMarkdownLinks(content: string, baseRel: string): string {
  return content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label, href) => {
    const resolved = resolveHref(href, baseRel);
    if (resolved === href) return full;
    return `[${label}](${resolved})`;
  });
}

function resolveHref(href: string, baseRel: string): string {
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
    return href;
  }

  if (href.startsWith('/')) return href;

  const monorepoRelative = normalizeRepoPath(path.normalize(path.join(baseRel, href)));

  if (monorepoRelative.endsWith('.md')) {
    if (monorepoRelative.startsWith('docs/')) {
      const docPath = monorepoRelative.slice('docs/'.length);
      if (docPath === 'README.md') return '/docs';
      return `/docs/${docPath.replace(/\.md$/i, '')}`;
    }
    if (monorepoRelative.startsWith('labs/')) {
      const parts = monorepoRelative.split('/');
      if (parts.length >= 2 && parts[1].startsWith('lab-')) {
        return parts[2] === 'README.md' ? `/labs/${parts[1]}` : `/labs`;
      }
      return '/labs';
    }
    for (const [slug, dir] of Object.entries(PACKAGE_DIRS)) {
      if (monorepoRelative === `${dir}/README.md`) {
        return `/packages/${slug}`;
      }
    }
    if (monorepoRelative.startsWith('examples/')) {
      return `https://github.com/Mukesh-SCS/Embedded32/blob/main/${monorepoRelative}`;
    }
  }

  if (monorepoRelative.startsWith('labs/lab-')) {
    const labSlug = monorepoRelative.split('/')[1];
    return `/labs/${labSlug}`;
  }

  for (const [slug, dir] of Object.entries(PACKAGE_DIRS)) {
    if (monorepoRelative.startsWith(`${dir}/`)) {
      return `/packages/${slug}`;
    }
  }

  if (monorepoRelative.startsWith('docs/')) {
    const docPath = monorepoRelative.slice('docs/'.length).replace(/\.md$/i, '');
    return docPath ? `/docs/${docPath}` : '/docs';
  }

  return `https://github.com/Mukesh-SCS/Embedded32/blob/main/${monorepoRelative}`;
}

function normalizeRepoPath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

export function slugToPath(slug: string[]): string {
  return slug.length === 0 ? '/docs' : `/docs/${slug.join('/')}`;
}

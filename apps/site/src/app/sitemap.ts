import type { MetadataRoute } from 'next';
import { listDocs, listLabs, listPackages } from '@/lib/content';

const BASE = 'https://mukesh-scs.github.io/Embedded32';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/demo', '/labs', '/packages', '/teach', '/contribute', '/roadmap', '/cite', '/about'];
  const docs = listDocs().map((d) => (d.slug.length === 0 ? '/docs' : `/docs/${d.slug.join('/')}`));
  const labs = listLabs().map((l) => `/labs/${l.slug}`);
  const packages = listPackages().map((p) => `/packages/${p.slug}`);

  return [...staticPages, ...docs, ...labs, ...packages].map((path) => ({
    url: `${BASE}${path}/`,
    lastModified: new Date(),
  }));
}

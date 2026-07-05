import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Markdown } from '@/components/Markdown';
import { DocsSidebar } from '@/components/SiteChrome';
import { getDocBySlug, listDocs, slugToPath } from '@/lib/content';

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export async function generateStaticParams() {
  return listDocs().map((doc) => ({
    slug: doc.slug.length > 0 ? doc.slug : undefined,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return { title: 'Documentation' };
  return {
    title: doc.meta.title,
    description: `${doc.meta.title} - Embedded32 documentation`,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug = [] } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  const activePath = slugToPath(slug);
  const crumbs = slug.map((part, i) => ({
    label: part.replace(/-/g, ' '),
    href: i < slug.length - 1 ? slugToPath(slug.slice(0, i + 1)) : undefined,
  }));

  return (
    <div className="pageWithSidebar">
      <DocsSidebar activePath={activePath} />
      <article>
        <Breadcrumbs items={[{ label: 'Docs', href: '/docs/getting-started' }, ...crumbs]} />
        <Markdown content={doc.content} />
      </article>
    </div>
  );
}

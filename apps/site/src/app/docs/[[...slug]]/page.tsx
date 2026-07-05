import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
  return { title: doc.meta.title };
}

export default async function DocPage({ params }: PageProps) {
  const { slug = [] } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  const activePath = slugToPath(slug);

  return (
    <div className="pageWithSidebar">
      <DocsSidebar activePath={activePath} />
      <article>
        <Markdown content={doc.content} />
      </article>
    </div>
  );
}

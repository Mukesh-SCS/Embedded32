import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Markdown } from '@/components/Markdown';
import { DocsSidebar } from '@/components/SiteChrome';
import { getLabReadme, listLabs } from '@/lib/content';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listLabs().map((lab) => ({ slug: lab.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lab = getLabReadme(slug);
  if (!lab) return { title: 'Lab' };
  return { title: lab.meta.title };
}

export default async function LabPage({ params }: PageProps) {
  const { slug } = await params;
  const lab = getLabReadme(slug);
  if (!lab) notFound();

  return (
    <div className="pageWithSidebar">
      <DocsSidebar activePath={`/labs/${slug}`} />
      <article>
        <Markdown content={lab.content} />
      </article>
    </div>
  );
}

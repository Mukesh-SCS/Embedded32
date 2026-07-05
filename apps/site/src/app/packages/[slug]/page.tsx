import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Markdown } from '@/components/Markdown';
import { DocsSidebar } from '@/components/SiteChrome';
import { getPackageReadme, listPackages } from '@/lib/content';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listPackages().map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackageReadme(slug);
  if (!pkg) return { title: 'Package' };
  return { title: pkg.meta.name };
}

export default async function PackagePage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = getPackageReadme(slug);
  if (!pkg) notFound();

  return (
    <div className="pageWithSidebar">
      <DocsSidebar activePath="/packages" />
      <article>
        <Markdown content={pkg.content} />
      </article>
    </div>
  );
}

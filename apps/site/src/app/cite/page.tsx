import type { Metadata } from 'next';
import fs from 'node:fs';
import path from 'node:path';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Markdown } from '@/components/Markdown';
import { MONOREPO_ROOT } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Citation',
  description: 'How to cite Embedded32 in academic and technical work.',
};

export default function CitePage() {
  const citePath = path.join(MONOREPO_ROOT, 'docs', 'citation.md');
  const content = fs.existsSync(citePath)
    ? fs.readFileSync(citePath, 'utf8')
    : '# Citation\n\nSee repository docs/citation.md';

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Citation' }]} />
      <Markdown content={content} />
    </div>
  );
}

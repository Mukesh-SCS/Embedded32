import type { Metadata } from 'next';
import fs from 'node:fs';
import path from 'node:path';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Markdown } from '@/components/Markdown';
import { MONOREPO_ROOT } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'Embedded32 project roadmap and planned improvements.',
};

export default function RoadmapPage() {
  const roadmapPath = path.join(MONOREPO_ROOT, 'ROADMAP.md');
  const content = fs.existsSync(roadmapPath) ? fs.readFileSync(roadmapPath, 'utf8') : '# Roadmap\n\nSee GitHub for updates.';

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Roadmap' }]} />
      <Markdown content={content} />
    </div>
  );
}

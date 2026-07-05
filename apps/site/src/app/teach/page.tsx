import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BrutalCard } from '@/components/ui/BrutalCard';

export const metadata: Metadata = {
  title: 'For instructors',
  description: 'Teaching resources, rubrics, and course structure for Embedded32.',
};

export default function TeachPage() {
  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Teach' }]} />
      <h1 className="pageTitle">For instructors</h1>
      <p className="lead">
        Embedded32 ships classroom-ready labs, learning outcomes, and verified solutions. Use the browser demo for
        live J1939 walkthroughs without hardware setup.
      </p>

      <SectionHeading>Resources</SectionHeading>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <BrutalCard variant="cyan">
          <h3>Course module</h3>
          <p>Week-by-week structure and assessment alignment.</p>
          <Link href="/docs/education/course-module">Open →</Link>
        </BrutalCard>
        <BrutalCard variant="yellow">
          <h3>Instructor guide</h3>
          <p>Setup, pacing, and common student questions.</p>
          <Link href="/docs/education/instructor-guide">Open →</Link>
        </BrutalCard>
        <BrutalCard variant="green">
          <h3>Learning outcomes</h3>
          <p>Measurable skills mapped to labs and demo scenarios.</p>
          <Link href="/docs/education/learning-outcomes">Open →</Link>
        </BrutalCard>
        <BrutalCard>
          <h3>Classroom labs</h3>
          <p>Four hardware-free labs with rubrics and solutions.</p>
          <Link href="/labs">Browse labs →</Link>
        </BrutalCard>
      </div>
    </div>
  );
}

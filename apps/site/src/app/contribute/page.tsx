import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Callout } from '@/components/ui/Callout';
import { CodePanel } from '@/components/ui/CodePanel';

export const metadata: Metadata = {
  title: 'Contribute',
  description: 'How to contribute to Embedded32 — code, docs, labs, and demo scenarios.',
};

export default function ContributePage() {
  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Contribute' }]} />
      <h1 className="pageTitle">Contribute</h1>
      <p className="lead">
        Embedded32 welcomes contributions to packages, documentation, labs, and the browser demo. See{' '}
        <a href="https://github.com/Mukesh-SCS/Embedded32/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">
          CONTRIBUTING.md
        </a>{' '}
        on GitHub for the full process.
      </p>

      <Callout title="Good first areas">
        <ul>
          <li>Add a teaching PGN decoder with tests</li>
          <li>Add a synthetic trace scenario</li>
          <li>Improve lab starter code or rubrics</li>
          <li>Fix documentation accuracy</li>
        </ul>
      </Callout>

      <h2 className="pageTitle" style={{ fontSize: '1.25rem' }}>
        Local verification
      </h2>
      <CodePanel
        language="shell"
        code={`git clone https://github.com/Mukesh-SCS/Embedded32.git
cd Embedded32
npm ci
npm run verify`}
      />

      <p>
        <Link href="/roadmap">View roadmap →</Link> · <Link href="/about">About the project →</Link>
      </p>
    </div>
  );
}

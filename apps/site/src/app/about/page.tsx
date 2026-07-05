import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Callout } from '@/components/ui/Callout';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Embedded32 — an open-source CAN and J1939 education platform.',
};

export default function AboutPage() {
  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'About' }]} />
      <h1 className="pageTitle">About Embedded32</h1>
      <p className="lead">
        Embedded32 is an open-source TypeScript monorepo for learning Controller Area Network (CAN), SAE J1939,
        multi-ECU simulation, diagnostics, and CAN-to-MQTT bridging — without requiring automotive hardware for core
        lessons.
      </p>

      <Callout variant="yellow" title="Mission">
        Make vehicle network concepts accessible to students, instructors, and developers through honest documentation,
        hardware-free labs, and a browser-based demo.
      </Callout>

      <p>
        Author: Mukesh Mani Tripathi · License: MIT ·{' '}
        <a href="https://github.com/Mukesh-SCS/Embedded32" target="_blank" rel="noreferrer">
          GitHub repository
        </a>
      </p>

      <p>
        <Link href="/docs/architecture">Architecture →</Link> · <Link href="/teach">For instructors →</Link> ·{' '}
        <Link href="/contribute">Contribute →</Link>
      </p>
    </div>
  );
}

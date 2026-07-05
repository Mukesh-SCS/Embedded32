import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Browser demo',
};

export default function DemoPage() {
  return (
    <div className="page">
      <h1 className="pageTitle">Browser educational demo</h1>
      <p className="lead">
        Phase 10 will add an interactive CAN/J1939 viewer and ECU network visualization under{' '}
        <code>apps/demo/</code>. This site route is a placeholder until that work lands.
      </p>
      <div className="cardGrid">
        <article className="card">
          <h3>Try today (CLI)</h3>
          <p>Hardware-free simulation and decoding from your terminal.</p>
          <pre>
            <code>{`npx tsx examples/j1939-basic.ts
npx embedded32-tools simulate vehicle/basic-truck`}</code>
          </pre>
        </article>
        <article className="card">
          <h3>Sample traces</h3>
          <p>Prerecorded JSON bus captures for classroom demos.</p>
          <p>
            <Link href="https://github.com/Mukesh-SCS/Embedded32/tree/main/examples/traces">
              examples/traces on GitHub →
            </Link>
          </p>
        </article>
        <article className="card">
          <h3>Private dashboard</h3>
          <p>
            <code>@embedded32/dashboard</code> provides a React monitoring UI for local dev —
            not published to npm.
          </p>
        </article>
      </div>
    </div>
  );
}

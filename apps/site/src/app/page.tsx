import Link from 'next/link';
import { withBasePath } from '@/lib/basePath';

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="heroInner">
          <h1>Learn embedded vehicle networks without hardware first</h1>
          <p>
            Embedded32 is an open-source TypeScript monorepo for classrooms and self-study:
            CAN frames, J1939 concepts, multi-ECU simulation, diagnostics, and CAN-to-MQTT
            bridging — with mock and virtual buses built in.
          </p>
          <div className="heroActions">
            <Link href="/docs/getting-started" className="button">
              Get started
            </Link>
            <Link href="/labs" className="buttonSecondary">
              Classroom labs
            </Link>
            <Link href="/packages" className="buttonSecondary">
              Packages
            </Link>
          </div>
        </div>
      </section>

      <div className="page">
        <h2 className="pageTitle">What you can do today</h2>
        <p className="lead">
          Active development — suitable for learning, labs, and prototyping. Not production
          automotive tooling.
        </p>
        <div className="cardGrid">
          <article className="card">
            <h3>Four classroom labs</h3>
            <p>Hardware-free exercises with starter code, rubrics, and verified solutions.</p>
            <p>
              <Link href="/labs">Browse labs →</Link>
            </p>
          </article>
          <article className="card">
            <h3>Concept guides</h3>
            <p>CAN, J1939, simulation, diagnostics, and bridge topics with honest scope notes.</p>
            <p>
              <Link href="/docs/concepts/can">Read concepts →</Link>
            </p>
          </article>
          <article className="card">
            <h3>npm packages</h3>
            <p>Ten public <code>@embedded32/*</code> packages — install after maintainer publish approval.</p>
            <p>
              <Link href="/packages">Package index →</Link>
            </p>
          </article>
          <article className="card">
            <h3>API reference</h3>
            <p>TypeDoc-generated reference synced from the monorepo on each site build.</p>
            <p>
              <a href={withBasePath('/api-ref/index.html')}>Open API docs →</a>
            </p>
          </article>
        </div>

        <h2 style={{ marginTop: '2.5rem' }}>Quickstart (15 minutes)</h2>
        <pre>
          <code>{`git clone https://github.com/Mukesh-SCS/Embedded32.git
cd Embedded32
npm ci
npm run build
npx tsx examples/j1939-basic.ts
npx embedded32-tools simulate vehicle/basic-truck`}</code>
        </pre>

        <p>
          Browser demo and live ECU visualization: <Link href="/demo">coming in Phase 10</Link>.
        </p>
      </div>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { DemoClient } from './DemoClient';

export const metadata: Metadata = {
  title: 'Browser demo',
};

export default function DemoPage() {
  return (
    <div className="page">
      <h1 className="pageTitle">Browser CAN/J1939 demo</h1>
      <p className="lead">
        A hardware-free, client-side demo that plays synthetic J1939 traces and decodes a teaching
        subset of messages in your browser. It mirrors the scaling used by{' '}
        <Link href="/packages/j1939">@embedded32/j1939</Link>.
      </p>

      <DemoClient />

      <h2 style={{ marginTop: '2.5rem' }}>How this maps to the packages</h2>
      <div className="cardGrid">
        <article className="card">
          <h3>Decoding</h3>
          <p>
            The browser decoder implements the same PGN/SPN subset as{' '}
            <code>@embedded32/j1939</code> — engine speed, coolant temperature, barometric
            pressure, and DM1 faults.
          </p>
        </article>
        <article className="card">
          <h3>Traces</h3>
          <p>
            Scenarios come from <code>examples/traces/</code> and are labeled{' '}
            <code>&quot;source&quot;: &quot;synthetic&quot;</code>. Nothing here is captured from real hardware.
          </p>
        </article>
        <article className="card">
          <h3>Run it for real (CLI)</h3>
          <pre>
            <code>{`npx tsx examples/j1939-basic.ts
npx embedded32-tools simulate vehicle/basic-truck`}</code>
          </pre>
        </article>
      </div>

      <p style={{ marginTop: '1.5rem' }}>
        Source: <code>apps/demo/</code>. This static site cannot host servers, WebSockets,
        SocketCAN, or MQTT — for live buses use the CLI and packages locally.
      </p>
    </div>
  );
}

import Link from 'next/link';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { MetricBlock } from '@/components/ui/MetricBlock';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CodePanel } from '@/components/ui/CodePanel';
import { Callout } from '@/components/ui/Callout';
import { getSiteMetrics } from '@/lib/site-metrics';
import { listLabs } from '@/lib/content';
import { LAB_CARDS } from '@/lib/labs-meta';
import { listPackages } from '@/lib/content';
import styles from './page.module.css';

export default function HomePage() {
  const metrics = getSiteMetrics();
  const labs = listLabs();
  const packages = listPackages();

  return (
    <>
      <section className={styles.hero} data-testid="home-hero">
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <h1>UNDERSTAND THE BUS. CONTROL THE SYSTEM.</h1>
            <p>
              Embedded32 teaches CAN, SAE J1939, ECU simulation, and diagnostics without requiring
              hardware first. Run synthetic traces in your browser, complete four classroom labs,
              and explore ten open-source packages.
            </p>
            <div className={styles.heroActions}>
              <BrutalButton variant="yellow" href="/docs/getting-started">
                Start learning
              </BrutalButton>
              <BrutalButton variant="cyan" href="/demo">
                Open demo
              </BrutalButton>
              <BrutalButton variant="dark" href="https://github.com/Mukesh-SCS/Embedded32">
                View GitHub
              </BrutalButton>
            </div>
          </div>
          <div className={styles.diagram} aria-label="System diagram">
            <div className={styles.diagramEcu}>ENGINE ECU ─┐</div>
            <div className={styles.diagramEcu}>TRANS ECU ──┼── CAN BUS ── DIAGNOSTIC TOOL</div>
            <div className={styles.diagramEcu}>DASH ECU ───┘</div>
          </div>
        </div>
      </section>

      <div className={`page ${styles.home}`}>
        <section className={styles.metricsRow}>
          <MetricBlock
            label="Public packages"
            value={metrics.packageCount}
            testId="metric-packages"
          />
          <MetricBlock label="Classroom labs" value={metrics.labCount} testId="metric-labs" />
          <MetricBlock
            label="Demo scenarios"
            value={metrics.scenarioCount}
            testId="metric-scenarios"
          />
          <MetricBlock
            label="Hardware required"
            value={metrics.hardwareRequired}
            testId="metric-hardware"
          />
        </section>

        <SectionHeading>Learning paths</SectionHeading>
        <div className={styles.pathGrid}>
          <BrutalCard>
            <h3>Student</h3>
            <ol>
              <li>Start with CAN concepts</li>
              <li>Run the browser demo</li>
              <li>Complete four labs</li>
            </ol>
            <Link href="/docs/concepts/can">Begin →</Link>
          </BrutalCard>
          <BrutalCard variant="cyan">
            <h3>Instructor</h3>
            <ol>
              <li>Review learning outcomes</li>
              <li>Download lab material</li>
              <li>Use grading rubrics</li>
            </ol>
            <Link href="/teach">Teach →</Link>
          </BrutalCard>
          <BrutalCard variant="green">
            <h3>Developer</h3>
            <ol>
              <li>Select a package</li>
              <li>Read API documentation</li>
              <li>Contribute code</li>
            </ol>
            <Link href="/packages">Build →</Link>
          </BrutalCard>
        </div>

        <SectionHeading>Live demo preview</SectionHeading>
        <Callout title="Browser CAN/J1939 player">
          Play synthetic traces, step through frames, inspect PGN decoding, and export results -
          entirely client-side.
          <p>
            <Link href="/demo">Open the interactive demo →</Link>
          </p>
        </Callout>

        <SectionHeading>Four labs</SectionHeading>
        <div className={styles.labGrid}>
          {labs.map((lab) => {
            const card = LAB_CARDS[lab.slug];
            return (
              <BrutalCard key={lab.slug} variant="yellow">
                <p className={styles.labNum}>LAB {card?.number ?? '??'}</p>
                <h3>{card?.shortTitle ?? lab.title}</h3>
                <p>
                  {card?.duration} · {card?.hardware ?? 'NO HARDWARE'}
                </p>
                <p>{card?.objective ?? lab.title}</p>
                <Link href={`/labs/${lab.slug}`}>Start lab →</Link>
              </BrutalCard>
            );
          })}
        </div>

        <SectionHeading>Package map</SectionHeading>
        <p className="lead">
          Ten public <code>@embedded32/*</code> packages are maintained in this monorepo. npm
          publishing requires maintainer approval - packages are source-available today via GitHub
          and local install.
        </p>
        <ul className={styles.pkgList}>
          {packages.slice(0, 6).map((p) => (
            <li key={p.slug}>
              <Link href={`/packages/${p.slug}`}>{p.name}</Link> - {p.description}
            </li>
          ))}
        </ul>
        <Link href="/packages">View all packages →</Link>

        <SectionHeading>Architecture overview</SectionHeading>
        <p>
          Embedded32 layers CAN drivers, J1939 decoding, simulation, bridging, and a supervisor
          runtime. The browser demo uses a teaching subset of the J1939 decoder - not a certified
          stack.
        </p>
        <Link href="/docs/architecture">Read architecture →</Link>

        <SectionHeading>For instructors</SectionHeading>
        <p>
          Course module, student guide, instructor guide, rubrics, and verified solutions ship in
          the repository.
        </p>
        <Link href="/teach">Instructor resources →</Link>

        <SectionHeading>Open source</SectionHeading>
        <p>MIT licensed. Contributions welcome via GitHub issues and pull requests.</p>
        <Link href="/contribute">How to contribute →</Link>

        <SectionHeading>Honest maturity</SectionHeading>
        <Callout variant="warning" title="Limitations">
          No SocketCAN in the browser. No WebSockets. No production transport-protocol compliance.
          J1939 coverage is a teaching subset. npm packages are not automatically published - see
          the package guide for install options.
        </Callout>

        <SectionHeading>Quickstart</SectionHeading>
        <CodePanel
          language="shell"
          code={`git clone https://github.com/Mukesh-SCS/Embedded32.git
cd Embedded32
npm ci
npm run build
npx tsx examples/j1939-basic.ts`}
        />

        <div className={styles.finalCta}>
          <BrutalButton variant="yellow" href="/docs/getting-started">
            Start learning
          </BrutalButton>
          <BrutalButton variant="cyan" href="/demo">
            Open demo
          </BrutalButton>
        </div>
      </div>
    </>
  );
}

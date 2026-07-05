import { getScenarioMeta } from '@embedded32/demo';
import type { Trace } from '@embedded32/demo';
import Link from 'next/link';
import styles from '../demo.module.css';

export function ScenarioOverview({ trace }: { trace: Trace | undefined }) {
  if (!trace) return null;
  const meta = getScenarioMeta(trace.scenario);

  return (
    <section className={styles.panel} data-testid="demo-scenario-overview">
      <h3 className={styles.panelTitle}>{meta?.title ?? trace.scenario}</h3>
      <p>{meta?.description ?? trace.description}</p>
      {meta && (
        <>
          <p>
            <strong>Concepts:</strong> {meta.concepts.join(', ')}
          </p>
          <p>
            <strong>ECUs:</strong> {meta.ecus.join(', ')}
          </p>
          <p>
            <strong>Observe:</strong> {meta.observations.join('; ')}
          </p>
          <p>
            <strong>Severity:</strong>{' '}
            <span className={styles[`sev_${meta.faultSeverity}`]}>{meta.faultSeverity}</span>
          </p>
          <p>
            <strong>Notice:</strong> {meta.studentNotice}
          </p>
          {meta.relatedLab && (
            <p>
              <Link href={`/labs/${meta.relatedLab}`}>Related lab →</Link>
            </p>
          )}
        </>
      )}
    </section>
  );
}

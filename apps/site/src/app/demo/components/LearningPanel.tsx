import { getScenarioMeta } from '@embedded32/demo';
import type { Trace } from '@embedded32/demo';
import styles from '../demo.module.css';

export function LearningPanel({ trace }: { trace: Trace | undefined }) {
  const meta = trace ? getScenarioMeta(trace.scenario) : undefined;

  return (
    <section className={styles.learningPanel} data-testid="demo-learning">
      <h3 className={styles.panelTitle}>Learning objectives</h3>
      {meta ? (
        <ul>
          {meta.concepts.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      ) : (
        <p>Explore CAN/J1939 frames using playback controls. Select frames to inspect IDs, PGNs, and decoded signals.</p>
      )}
      <p className={styles.hint}>
        Supported teaching decoders: EEC1, ET1, AMB, ETC1, CCVS1, DM1, Address Claimed, TP.CM, TP.DT. This is not a
        complete J1939 database.
      </p>
    </section>
  );
}

import type { PlayerSnapshot } from '@embedded32/demo';
import styles from '../demo.module.css';

export function MetricPanel({ snapshot }: { snapshot: PlayerSnapshot | null }) {
  if (!snapshot) return null;

  return (
    <section className={styles.metrics} data-testid="demo-metrics" aria-live="polite">
      <div className={styles.metric}>
        <span>Frames</span>
        <strong data-testid="demo-frame-count">
          {snapshot.index} / {snapshot.total}
        </strong>
      </div>
      <div className={styles.metric}>
        <span>Unique PGNs</span>
        <strong data-testid="demo-unique-pgn">{snapshot.uniquePgnCount}</strong>
      </div>
      <div className={styles.metric}>
        <span>Source addresses</span>
        <strong data-testid="demo-unique-sa">{snapshot.uniqueSourceCount}</strong>
      </div>
      <div className={styles.metric}>
        <span>Faults</span>
        <strong data-testid="demo-fault-count">{snapshot.faultCount}</strong>
      </div>
      <div className={styles.metric}>
        <span>Bus load</span>
        <strong data-testid="demo-bus-load">{snapshot.rollingBusLoadPercent}%</strong>
      </div>
      <div className={styles.metric}>
        <span>Peak load</span>
        <strong data-testid="demo-peak-load">{snapshot.peakBusLoadPercent}%</strong>
      </div>
      <div className={styles.metric}>
        <span>Time</span>
        <strong data-testid="demo-current-time">{snapshot.currentTimeMs} ms</strong>
      </div>
    </section>
  );
}

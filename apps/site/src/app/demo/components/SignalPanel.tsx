import type { DecodedFrame } from '@embedded32/demo';
import styles from '../demo.module.css';

export function SignalPanel({ frame }: { frame: DecodedFrame | null }) {
  if (!frame || frame.signals.length === 0) {
    return (
      <section className={styles.signals} data-testid="demo-signals">
        <p className={styles.emptyHint}>No decoded signals for the selected frame.</p>
      </section>
    );
  }

  return (
    <section className={styles.signals} data-testid="demo-latest-decode">
      <h3 className={styles.panelTitle}>
        Signals - {frame.name}{' '}
        <span className={styles.sa}>SA 0x{frame.sourceAddress.toString(16).padStart(2, '0')}</span>
      </h3>
      <ul>
        {frame.signals.map((sig) => (
          <li key={sig.label}>
            <span>{sig.label}</span>
            <strong>
              {sig.value}
              {sig.unit ? ` ${sig.unit}` : ''}
            </strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

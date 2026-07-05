import type { DecodedFrame } from '@embedded32/demo';
import styles from '../demo.module.css';

export function FrameInspector({ frame }: { frame: DecodedFrame | null }) {
  if (!frame) {
    return (
      <section className={styles.inspector} data-testid="demo-inspector">
        <p className={styles.emptyHint}>Select a frame from the table or timeline.</p>
      </section>
    );
  }

  return (
    <section className={styles.inspector} data-testid="demo-inspector" aria-label="Frame inspector">
      <h3 className={styles.panelTitle}>{frame.name}</h3>
      <dl className={styles.inspectGrid}>
        <dt>Raw CAN ID</dt>
        <dd>
          <code>{frame.rawId}</code>
        </dd>
        <dt>Format</dt>
        <dd>{frame.frameFormat}</dd>
        <dt>Priority</dt>
        <dd>{frame.priority}</dd>
        <dt>DP</dt>
        <dd>{frame.dataPage}</dd>
        <dt>PF</dt>
        <dd>0x{frame.pf.toString(16).padStart(2, '0')}</dd>
        <dt>PS</dt>
        <dd>0x{frame.ps.toString(16).padStart(2, '0')}</dd>
        <dt>Source address</dt>
        <dd>
          0x{frame.sourceAddress.toString(16).padStart(2, '0')} ({frame.ecuName})
        </dd>
        <dt>Destination</dt>
        <dd>
          {frame.isBroadcast
            ? 'Broadcast (PDU2 or global DA 255)'
            : `0x${frame.destinationAddress.toString(16).padStart(2, '0')}`}
        </dd>
        <dt>PGN</dt>
        <dd>
          {frame.pgn} ({frame.pgnHex})
        </dd>
        <dt>Data (hex)</dt>
        <dd>
          <code>{frame.rawDataHex || '—'}</code>
        </dd>
      </dl>

      <div className={styles.byteGrid} aria-label="Eight-byte data grid">
        {Array.from({ length: 8 }, (_, i) => {
          const parts = frame.rawDataHex.split(' ');
          return (
            <div key={i} className={styles.byteCell}>
              <span>B{i}</span>
              <code>{parts[i] ?? '—'}</code>
            </div>
          );
        })}
      </div>

      <p className={styles.explanation}>{frame.explanation}</p>
    </section>
  );
}

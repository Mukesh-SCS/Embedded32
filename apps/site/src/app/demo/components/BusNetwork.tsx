import type { DecodedFrame } from '@embedded32/demo';
import styles from '../demo.module.css';

const ECUS = [
  { id: 'engine', label: 'Engine ECU', sa: 0x00 },
  { id: 'trans', label: 'Trans ECU', sa: 0x03 },
  { id: 'dash', label: 'Dashboard ECU', sa: 0x17 },
  { id: 'diag', label: 'Diagnostic Tool', sa: 0xfa },
];

export function BusNetwork({ currentFrame }: { currentFrame: DecodedFrame | null }) {
  const activeSa = currentFrame?.sourceAddress;
  const isFault = currentFrame?.isFault ?? false;
  const isBroadcast = currentFrame?.isBroadcast ?? true;

  return (
    <section className={styles.network} data-testid="demo-bus-network" aria-label="ECU network view">
      <div className={styles.networkGrid}>
        <div className={styles.ecuColumn}>
          {ECUS.slice(0, 3).map((ecu) => (
            <div
              key={ecu.id}
              className={[
                styles.ecuNode,
                activeSa === ecu.sa ? styles.ecuActive : '',
                activeSa === ecu.sa && isFault ? styles.ecuFault : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`${ecu.label}${activeSa === ecu.sa ? ' (active sender)' : ''}`}
            >
              {ecu.label}
              {activeSa === ecu.sa && <span className={styles.activeTag}>TX</span>}
            </div>
          ))}
        </div>
        <div className={styles.busLine} aria-label="CAN bus">
          <span>CAN BUS</span>
          {currentFrame && (
            <span className={styles.busState}>
              {isBroadcast ? 'BROADCAST' : `→ DA 0x${currentFrame.destinationAddress.toString(16).padStart(2, '0')}`}
            </span>
          )}
        </div>
        <div className={styles.ecuColumn}>
          <div
            className={[styles.ecuNode, activeSa === 0xfa ? styles.ecuActive : ''].filter(Boolean).join(' ')}
          >
            Diagnostic Tool
            {activeSa === 0xfa && <span className={styles.activeTag}>TX</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

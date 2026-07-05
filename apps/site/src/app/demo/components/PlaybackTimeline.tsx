import type { DecodedFrame } from '@embedded32/demo';
import styles from '../demo.module.css';

type Props = {
  frames: DecodedFrame[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function PlaybackTimeline({ frames, selectedIndex, onSelect }: Props) {
  if (frames.length === 0) {
    return (
      <section className={styles.timeline} data-testid="demo-timeline">
        <p className={styles.emptyHint}>Press Play or Step to populate the timeline.</p>
      </section>
    );
  }

  return (
    <section className={styles.timeline} data-testid="demo-timeline" aria-label="Frame timeline">
      <div className={styles.timelineTrack}>
        {frames.map((frame, i) => (
          <button
            key={`${frame.timestampMs}-${i}`}
            type="button"
            className={[
              styles.timelineFrame,
              frame.isFault ? styles.timelineFault : '',
              selectedIndex === i ? styles.timelineSelected : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelect(i)}
            aria-label={`Frame ${i + 1}: ${frame.name} at ${frame.timestampMs} ms`}
            data-testid="demo-timeline-frame"
          >
            <span className={styles.timelineTime}>{frame.timestampMs}</span>
            <span className={styles.timelineSa}>SA {frame.sourceAddress.toString(16)}</span>
            <span className={styles.timelinePgn}>{frame.pgnHex}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

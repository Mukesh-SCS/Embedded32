import type { TracePlayerControls } from '../hooks/useTracePlayer';
import styles from '../demo.module.css';

type Props = Pick<
  TracePlayerControls,
  'play' | 'pause' | 'reset' | 'restart' | 'stepForward' | 'stepBackward' | 'setSpeed' | 'setLoop' | 'seekTime' | 'snapshot' | 'speed' | 'speeds' | 'loop'
> & {
  scenario: string;
  scenarios: { scenario: string; title?: string }[];
  onScenarioChange: (s: string) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onExportTrace: () => void;
};

export function DemoToolbar({
  scenario,
  scenarios,
  onScenarioChange,
  snapshot,
  speed,
  speeds,
  loop,
  play,
  pause,
  reset,
  restart,
  stepForward,
  stepBackward,
  setSpeed,
  setLoop,
  seekTime,
  onExportJson,
  onExportCsv,
  onExportTrace,
}: Props) {
  const state = snapshot?.state ?? 'idle';
  const stateLabel = state.toUpperCase();

  return (
    <section className={styles.toolbar} aria-label="Playback controls">
      <div className={styles.toolbarRow}>
        <label>
          Scenario
          <select
            data-testid="demo-scenario"
            value={scenario}
            onChange={(e) => onScenarioChange(e.target.value)}
          >
            {scenarios.map((s) => (
              <option key={s.scenario} value={s.scenario}>
                {s.title ?? s.scenario}
              </option>
            ))}
          </select>
        </label>
        <label>
          Speed
          <select
            data-testid="demo-speed"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            {speeds.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            data-testid="demo-loop"
            checked={loop}
            onChange={(e) => setLoop(e.target.checked)}
          />
          Loop
        </label>
        <span className={styles.stateBadge} data-testid="demo-state" aria-live="polite">
          {stateLabel}
        </span>
      </div>

      <div className={styles.toolbarRow}>
        <button type="button" data-testid="demo-play" onClick={play} disabled={state === 'playing'}>
          Play
        </button>
        <button type="button" data-testid="demo-pause" onClick={pause} disabled={state !== 'playing'}>
          Pause
        </button>
        <button type="button" data-testid="demo-step-back" onClick={stepBackward}>
          Step −
        </button>
        <button type="button" data-testid="demo-step-forward" onClick={stepForward}>
          Step +
        </button>
        <button type="button" data-testid="demo-reset" onClick={reset}>
          Reset
        </button>
        <button type="button" data-testid="demo-restart" onClick={restart}>
          Restart
        </button>
        <button type="button" data-testid="demo-export-json" onClick={onExportJson}>
          Export JSON
        </button>
        <button type="button" data-testid="demo-export-csv" onClick={onExportCsv}>
          Export CSV
        </button>
        <button type="button" data-testid="demo-export-trace" onClick={onExportTrace}>
          Export Trace
        </button>
      </div>

      {snapshot && snapshot.durationMs > 0 && (
        <label className={styles.seekLabel}>
          Seek
          <input
            type="range"
            data-testid="demo-seek"
            min={0}
            max={snapshot.durationMs}
            value={snapshot.currentTimeMs}
            onChange={(e) => seekTime(Number(e.target.value))}
          />
          <span className={styles.mono}>
            {snapshot.currentTimeMs} / {snapshot.durationMs} ms
          </span>
        </label>
      )}
    </section>
  );
}

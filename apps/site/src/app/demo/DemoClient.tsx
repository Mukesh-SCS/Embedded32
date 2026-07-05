'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TracePlayer,
  TRACES,
  type DecodedFrame,
  type PlayerSnapshot,
} from '@embedded32/demo';
import styles from './demo.module.css';

const SPEEDS = [1, 2, 4, 10];

export function DemoClient() {
  const [scenario, setScenario] = useState(TRACES[0]?.scenario ?? '');
  const [speed, setSpeed] = useState(4);
  const [snapshot, setSnapshot] = useState<PlayerSnapshot | null>(null);
  const playerRef = useRef<TracePlayer | null>(null);

  const trace = useMemo(
    () => TRACES.find((t) => t.scenario === scenario) ?? TRACES[0],
    [scenario]
  );

  useEffect(() => {
    const player = new TracePlayer({ speed, onUpdate: setSnapshot });
    playerRef.current = player;
    if (trace) player.load(trace);
    return () => player.stop();
  }, [trace, speed]);

  const decoded: DecodedFrame[] = snapshot?.decoded ?? [];
  const state = snapshot?.state ?? 'idle';
  const busLoad = snapshot?.busLoadPercent ?? 0;

  const latestSignals = decoded.length > 0 ? decoded[decoded.length - 1] : null;

  return (
    <div>
      <p className={styles.notice}>
        Everything below runs <strong>entirely in your browser</strong> using synthetic traces.
        There is no server, WebSocket, or hardware connection.
      </p>

      <div className={styles.controls}>
        <label>
          Scenario
          <select value={scenario} onChange={(e) => setScenario(e.target.value)}>
            {TRACES.map((t) => (
              <option key={t.scenario} value={t.scenario}>
                {t.scenario}
              </option>
            ))}
          </select>
        </label>

        <label>
          Speed
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </label>

        <div className={styles.buttons}>
          <button
            type="button"
            onClick={() => playerRef.current?.play()}
            disabled={state === 'playing'}
          >
            Play
          </button>
          <button
            type="button"
            onClick={() => playerRef.current?.pause()}
            disabled={state !== 'playing'}
          >
            Pause
          </button>
          <button type="button" onClick={() => playerRef.current?.stop()}>
            Reset
          </button>
        </div>
      </div>

      {trace && <p className={styles.scenarioDesc}>{trace.description}</p>}

      <div className={styles.meters}>
        <div className={styles.meter}>
          <span>Frames decoded</span>
          <strong>
            {snapshot?.index ?? 0} / {snapshot?.total ?? trace?.frames.length ?? 0}
          </strong>
        </div>
        <div className={styles.meter}>
          <span>Estimated bus load (250 kbps)</span>
          <strong>{busLoad}%</strong>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{
                width: `${Math.min(100, busLoad)}%`,
                background: busLoad > 80 ? '#dc2626' : busLoad > 50 ? '#f59e0b' : '#16a34a',
              }}
            />
          </div>
        </div>
      </div>

      {latestSignals && latestSignals.signals.length > 0 && (
        <div className={styles.signals}>
          <h3>
            Latest decode — {latestSignals.name}{' '}
            <span className={styles.sa}>SA 0x{latestSignals.sourceAddress.toString(16).padStart(2, '0')}</span>
          </h3>
          <ul>
            {latestSignals.signals.map((sig) => (
              <li key={sig.label}>
                <span>{sig.label}</span>
                <strong>
                  {sig.value}
                  {sig.unit ? ` ${sig.unit}` : ''}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.log}>
        <table>
          <thead>
            <tr>
              <th>t (ms)</th>
              <th>CAN ID</th>
              <th>PGN</th>
              <th>SA</th>
              <th>Message</th>
              <th>Decoded</th>
            </tr>
          </thead>
          <tbody>
            {decoded.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  Press <strong>Play</strong> to stream the selected trace.
                </td>
              </tr>
            )}
            {decoded
              .slice()
              .reverse()
              .map((frame, i) => (
                <tr key={`${frame.timestampMs}-${i}`} className={frame.isFault ? styles.faultRow : undefined}>
                  <td>{frame.timestampMs}</td>
                  <td>
                    <code>{frame.rawId}</code>
                  </td>
                  <td>
                    <code>{frame.pgnHex}</code>
                  </td>
                  <td>
                    <code>0x{frame.sourceAddress.toString(16).padStart(2, '0')}</code>
                  </td>
                  <td>{frame.name}</td>
                  <td>
                    {frame.signals.length === 0
                      ? '—'
                      : frame.signals
                          .map((s) => `${s.label}: ${s.value}${s.unit ? ` ${s.unit}` : ''}`)
                          .join('; ')}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

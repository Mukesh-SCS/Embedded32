'use client';

import { useMemo } from 'react';
import {
  TRACES,
  SCENARIO_META,
  exportDecodedCsv,
  exportDecodedJson,
  exportTraceJson,
} from '@embedded32/demo';
import { downloadBlob, useTracePlayer } from './hooks/useTracePlayer';
import { DemoToolbar } from './components/DemoToolbar';
import { ScenarioOverview } from './components/ScenarioOverview';
import { BusNetwork } from './components/BusNetwork';
import { PlaybackTimeline } from './components/PlaybackTimeline';
import { MetricPanel } from './components/MetricPanel';
import { FrameTable } from './components/FrameTable';
import { FrameInspector } from './components/FrameInspector';
import { SignalPanel } from './components/SignalPanel';
import { TraceImport } from './components/TraceImport';
import { LearningPanel } from './components/LearningPanel';
import styles from './demo.module.css';

export function DemoClient() {
  const player = useTracePlayer();
  const { trace, snapshot, customTrace } = player;

  const decoded = snapshot?.decoded ?? [];
  const selectedIndex = snapshot?.selectedIndex ?? -1;
  const selectedFrame =
    selectedIndex >= 0 && selectedIndex < decoded.length
      ? decoded[selectedIndex]
      : (snapshot?.currentFrame ?? null);

  const scenarios = useMemo(() => {
    const builtIn = TRACES.map((t) => ({
      scenario: t.scenario,
      title: SCENARIO_META[t.scenario]?.title ?? t.scenario,
    }));
    if (customTrace && !builtIn.some((b) => b.scenario === customTrace.scenario)) {
      return [
        ...builtIn,
        { scenario: customTrace.scenario, title: `${customTrace.scenario} (imported)` },
      ];
    }
    return builtIn;
  }, [customTrace]);

  const slug = trace?.scenario?.replace(/[^a-z0-9-]/gi, '-') ?? 'trace';

  const handleExportJson = () => {
    const frames = player.decodeAll();
    downloadBlob(`embedded32-${slug}-decoded.json`, exportDecodedJson(frames), 'application/json');
  };

  const handleExportCsv = () => {
    const frames = player.decodeAll();
    downloadBlob(`embedded32-${slug}-decoded.csv`, exportDecodedCsv(frames), 'text/csv');
  };

  const handleExportTrace = () => {
    if (!trace) return;
    downloadBlob(`embedded32-${slug}-trace.json`, exportTraceJson(trace), 'application/json');
  };

  return (
    <div className={styles.root} data-testid="demo-root">
      <p className={styles.notice}>
        Everything below runs <strong>entirely in your browser</strong> using synthetic traces. No
        server, WebSocket, or hardware connection.
      </p>

      <DemoToolbar
        {...player}
        scenario={customTrace ? customTrace.scenario : player.scenario}
        scenarios={scenarios}
        onScenarioChange={player.changeScenario}
        onExportJson={handleExportJson}
        onExportCsv={handleExportCsv}
        onExportTrace={handleExportTrace}
      />

      <div className={styles.dashboard}>
        <aside className={styles.colLearning}>
          <LearningPanel trace={trace} />
          <ScenarioOverview trace={trace} />
          <TraceImport onImport={player.loadCustomTrace} onClear={player.clearCustomTrace} />
        </aside>

        <div className={styles.colCenter}>
          <BusNetwork currentFrame={snapshot?.currentFrame ?? null} />
          <PlaybackTimeline
            frames={decoded}
            selectedIndex={selectedIndex}
            onSelect={player.selectFrame}
          />
          <MetricPanel snapshot={snapshot} />
        </div>

        <aside className={styles.colInspector}>
          <FrameInspector frame={selectedFrame} />
          <SignalPanel frame={selectedFrame} />
        </aside>
      </div>

      <FrameTable frames={decoded} selectedIndex={selectedIndex} onSelect={player.selectFrame} />
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TracePlayer,
  TRACES,
  type PlayerSnapshot,
  type Trace,
} from '@embedded32/demo';

const SPEEDS = [0.5, 1, 2, 4, 10];

export function useTracePlayer(initialScenario?: string) {
  const [scenario, setScenario] = useState(initialScenario ?? TRACES[0]?.scenario ?? '');
  const [speed, setSpeedState] = useState(4);
  const [loop, setLoopState] = useState(false);
  const [snapshot, setSnapshot] = useState<PlayerSnapshot | null>(null);
  const [customTrace, setCustomTrace] = useState<Trace | null>(null);
  const playerRef = useRef<TracePlayer | null>(null);

  const trace = useMemo(() => {
    if (customTrace) return customTrace;
    return TRACES.find((t) => t.scenario === scenario) ?? TRACES[0];
  }, [scenario, customTrace]);

  useEffect(() => {
    const player = new TracePlayer({ speed, loop, onUpdate: setSnapshot });
    playerRef.current = player;
    if (trace) player.load(trace);
    return () => player.stop();
  }, [trace]);

  useEffect(() => {
    playerRef.current?.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    playerRef.current?.setLoop(loop);
  }, [loop]);

  const play = useCallback(() => playerRef.current?.play(), []);
  const pause = useCallback(() => playerRef.current?.pause(), []);
  const reset = useCallback(() => playerRef.current?.reset(), []);
  const restart = useCallback(() => playerRef.current?.restart(), []);
  const stepForward = useCallback(() => playerRef.current?.stepForward(), []);
  const stepBackward = useCallback(() => playerRef.current?.stepBackward(), []);
  const seekFrame = useCallback((i: number) => playerRef.current?.seekFrame(i), []);
  const seekTime = useCallback((ms: number) => playerRef.current?.seekTime(ms), []);
  const selectFrame = useCallback((i: number) => playerRef.current?.selectFrame(i), []);
  const setSpeed = useCallback((s: number) => setSpeedState(s), []);
  const setLoop = useCallback((l: boolean) => setLoopState(l), []);
  const decodeAll = useCallback(() => playerRef.current?.decodeAll() ?? [], []);

  const loadCustomTrace = useCallback((t: Trace) => {
    setCustomTrace(t);
    setScenario(t.scenario);
  }, []);

  const clearCustomTrace = useCallback(() => {
    setCustomTrace(null);
    setScenario(TRACES[0]?.scenario ?? '');
  }, []);

  const changeScenario = useCallback((s: string) => {
    setCustomTrace(null);
    setScenario(s);
  }, []);

  return {
    trace,
    scenario,
    customTrace,
    speed: speed,
    speeds: SPEEDS,
    loop,
    snapshot,
    playerRef,
    play,
    pause,
    reset,
    restart,
    stepForward,
    stepBackward,
    seekFrame,
    seekTime,
    selectFrame,
    setSpeed,
    setLoop,
    decodeAll,
    loadCustomTrace,
    clearCustomTrace,
    changeScenario,
  };
}

export type TracePlayerControls = ReturnType<typeof useTracePlayer>;

export function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

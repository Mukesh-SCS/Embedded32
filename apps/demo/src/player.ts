import { decodeFrame, resetBamState } from './decoder';
import type { DecodedFrame, Trace, TraceFrame } from './types';

export type PlayerState = 'idle' | 'playing' | 'paused' | 'finished';

/**
 * Extended player snapshot. Existing fields preserved; new metrics added in v2.
 */
export type PlayerSnapshot = {
  state: PlayerState;
  /** Number of frames decoded so far (legacy alias: index). */
  index: number;
  total: number;
  decoded: DecodedFrame[];
  /** Average bus load over full trace duration (legacy). */
  busLoadPercent: number;
  /** Current trace timestamp in ms. */
  currentTimeMs: number;
  /** Total trace duration in ms. */
  durationMs: number;
  /** Playback progress 0-100. */
  progressPercent: number;
  /** Most recently decoded frame, if any. */
  currentFrame: DecodedFrame | null;
  /** Selected frame index in decoded array (-1 if none). */
  selectedIndex: number;
  uniquePgnCount: number;
  uniqueSourceCount: number;
  faultCount: number;
  /** Rolling bus load over recent window. */
  rollingBusLoadPercent: number;
  peakBusLoadPercent: number;
  loop: boolean;
  speed: number;
};

export type PlayerOptions = {
  speed?: number;
  bitRate?: number;
  loop?: boolean;
  onUpdate: (snapshot: PlayerSnapshot) => void;
};

const DEFAULT_BIT_RATE = 250_000;
const BITS_PER_FRAME = 128;
const ROLLING_WINDOW_MS = 100;

export class TracePlayer {
  private frames: TraceFrame[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private decoded: DecodedFrame[] = [];
  private index = 0;
  private selectedIndex = -1;
  private state: PlayerState = 'idle';
  private speed: number;
  private loop: boolean;
  private readonly bitRate: number;
  private readonly onUpdate: (snapshot: PlayerSnapshot) => void;
  private peakBusLoad = 0;

  constructor(options: PlayerOptions) {
    this.speed = options.speed && options.speed > 0 ? options.speed : 1;
    this.loop = options.loop ?? false;
    this.bitRate = options.bitRate ?? DEFAULT_BIT_RATE;
    this.onUpdate = options.onUpdate;
  }

  load(trace: Trace): void {
    this.stop();
    resetBamState();
    this.frames = [...trace.frames].sort((a, b) => a.timestampMs - b.timestampMs);
    this.peakBusLoad = 0;
    this.emit();
  }

  play(): void {
    if (this.state === 'playing' || this.frames.length === 0) return;
    if (this.state === 'finished') {
      this.index = 0;
      this.decoded = [];
      resetBamState();
    }
    this.state = 'playing';
    this.scheduleNext();
    this.emit();
  }

  pause(): void {
    if (this.state !== 'playing') return;
    this.clearTimer();
    this.state = 'paused';
    this.emit();
  }

  reset(): void {
    this.clearTimer();
    this.decoded = [];
    this.index = 0;
    this.selectedIndex = -1;
    this.state = 'idle';
    resetBamState();
    this.emit();
  }

  /** Alias for reset(). */
  stop(): void {
    this.reset();
  }

  restart(): void {
    this.reset();
    this.play();
  }

  stepForward(): void {
    this.clearTimer();
    if (this.index >= this.frames.length) return;
    this.decoded = [...this.decoded, decodeFrame(this.frames[this.index])];
    this.index++;
    if (this.index >= this.frames.length) {
      this.state = this.loop ? 'playing' : 'finished';
      if (this.loop) {
        this.index = 0;
        this.decoded = [];
        resetBamState();
        this.state = 'playing';
        this.scheduleNext();
      }
    } else {
      this.state = 'paused';
    }
    this.emit();
  }

  stepBackward(): void {
    this.clearTimer();
    if (this.index <= 0 && this.decoded.length === 0) return;
    if (this.decoded.length > 0) {
      this.decoded = this.decoded.slice(0, -1);
      this.index = Math.max(0, this.index - 1);
    }
    resetBamState();
    this.decoded = this.frames.slice(0, this.index).map(decodeFrame);
    this.state = 'paused';
    this.emit();
  }

  seekFrame(targetIndex: number): void {
    this.clearTimer();
    const idx = Math.max(0, Math.min(targetIndex, this.frames.length));
    this.index = idx;
    resetBamState();
    this.decoded = this.frames.slice(0, idx).map(decodeFrame);
    this.state = idx >= this.frames.length ? 'finished' : 'paused';
    this.emit();
  }

  seekTime(timestampMs: number): void {
    let idx = 0;
    for (let i = 0; i < this.frames.length; i++) {
      if (this.frames[i].timestampMs <= timestampMs) idx = i + 1;
      else break;
    }
    this.seekFrame(idx);
  }

  setSpeed(speed: number): void {
    if (speed <= 0) return;
    const wasPlaying = this.state === 'playing';
    this.clearTimer();
    this.speed = speed;
    if (wasPlaying) {
      this.state = 'playing';
      this.scheduleNext();
    }
    this.emit();
  }

  setLoop(enabled: boolean): void {
    this.loop = enabled;
    this.emit();
  }

  selectFrame(index: number): void {
    if (index < 0 || index >= this.decoded.length) {
      this.selectedIndex = -1;
    } else {
      this.selectedIndex = index;
    }
    this.emit();
  }

  decodeAll(): DecodedFrame[] {
    resetBamState();
    return this.frames.map(decodeFrame);
  }

  getTrace(): TraceFrame[] {
    return [...this.frames];
  }

  private scheduleNext(): void {
    this.clearTimer();
    if (this.state !== 'playing' || this.index >= this.frames.length) {
      if (this.index >= this.frames.length && this.state === 'playing') {
        if (this.loop) {
          this.index = 0;
          this.decoded = [];
          resetBamState();
          this.timer = setTimeout(() => this.scheduleNext(), 1);
        } else {
          this.state = 'finished';
          this.emit();
        }
      }
      return;
    }

    const frame = this.frames[this.index];
    const prevTime = this.index > 0 ? this.frames[this.index - 1].timestampMs : frame.timestampMs;
    const delay = this.index === 0 ? 0 : Math.max(0, (frame.timestampMs - prevTime) / this.speed);

    this.timer = setTimeout(() => {
      this.decoded = [...this.decoded, decodeFrame(frame)];
      this.index++;
      if (this.index >= this.frames.length) {
        if (this.loop) {
          this.index = 0;
          this.decoded = [];
          resetBamState();
          this.emit();
          this.timer = setTimeout(() => this.scheduleNext(), 1);
          return;
        }
        this.state = 'finished';
      }
      this.emit();
      if (this.state === 'playing' && this.index < this.frames.length) {
        this.scheduleNext();
      }
    }, delay);
  }

  private durationMs(): number {
    if (this.frames.length === 0) return 0;
    return this.frames[this.frames.length - 1].timestampMs - this.frames[0].timestampMs;
  }

  private currentTimeMs(): number {
    if (this.decoded.length === 0) return this.frames[0]?.timestampMs ?? 0;
    return this.decoded[this.decoded.length - 1].timestampMs;
  }

  private busLoad(): number {
    if (this.frames.length < 2) return 0;
    const durationMs = this.durationMs();
    if (durationMs <= 0) return 0;
    const bits = this.frames.length * BITS_PER_FRAME;
    const load = (bits / (durationMs / 1000) / this.bitRate) * 100;
    return Math.min(100, Math.round(load * 10) / 10);
  }

  private rollingBusLoad(): number {
    if (this.decoded.length < 2) return 0;
    const end = this.currentTimeMs();
    const start = Math.max(this.frames[0]?.timestampMs ?? 0, end - ROLLING_WINDOW_MS);
    const recent = this.decoded.filter((f) => f.timestampMs >= start && f.timestampMs <= end);
    if (recent.length < 2) return 0;
    const windowMs = end - start || 1;
    const bits = recent.length * BITS_PER_FRAME;
    const load = (bits / (windowMs / 1000) / this.bitRate) * 100;
    return Math.min(100, Math.round(load * 10) / 10);
  }

  private countUnique<T>(items: T[]): number {
    return new Set(items).size;
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private emit(): void {
    const rolling = this.rollingBusLoad();
    this.peakBusLoad = Math.max(this.peakBusLoad, rolling, this.busLoad());
    const pgns = this.decoded.map((f) => f.pgn);
    const sources = this.decoded.map((f) => f.sourceAddress);
    const dur = this.durationMs();
    const cur = this.currentTimeMs();
    const progress =
      dur > 0
        ? Math.min(100, Math.round(((cur - (this.frames[0]?.timestampMs ?? 0)) / dur) * 100))
        : 0;

    this.onUpdate({
      state: this.state,
      index: this.index,
      total: this.frames.length,
      decoded: this.decoded,
      busLoadPercent: this.busLoad(),
      currentTimeMs: cur,
      durationMs: dur,
      progressPercent: progress,
      currentFrame: this.decoded.length > 0 ? this.decoded[this.decoded.length - 1] : null,
      selectedIndex: this.selectedIndex,
      uniquePgnCount: this.countUnique(pgns),
      uniqueSourceCount: this.countUnique(sources),
      faultCount: this.decoded.filter((f) => f.isFault).length,
      rollingBusLoadPercent: rolling,
      peakBusLoadPercent: this.peakBusLoad,
      loop: this.loop,
      speed: this.speed,
    });
  }
}

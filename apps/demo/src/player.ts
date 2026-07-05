import { decodeFrame } from './decoder';
import type { DecodedFrame, Trace, TraceFrame } from './types';

export type PlayerState = 'idle' | 'playing' | 'paused' | 'finished';

export type PlayerSnapshot = {
  state: PlayerState;
  index: number;
  total: number;
  decoded: DecodedFrame[];
  busLoadPercent: number;
};

export type PlayerOptions = {
  /** Playback speed multiplier (1 = real time based on trace timestamps). */
  speed?: number;
  /** CAN bit rate used for the bus-load estimate. */
  bitRate?: number;
  onUpdate: (snapshot: PlayerSnapshot) => void;
};

const DEFAULT_BIT_RATE = 250_000;
const BITS_PER_FRAME = 128; // ~29-bit ID + 8 data bytes + overhead, teaching approximation

/**
 * Plays a trace by scheduling frames according to their relative timestamps.
 * Pure browser timers — no network or worker required. Safe to run during SSR guards
 * because it only starts on explicit play().
 */
export class TracePlayer {
  private frames: TraceFrame[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  private decoded: DecodedFrame[] = [];
  private index = 0;
  private state: PlayerState = 'idle';
  private readonly speed: number;
  private readonly bitRate: number;
  private readonly onUpdate: (snapshot: PlayerSnapshot) => void;

  constructor(options: PlayerOptions) {
    this.speed = options.speed && options.speed > 0 ? options.speed : 1;
    this.bitRate = options.bitRate ?? DEFAULT_BIT_RATE;
    this.onUpdate = options.onUpdate;
  }

  load(trace: Trace): void {
    this.stop();
    this.frames = [...trace.frames].sort((a, b) => a.timestampMs - b.timestampMs);
    this.decoded = [];
    this.index = 0;
    this.state = 'idle';
    this.emit();
  }

  play(): void {
    if (this.state === 'playing' || this.frames.length === 0) return;
    this.state = 'playing';

    const startFrom = this.index;
    const baseTime = this.frames[startFrom]?.timestampMs ?? 0;

    for (let i = startFrom; i < this.frames.length; i++) {
      const frame = this.frames[i];
      const delay = Math.max(0, (frame.timestampMs - baseTime) / this.speed);
      const timer = setTimeout(() => {
        this.decoded = [...this.decoded, decodeFrame(frame)];
        this.index = i + 1;
        if (this.index >= this.frames.length) {
          this.state = 'finished';
        }
        this.emit();
      }, delay);
      this.timers.push(timer);
    }
    this.emit();
  }

  pause(): void {
    if (this.state !== 'playing') return;
    this.clearTimers();
    this.state = 'paused';
    this.emit();
  }

  stop(): void {
    this.clearTimers();
    this.decoded = [];
    this.index = 0;
    this.state = 'idle';
    this.emit();
  }

  /** Decode every frame at once without timed playback. */
  decodeAll(): DecodedFrame[] {
    return this.frames.map(decodeFrame);
  }

  private busLoad(): number {
    if (this.frames.length < 2) return 0;
    const durationMs = this.frames[this.frames.length - 1].timestampMs - this.frames[0].timestampMs;
    if (durationMs <= 0) return 0;
    const bits = this.frames.length * BITS_PER_FRAME;
    const seconds = durationMs / 1000;
    const load = (bits / seconds / this.bitRate) * 100;
    return Math.min(100, Math.round(load * 10) / 10);
  }

  private clearTimers(): void {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers = [];
  }

  private emit(): void {
    this.onUpdate({
      state: this.state,
      index: this.index,
      total: this.frames.length,
      decoded: this.decoded,
      busLoadPercent: this.busLoad(),
    });
  }
}

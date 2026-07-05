import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { decodeFrame, parseId, resetBamState } from '../src/decoder';
import { TracePlayer } from '../src/player';
import { exportDecodedCsv, exportDecodedJson, validateTraceInput } from '../src/export';
import {
<<<<<<< HEAD
  normalizeCanId,
  sanitizeCsvCell,
  MAX_FRAME_COUNT,
  MAX_TRACE_BYTES,
} from '../src/normalize';
=======
  exportDecodedCsv,
  exportDecodedJson,
  validateTraceInput,
} from '../src/export';
import { normalizeCanId, sanitizeCsvCell, MAX_FRAME_COUNT } from '../src/normalize';
>>>>>>> 5244591b6f6e795be5258a44b6ca16466532c845
import { createBamState, processBamFrame, isTpCmBam } from '../src/bam';
import type { TraceFrame } from '../src/types';

describe('normalizeCanId', () => {
  it('accepts optional 0x prefix', () => {
    expect(normalizeCanId('0x18F00400')?.hex).toBe('18F00400');
    expect(normalizeCanId('18F00400')?.hex).toBe('18F00400');
  });

  it('rejects invalid extended range', () => {
    expect(normalizeCanId('20000000')).toBeNull();
  });

  it('rejects standard ID out of range', () => {
    expect(normalizeCanId('800', false)).toBeNull();
  });
});

describe('decoder', () => {
  beforeEach(() => resetBamState());

  it('parses PDU2 engine speed frame', () => {
    const parsed = parseId(0x18f0040e);
    expect(parsed.pgn).toBe(0xf004);
    expect(parsed.sa).toBe(0x0e);
    expect(parsed.priority).toBe(6);
  });

  it('decodes EEC1 engine speed from bytes', () => {
    const frame: TraceFrame = {
      id: '18F0040E',
      timestampMs: 0,
      data: [0, 0, 0, 0x00, 0x10, 0, 0, 0],
    };
    const decoded = decodeFrame(frame);
    expect(decoded.signals.some((s) => s.label === 'Engine Speed')).toBe(true);
    expect(decoded.signals.find((s) => s.label === 'Engine Speed')?.value).toBe('512.0');
  });

  it('decodes ET1 coolant temperature', () => {
    const decoded = decodeFrame({
      id: '18FEEE00',
      timestampMs: 0,
      data: [90, 255, 255, 255, 255, 255, 255, 255],
    });
    expect(decoded.signals[0]?.label).toBe('Coolant Temperature');
    expect(decoded.signals[0]?.value).toBe('50');
  });

  it('decodes AMB barometric pressure', () => {
    const decoded = decodeFrame({
      id: '18FEF500',
      timestampMs: 0,
      data: [200, 0, 0, 0, 0, 0, 0, 0],
    });
    expect(decoded.signals[0]?.value).toBe('100.0');
  });

  it('decodes ETC1', () => {
    const decoded = decodeFrame({
      id: '18F00003',
      timestampMs: 0,
      data: [0, 0x10, 0x00, 0, 0, 0, 0, 0],
    });
    expect(decoded.name).toContain('ETC1');
  });

  it('decodes CCVS1 vehicle speed', () => {
    const decoded = decodeFrame({
      id: '18FEF100',
      timestampMs: 0,
      data: [0, 0x00, 0x40, 0, 0, 0, 0, 0],
    });
    expect(decoded.signals.some((s) => s.label === 'Vehicle Speed')).toBe(true);
  });

  it('decodes DM1 with multiple DTCs', () => {
    const decoded = decodeFrame({
      id: '18FECA00',
      timestampMs: 0,
      data: [0x04, 0xff, 0x34, 0x12, 0x05, 0x01, 0x56, 0x34],
    });
    expect(decoded.isFault).toBe(true);
    expect(decoded.signals.some((s) => s.label.includes('SPN'))).toBe(true);
  });

  it('decodes Address Claimed', () => {
    const decoded = decodeFrame({
      id: '18EEFF00',
      timestampMs: 0,
      data: [0, 0, 0, 0, 0, 0, 0, 1],
    });
    expect(decoded.name).toContain('Address Claimed');
    expect(decoded.pgn).toBe(0xee00);
  });

  it('decodes TP.CM BAM', () => {
    const decoded = decodeFrame({
      id: '18ECFF00',
      timestampMs: 0,
      data: [32, 16, 0, 3, 255, 0xca, 0xfe, 0],
    });
    expect(decoded.name).toContain('TP.CM');
    expect(decoded.signals.some((s) => s.label === 'Control')).toBe(true);
  });

  it('includes extended frame fields', () => {
    const decoded = decodeFrame({ id: '18F0040E', timestampMs: 0, data: [0, 0, 0, 0, 0, 0, 0, 0] });
    expect(decoded.pf).toBe(0xf0);
    expect(decoded.rawDataHex).toBeTruthy();
    expect(decoded.ecuName).toBeTruthy();
  });
});

describe('BAM reassembler', () => {
  it('completes BAM sequence', () => {
    let state = createBamState();
    state = processBamFrame(state, 0xec00, [32, 10, 0, 2, 255, 0, 0, 0]);
    state = processBamFrame(state, 0xeb00, [1, 1, 2, 3, 4, 5, 6, 7]);
    state = processBamFrame(state, 0xeb00, [2, 8, 9, 10, 0, 0, 0, 0]);
    expect(state.status).toBe('complete');
    expect(state.assembledPayload.length).toBe(10);
  });

  it('detects missing packet', () => {
    let state = createBamState();
    state = processBamFrame(state, 0xec00, [32, 8, 0, 2, 255, 0, 0, 0]);
    state = processBamFrame(state, 0xeb00, [2, 1, 2, 3, 4, 5, 6, 7]);
    expect(state.status).toBe('announced');
    expect(state.receivedPackets.size).toBe(1);
  });

  it('detects duplicate packet', () => {
    let state = createBamState();
    state = processBamFrame(state, 0xec00, [32, 8, 0, 1, 255, 0, 0, 0]);
    state = processBamFrame(state, 0xeb00, [1, 1, 2, 3, 4, 5, 6, 7]);
    state = processBamFrame(state, 0xeb00, [1, 1, 2, 3, 4, 5, 6, 7]);
    expect(state.status).toBe('error');
  });

  it('identifies TP.CM BAM', () => {
    expect(isTpCmBam(0xec00, [32, 0, 0, 0, 0, 0, 0, 0])).toBe(true);
  });
});

describe('TracePlayer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const sampleTrace = {
    format: 'embedded32-trace-v1',
    scenario: 'test',
    description: '',
    source: 'test',
    frames: [
      { id: '18F0040E', timestampMs: 0, data: [0, 0, 0, 0x10, 0x00, 0, 0, 0] },
      { id: '18FEEE0E', timestampMs: 100, data: [0x50, 0, 0, 0, 0, 0, 0, 0] },
      { id: '18FEEE0E', timestampMs: 200, data: [0x51, 0, 0, 0, 0, 0, 0, 0] },
    ],
  };

  it('plays frames in timestamp order', () => {
    const updates: number[] = [];
    const player = new TracePlayer({
      speed: 1000,
      onUpdate: (s) => updates.push(s.index),
    });
    player.load(sampleTrace);
    player.play();
    vi.runAllTimers();
    expect(updates[updates.length - 1]).toBe(3);
  });

  it('supports pause and resume', () => {
    const player = new TracePlayer({ speed: 1, onUpdate: () => {} });
    player.load(sampleTrace);
    player.play();
    vi.advanceTimersByTime(1);
    player.pause();
    player.play();
    vi.runAllTimers();
    expect(player.decodeAll().length).toBe(3);
  });

  it('steps forward and backward', () => {
    const indices: number[] = [];
    const player = new TracePlayer({ onUpdate: (s) => indices.push(s.index) });
    player.load(sampleTrace);
    player.stepForward();
    player.stepForward();
    expect(indices[indices.length - 1]).toBe(2);
    player.stepBackward();
    expect(indices[indices.length - 1]).toBe(1);
  });

  it('seeks to frame and time', () => {
    let lastIndex = 0;
    const player = new TracePlayer({
      onUpdate: (s) => {
        lastIndex = s.index;
      },
    });
    player.load(sampleTrace);
    player.seekFrame(2);
    expect(lastIndex).toBe(2);
    player.seekTime(150);
    expect(lastIndex).toBe(2);
  });

  it('changes speed', () => {
    const player = new TracePlayer({ speed: 1, onUpdate: () => {} });
    player.load(sampleTrace);
    player.setSpeed(10);
    player.play();
    vi.runAllTimers();
  });

  it('loops when enabled', () => {
    const indices: number[] = [];
    const player = new TracePlayer({
      loop: true,
      speed: 1000,
      onUpdate: (s) => indices.push(s.index),
    });
    player.load({
      ...sampleTrace,
      frames: [{ id: '18F0040E', timestampMs: 0, data: [0, 0, 0, 0x10, 0x00] }],
    });
    player.play();
    vi.advanceTimersByTime(5);
    player.pause();
    expect(indices.filter((i) => i === 0).length).toBeGreaterThan(1);
  });

  it('exposes extended snapshot fields', () => {
    let snap: ReturnType<TracePlayer['decodeAll']> | null = null;
    const player = new TracePlayer({
      onUpdate: (s) => {
        if (s.index === 1) snap = s.decoded;
      },
    });
    player.load(sampleTrace);
    player.stepForward();
    expect(snap).not.toBeNull();
  });

  it('decodeAll returns every frame without playback', () => {
    const player = new TracePlayer({ onUpdate: () => {} });
    player.load(sampleTrace);
    expect(player.decodeAll()).toHaveLength(3);
  });
});

describe('export helpers', () => {
  it('exports valid JSON and CSV', () => {
    const frames = [decodeFrame({ id: '18F0040E', timestampMs: 0, data: [0, 0, 0, 0x10, 0x00] })];
    const json = exportDecodedJson(frames);
    const csv = exportDecodedCsv(frames);

    expect(JSON.parse(json).frames).toHaveLength(1);
    expect(csv.split('\n')[0]).toContain('timestampMs');
  });

  it('neutralizes CSV formula injection', () => {
    const frames = [
      decodeFrame({
        id: '18F0040E',
        timestampMs: 0,
        data: [0, 0, 0, 0x10, 0x00],
      }),
    ];
    frames[0].name = '=CMD|';
    const csv = exportDecodedCsv(frames);
    expect(csv).toContain("'=CMD");
    expect(sanitizeCsvCell('-1+2')).toContain("'-1+2");
  });

  it('rejects invalid trace JSON safely', () => {
    expect(validateTraceInput('not json').ok).toBe(false);
    expect(validateTraceInput('{"scenario":"x","frames":[]}').ok).toBe(false);
    expect(
      validateTraceInput('{"scenario":"x","frames":[{"id":"ZZ","data":[1],"timestampMs":0}]}').ok
    ).toBe(false);
  });

  it('rejects more than eight bytes', () => {
    const result = validateTraceInput(
      JSON.stringify({
        scenario: 'x',
        frames: [{ id: '123', timestampMs: 0, data: [1, 2, 3, 4, 5, 6, 7, 8, 9] }],
      })
    );
    expect(result.ok).toBe(false);
  });

  it('rejects noninteger bytes', () => {
    const result = validateTraceInput(
      JSON.stringify({
        scenario: 'x',
        frames: [{ id: '123', timestampMs: 0, data: [1.5] }],
      })
    );
    expect(result.ok).toBe(false);
  });

  it('accepts 0x prefixed IDs', () => {
    const result = validateTraceInput(
      JSON.stringify({
        scenario: 'import-test',
        frames: [{ id: '0x18F0040E', timestampMs: 0, data: [0] }],
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.trace.format).toBe('embedded32-trace-v1');
      expect(result.trace.source).toBe('imported');
    }
  });

  it('enforces frame count limit', () => {
    const frames = Array.from({ length: MAX_FRAME_COUNT + 1 }, (_, i) => ({
      id: '123',
      timestampMs: i,
      data: [0],
    }));
    const result = validateTraceInput(JSON.stringify({ scenario: 'big', frames }));
    expect(result.ok).toBe(false);
  });
});

import type { DecodedFrame, DecodedSignal, TraceFrame } from './types';

/**
 * Browser-safe J1939 decoder - a teaching subset that mirrors the scaling used by
 * `@embedded32/j1939`. It intentionally covers only a handful of PGNs/SPNs so the demo
 * stays readable. It is NOT a complete J1939 implementation.
 */

export type ParsedId = {
  priority: number;
  pgn: number;
  pf: number;
  ps: number;
  sa: number;
  dp: number;
};

export function parseId(id: number): ParsedId {
  const priority = (id >>> 26) & 0x7;
  const dp = (id >>> 24) & 0x1;
  const pf = (id >>> 16) & 0xff;
  const ps = (id >>> 8) & 0xff;
  const sa = id & 0xff;

  let pgn = (dp << 16) | (pf << 8);
  if (pf >= 240) pgn |= ps;

  return { priority, pgn, pf, ps, sa, dp };
}

function le(bytes: number[], start: number, length: number): number {
  let value = 0;
  for (let i = 0; i < length && start + i < bytes.length; i++) {
    value |= (bytes[start + i] & 0xff) << (i * 8);
  }
  return value >>> 0;
}

function isNotAvailable(raw: number, length: number): boolean {
  const max = length === 1 ? 0xff : 0xffff;
  return raw === max;
}

function signal(label: string, value: string, unit?: string): DecodedSignal {
  return { label, value, unit };
}

const FMI_DESCRIPTIONS: Record<number, string> = {
  0: 'Above normal (most severe)',
  1: 'Below normal (most severe)',
  2: 'Erratic or intermittent',
  3: 'Voltage above normal',
  4: 'Voltage below normal',
  5: 'Current below normal',
  6: 'Current above normal',
  9: 'Abnormal update rate',
  14: 'Special instructions',
};

type Decoder = {
  name: string;
  decode: (bytes: number[]) => DecodedSignal[];
  isFault?: boolean;
};

const PGN_DECODERS: Record<number, Decoder> = {
  // EEC1 - Electronic Engine Controller 1 (engine speed at byte 3, LE 2 bytes, 0.125 rpm)
  0xf004: {
    name: 'EEC1 - Electronic Engine Controller 1',
    decode: (b) => {
      const raw = le(b, 3, 2);
      if (isNotAvailable(raw, 2)) return [signal('Engine Speed', 'N/A')];
      return [signal('Engine Speed', (raw * 0.125).toFixed(1), 'rpm')];
    },
  },
  // ET1 - Engine Temperature 1 (coolant temp byte 0, 1 byte, 1 °C/bit, -40 offset)
  0xfeee: {
    name: 'ET1 - Engine Temperature 1',
    decode: (b) => {
      const raw = b[0] ?? 0xff;
      if (isNotAvailable(raw, 1)) return [signal('Coolant Temperature', 'N/A')];
      return [signal('Coolant Temperature', String(raw - 40), '°C')];
    },
  },
  // AMB - Ambient Conditions (barometric pressure byte 0, 0.5 kPa/bit)
  0xfef5: {
    name: 'AMB - Ambient Conditions',
    decode: (b) => {
      const raw = b[0] ?? 0xff;
      if (isNotAvailable(raw, 1)) return [signal('Barometric Pressure', 'N/A')];
      return [signal('Barometric Pressure', (raw * 0.5).toFixed(1), 'kPa')];
    },
  },
  // ETC1 - Electronic Transmission Controller 1
  0xf000: {
    name: 'ETC1 - Electronic Transmission Controller 1',
    decode: (b) => [signal('Output Shaft Speed', String(le(b, 1, 2)), 'raw')],
  },
  // DM1 - Active Diagnostic Trouble Codes
  0xfeca: {
    name: 'DM1 - Active Diagnostic Trouble Codes',
    isFault: true,
    decode: (b) => {
      const lamp = b[0] ?? 0;
      const spn = (b[2] ?? 0) | ((b[3] ?? 0) << 8) | (((b[4] ?? 0) & 0xe0) << 11);
      const fmi = (b[4] ?? 0) & 0x1f;
      const count = (b[5] ?? 0) & 0x7f;
      return [
        signal('MIL/Lamp Status', `0x${lamp.toString(16).padStart(2, '0')}`),
        signal('SPN', String(spn)),
        signal('FMI', `${fmi} - ${FMI_DESCRIPTIONS[fmi] ?? 'see J1939-73'}`),
        signal('Occurrence Count', String(count)),
      ];
    },
  },
};

const PGN_NAMES: Record<number, string> = {
  0xf004: 'EEC1',
  0xfeee: 'ET1',
  0xfef5: 'AMB',
  0xf000: 'ETC1',
  0xfeca: 'DM1',
};

export function decodeFrame(frame: TraceFrame): DecodedFrame {
  const id = parseInt(frame.id, 16) >>> 0;
  const parsed = parseId(id);
  const decoder = PGN_DECODERS[parsed.pgn];
  const name =
    decoder?.name ?? PGN_NAMES[parsed.pgn] ?? `PGN 0x${parsed.pgn.toString(16).toUpperCase()}`;
  const signals = decoder ? decoder.decode(frame.data) : [];

  return {
    timestampMs: frame.timestampMs,
    rawId: frame.id,
    priority: parsed.priority,
    pgn: parsed.pgn,
    pgnHex: `0x${parsed.pgn.toString(16).toUpperCase().padStart(4, '0')}`,
    sourceAddress: parsed.sa,
    name,
    signals,
    isFault: decoder?.isFault ?? false,
  };
}

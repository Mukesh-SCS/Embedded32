import { processBamFrame, createBamState, type BamState } from './bam';
import type { DecodedFrame, DecodedSignal, TraceFrame } from './types';

/**
 * Browser-safe J1939 decoder - a teaching subset. NOT a complete J1939 implementation.
 */

export type ParsedId = {
  priority: number;
  pgn: number;
  pf: number;
  ps: number;
  sa: number;
  dp: number;
  destinationAddress: number;
  isBroadcast: boolean;
};

const ECU_NAMES: Record<number, string> = {
  0x00: 'Engine ECU',
  0x03: 'Transmission ECU',
  0x17: 'Dashboard ECU',
  0xfa: 'Diagnostic Tool',
  0xff: 'Global / Broadcast',
};

let bamState: BamState = createBamState();

export function resetBamState(): void {
  bamState = createBamState();
}

export function getBamState(): BamState {
  return bamState;
}

export function parseId(id: number): ParsedId {
  const priority = (id >>> 26) & 0x7;
  const dp = (id >>> 24) & 0x1;
  const pf = (id >>> 16) & 0xff;
  const ps = (id >>> 8) & 0xff;
  const sa = id & 0xff;

  let pgn = (dp << 16) | (pf << 8);
  const isPdu1 = pf < 240;
  if (!isPdu1) pgn |= ps;

  const destinationAddress = isPdu1 ? ps : 255;
  const isBroadcast = !isPdu1 || ps === 255;

  return { priority, pgn, pf, ps, sa, dp, destinationAddress, isBroadcast };
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

const LAMP_BITS: Record<number, string> = {
  0: 'Off',
  1: 'On',
  2: 'Slow flash',
  3: 'Fast flash',
};

function decodeLampStatus(byte: number): string {
  const mil = (byte >> 6) & 0x3;
  const rsl = (byte >> 4) & 0x3;
  const awl = (byte >> 2) & 0x3;
  const pl = byte & 0x3;
  return `MIL=${LAMP_BITS[mil] ?? mil}, RSL=${LAMP_BITS[rsl] ?? rsl}, AWL=${LAMP_BITS[awl] ?? awl}, PL=${LAMP_BITS[pl] ?? pl}`;
}

function decodeDtc(bytes: number[], offset: number): DecodedSignal[] {
  if (offset + 4 > bytes.length) return [];
  const lamp = bytes[offset] ?? 0;
  const spn = (bytes[offset + 2] ?? 0) | ((bytes[offset + 3] ?? 0) << 8) | (((bytes[offset + 4] ?? 0) & 0xe0) << 11);
  const fmi = (bytes[offset + 4] ?? 0) & 0x1f;
  const count = (bytes[offset + 5] ?? 0) & 0x7f;
  return [
    signal('Lamp Status', decodeLampStatus(lamp)),
    signal('SPN', String(spn)),
    signal('FMI', `${fmi} - ${FMI_DESCRIPTIONS[fmi] ?? 'see J1939-73'}`),
    signal('Occurrence Count', String(count)),
  ];
}

type Decoder = {
  name: string;
  decode: (bytes: number[], parsed: ParsedId) => DecodedSignal[];
  isFault?: boolean;
  explain?: (bytes: number[], parsed: ParsedId, signals: DecodedSignal[]) => string;
};

const PGN_DECODERS: Record<number, Decoder> = {
  0xf004: {
    name: 'EEC1 - Electronic Engine Controller 1',
    decode: (b) => {
      const raw = le(b, 3, 2);
      if (isNotAvailable(raw, 2)) return [signal('Engine Speed', 'N/A')];
      return [signal('Engine Speed', (raw * 0.125).toFixed(1), 'rpm')];
    },
    explain: (_, __, sigs) =>
      `Engine ECU reports crankshaft speed at ${sigs.find((s) => s.label === 'Engine Speed')?.value ?? '?'} rpm.`,
  },
  0xfeee: {
    name: 'ET1 - Engine Temperature 1',
    decode: (b) => {
      const raw = b[0] ?? 0xff;
      if (isNotAvailable(raw, 1)) return [signal('Coolant Temperature', 'N/A')];
      return [signal('Coolant Temperature', String(raw - 40), '°C')];
    },
    explain: (_, __, sigs) =>
      `Coolant temperature is ${sigs.find((s) => s.label === 'Coolant Temperature')?.value ?? '?'} °C.`,
  },
  0xfef5: {
    name: 'AMB - Ambient Conditions',
    decode: (b) => {
      const raw = b[0] ?? 0xff;
      if (isNotAvailable(raw, 1)) return [signal('Barometric Pressure', 'N/A')];
      return [signal('Barometric Pressure', (raw * 0.5).toFixed(1), 'kPa')];
    },
  },
  0xf000: {
    name: 'ETC1 - Electronic Transmission Controller 1',
    decode: (b) => {
      const raw = le(b, 1, 2);
      if (isNotAvailable(raw, 2)) return [signal('Output Shaft Speed', 'N/A')];
      return [signal('Output Shaft Speed', (raw * 0.125).toFixed(1), 'rpm')];
    },
  },
  0xfef1: {
    name: 'CCVS1 - Cruise Control/Vehicle Speed',
    decode: (b) => {
      const raw = le(b, 1, 2);
      if (isNotAvailable(raw, 2)) return [signal('Vehicle Speed', 'N/A')];
      return [signal('Vehicle Speed', (raw / 256).toFixed(2), 'km/h')];
    },
    explain: (_, __, sigs) =>
      `Vehicle speed reported as ${sigs.find((s) => s.label === 'Vehicle Speed')?.value ?? '?'} km/h.`,
  },
  0xfeca: {
    name: 'DM1 - Active Diagnostic Trouble Codes',
    isFault: true,
    decode: (b) => {
      const signals: DecodedSignal[] = [];
      for (let i = 0; i < b.length; i += 4) {
        const dtc = decodeDtc(b, i);
        if (dtc.length === 0) break;
        const idx = i / 4 + 1;
        for (const s of dtc) {
          signals.push(signal(`DTC ${idx}: ${s.label}`, s.value, s.unit));
        }
        if (b[i + 2] === 0 && b[i + 3] === 0 && b[i + 4] === 0) break;
      }
      if (signals.length === 0 && b.length >= 6) {
        return decodeDtc(b, 0).map((s) => signal(s.label, s.value, s.unit));
      }
      return signals;
    },
    explain: () =>
      'Active diagnostic trouble codes (DM1) indicate one or more faults the ECU has detected.',
  },
  0xee00: {
    name: 'Address Claimed (PGN 60928)',
    decode: (b) => {
      const name = b.map((x) => x.toString(16).padStart(2, '0')).join(' ');
      const identity = le(b, 0, 4);
      return [
        signal('NAME (8 bytes)', name),
        signal('Identity Number', String(identity & 0xfffff)),
        signal('Manufacturer Code', String((identity >>> 21) & 0x7ff)),
      ];
    },
    explain: () =>
      'Address Claimed announces a device NAME on the bus. Two devices claiming the same source address must arbitrate by NAME priority.',
  },
  0xec00: {
    name: 'TP.CM - Connection Management',
    decode: (b) => {
      const ctrl = b[0] ?? 0;
      if (ctrl === 32) {
        return [
          signal('Control', 'BAM (32)'),
          signal('Total Bytes', String(b[1] | (b[2] << 8))),
          signal('Packet Count', String(b[3] ?? 0)),
          signal('Transported PGN', `0x${((b[5] ?? 0) | ((b[6] ?? 0) << 8)).toString(16).toUpperCase()}`),
        ];
      }
      return [signal('Control', String(ctrl))];
    },
    explain: () => 'Transport Protocol Connection Management announces a multi-packet transfer.',
  },
  0xeb00: {
    name: 'TP.DT - Data Transfer',
    decode: (b) => [
      signal('Sequence', String(b[0] ?? 0)),
      signal('Data', b.slice(1).map((x) => x.toString(16).padStart(2, '0')).join(' ')),
    ],
    explain: () => 'Transport Protocol Data Transfer carries one sequence of a multi-packet message.',
  },
};

const PGN_NAMES: Record<number, string> = {
  0xf004: 'EEC1',
  0xfeee: 'ET1',
  0xfef5: 'AMB',
  0xf000: 'ETC1',
  0xfef1: 'CCVS1',
  0xfeca: 'DM1',
  0xee00: 'Address Claimed',
  0xec00: 'TP.CM',
  0xeb00: 'TP.DT',
};

export function decodeFrame(frame: TraceFrame): DecodedFrame {
  const id = parseInt(frame.id, 16) >>> 0;
  const parsed = parseId(id);
  const decoder = PGN_DECODERS[parsed.pgn];
  const name =
    decoder?.name ?? PGN_NAMES[parsed.pgn] ?? `PGN 0x${parsed.pgn.toString(16).toUpperCase()}`;
  const signals = decoder ? decoder.decode(frame.data, parsed) : [];

  if (parsed.pgn === 0xec00 || parsed.pgn === 0xeb00) {
    bamState = processBamFrame(bamState, parsed.pgn, frame.data);
    if (bamState.status === 'complete') {
      signals.push(signal('BAM Status', 'Complete'));
      signals.push(signal('Assembled Bytes', String(bamState.assembledPayload.length)));
    } else if (bamState.status === 'announced') {
      signals.push(signal('BAM Progress', `${bamState.completionPercent}%`));
    } else if (bamState.status === 'error') {
      signals.push(signal('BAM Error', bamState.errors.join('; ')));
    }
  }

  const ecuName = ECU_NAMES[parsed.sa] ?? `ECU 0x${parsed.sa.toString(16).padStart(2, '0')}`;
  const explanation =
    decoder?.explain?.(frame.data, parsed, signals) ??
    (decoder
      ? `Known ${name} message from ${ecuName}.`
      : `Unknown PGN 0x${parsed.pgn.toString(16).toUpperCase()} from source address 0x${parsed.sa.toString(16).padStart(2, '0')}.`);

  return {
    timestampMs: frame.timestampMs,
    rawId: frame.id,
    priority: parsed.priority,
    dataPage: parsed.dp,
    pf: parsed.pf,
    ps: parsed.ps,
    pgn: parsed.pgn,
    pgnHex: `0x${parsed.pgn.toString(16).toUpperCase().padStart(4, '0')}`,
    sourceAddress: parsed.sa,
    destinationAddress: parsed.destinationAddress,
    isBroadcast: parsed.isBroadcast,
    frameFormat: frame.extended === false ? 'standard' : 'extended',
    rawDataHex: frame.data.map((b) => b.toString(16).padStart(2, '0')).join(' '),
    ecuName,
    name,
    signals,
    isFault: decoder?.isFault ?? false,
    isKnown: Boolean(decoder),
    explanation,
  };
}

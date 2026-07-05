/**
 * Teaching-only BAM (Broadcast Announce Message) reassembler.
 * NOT a production J1939 transport-protocol implementation.
 */

export type BamStatus = 'idle' | 'announced' | 'complete' | 'error';

export type BamState = {
  status: BamStatus;
  totalBytes: number;
  packetCount: number;
  transportedPgn: number;
  receivedPackets: Map<number, number[]>;
  assembledPayload: number[];
  errors: string[];
  completionPercent: number;
};

export function createBamState(): BamState {
  return {
    status: 'idle',
    totalBytes: 0,
    packetCount: 0,
    transportedPgn: 0,
    receivedPackets: new Map(),
    assembledPayload: [],
    errors: [],
    completionPercent: 0,
  };
}

/** PGN 60416 = TP.CM, control byte 32 = BAM */
export function isTpCmBam(pgn: number, data: number[]): boolean {
  return pgn === 0xec00 && data[0] === 32;
}

/** PGN 60160 = TP.DT */
export function isTpDt(pgn: number): boolean {
  return pgn === 0xeb00;
}

export function processBamFrame(state: BamState, pgn: number, data: number[]): BamState {
  const next = { ...state, receivedPackets: new Map(state.receivedPackets), errors: [...state.errors] };

  if (isTpCmBam(pgn, data)) {
    next.status = 'announced';
    next.totalBytes = data[1] | (data[2] << 8);
    next.packetCount = data[3];
    next.transportedPgn = data[5] | (data[6] << 8) | ((data[7] & 0xff) << 16);
    next.receivedPackets.clear();
    next.assembledPayload = [];
    next.errors = [];
    next.completionPercent = 0;
    return next;
  }

  if (next.status === 'idle' || !isTpDt(pgn)) {
    return next;
  }

  const seq = data[0];
  const payload = data.slice(1);

  if (next.receivedPackets.has(seq)) {
    next.errors.push(`Duplicate TP.DT sequence ${seq}`);
    next.status = 'error';
    return next;
  }

  next.receivedPackets.set(seq, payload);
  const received = next.receivedPackets.size;

  if (received > next.packetCount) {
    next.errors.push(`More packets than announced (${received} > ${next.packetCount})`);
    next.status = 'error';
    return next;
  }

  next.completionPercent = Math.round((received / Math.max(1, next.packetCount)) * 100);

  if (received === next.packetCount) {
    const assembled: number[] = [];
    for (let i = 1; i <= next.packetCount; i++) {
      const chunk = next.receivedPackets.get(i);
      if (!chunk) {
        next.errors.push(`Missing TP.DT sequence ${i}`);
        next.status = 'error';
        return next;
      }
      assembled.push(...chunk);
    }
    next.assembledPayload = assembled.slice(0, next.totalBytes);
    next.status = 'complete';
    next.completionPercent = 100;
  } else {
    next.status = 'announced';
  }

  return next;
}

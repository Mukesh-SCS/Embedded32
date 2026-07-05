import { describe, it, expect, beforeEach } from '@jest/globals';
import type { CANFrame } from '@embedded32/can';
import { J1939PortImpl } from '../src/ports/J1939PortImpl.js';
import { buildJ1939Id } from '../src/id/J1939Id.js';
import { PGN, TP_CM } from '../src/interfaces/J1939Port.js';

class MockCANPort {
  private callbacks: Array<(frame: CANFrame) => void> = [];
  sent: CANFrame[] = [];

  async send(frame: CANFrame): Promise<void> {
    this.sent.push(frame);
    for (const cb of this.callbacks) cb(frame);
  }

  onFrame(callback: (frame: CANFrame) => void): void {
    this.callbacks.push(callback);
  }

  setFilters(): void {}
  getInterface(): string {
    return 'mock0';
  }
  isConnected(): boolean {
    return true;
  }
  close(): void {}
}

function receive(port: MockCANPort, pgn: number, sa: number, data: number[]) {
  const id = buildJ1939Id({ pgn, sa, priority: 6 });
  return port.send({ id, data, extended: true, timestamp: Date.now() });
}

describe('J1939PortImpl', () => {
  let can: MockCANPort;
  let j1939: J1939PortImpl;

  beforeEach(() => {
    can = new MockCANPort();
    j1939 = new J1939PortImpl(can as never, 0x0e);
  });

  it('sends single-frame PGN messages', async () => {
    await j1939.sendPGN(0xf004, [0, 0, 0, 0x10, 0x00]);
    expect(can.sent.length).toBe(1);
    expect(can.sent[0].data.length).toBe(8);
  });

  it('rejects oversized multi-packet payloads', async () => {
    const huge = new Array(2000).fill(0);
    await expect(j1939.sendPGN(0xf000, huge)).rejects.toThrow(/too large/i);
  });

  it('delivers received PGNs to registered callbacks', async () => {
    const received: number[] = [];
    j1939.onPGN(0xf004, (msg) => received.push(msg.pgn));
    await receive(can, 0xf004, 0x01, [1, 2, 3, 4, 5, 6, 7, 8]);
    expect(received).toEqual([0xf004]);
  });

  it('supports wildcard PGN callbacks', () => {
    const all: number[] = [];
    j1939.onPGN('*', (msg) => all.push(msg.pgn));
    receive(can, 0xfeee, 0x02, [0x40]);
    expect(all).toEqual([0xfeee]);
  });

  it('removes callbacks with offPGN', () => {
    const hits: number[] = [];
    const cb = (msg: { pgn: number }) => hits.push(msg.pgn);
    j1939.onPGN(0xf004, cb);
    j1939.offPGN(0xf004, cb);
    receive(can, 0xf004, 0x01, [1]);
    expect(hits).toHaveLength(0);
  });

  it('emits request events for Request PGN frames', () => {
    const requests: number[] = [];
    j1939.on('request', (pgn: number) => requests.push(pgn));
    receive(can, PGN.REQUEST, 0x03, [0x04, 0xf0, 0x00]);
    expect(requests[0]).toBe(0xf004);
  });

  it('reassembles BAM multi-packet messages', () => {
    const done: number[][] = [];
    j1939.onPGN(0x00fef1, (msg) => done.push(msg.data));

    const sa = 0x05;
    receive(can, PGN.TP_CM, sa, [
      TP_CM.BAM,
      10,
      0,
      2,
      0xff,
      0xf1,
      0xfe,
      0x00,
    ]);

    receive(can, PGN.TP_DT, sa, [1, 1, 2, 3, 4, 5, 6, 7]);
    receive(can, PGN.TP_DT, sa, [2, 8, 9, 10, 0xff, 0xff, 0xff, 0xff]);

    expect(done[0]?.slice(0, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('cleans up expired transport sessions', () => {
    receive(can, PGN.TP_CM, 0x07, [TP_CM.BAM, 8, 0, 1, 0xff, 0xaa, 0xbb, 0x00]);
    const sessions = (j1939 as unknown as { tpSessions: Map<string, unknown> }).tpSessions;
    for (const session of sessions.values()) {
      (session as { startTime: number }).startTime = Date.now() - 5000;
    }
    j1939.cleanupSessions();
    expect(sessions.size).toBe(0);
  });

  it('updates source address and clamps priority', () => {
    j1939.setSourceAddress(0x22);
    j1939.setPriority(99);
    expect(j1939.getSourceAddress()).toBe(0x22);
    expect(j1939.getPriority()).toBe(7);
  });

  it('propagates callback errors via error event', () => {
    const errors: unknown[] = [];
    j1939.on('error', (err) => errors.push(err));
    j1939.onPGN(0xf004, () => {
      throw new Error('cb fail');
    });
    receive(can, 0xf004, 0x01, [1]);
    expect(errors[0]).toBeInstanceOf(Error);
  });
});

describe('PGN database helpers', () => {
  it('formats known and unknown PGN metadata', async () => {
    const { getPGNInfo, formatPGN, getAllPGNs, formatJ1939Message, decodeJ1939 } = await import(
      '../src/index.js'
    );
    expect(getPGNInfo(0xf004)?.name).toBeTruthy();
    expect(formatPGN(0xf004)).toMatch(/F004/i);
    expect(getAllPGNs().length).toBeGreaterThan(0);

    const frame = { id: buildJ1939Id({ pgn: 0xf004, sa: 0x01 }), data: [1, 2], extended: true };
    const decoded = decodeJ1939(frame);
    expect(formatJ1939Message(decoded)).toContain('SA=0x01');
  });
});

describe('AddressClaimManager', () => {
  it('tracks claimed device addresses', async () => {
    const { AddressClaimManager } = await import('../src/index.js');
    const ac = new AddressClaimManager();
    ac.claimAddress({
      sourceAddress: 0x0e,
      industryGroup: 0,
      deviceClass: 0,
      deviceInstance: 0,
      systemInstance: 0,
      manufacturerCode: 0,
      identityNumber: 1,
    });
    expect(ac.getDevice(0x0e)?.identityNumber).toBe(1);
    expect(ac.getAllAddresses()).toContain(0x0e);
  });
});

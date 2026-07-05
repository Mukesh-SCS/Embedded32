import { describe, it, expect, jest } from '@jest/globals';
import { J1939CANBinding } from '../src/gateway/J1939CANBinding.js';
import { buildJ1939Id } from '../src/id/J1939Id.js';

describe('J1939CANBinding', () => {
  it('publishes decoded RX frames and sends TX payloads', () => {
    const published: unknown[] = [];
    const sent: unknown[] = [];
    const bus = {
      publish: jest.fn((topic: string, msg: unknown) => published.push({ topic, msg })),
      subscribe: jest.fn((topic: string, cb: (msg: unknown) => void) => {
        if (topic === 'j1939.tx') {
          (bus as { txCb?: (msg: unknown) => void }).txCb = cb;
        }
      }),
    };
    const can = {
      onMessage: jest.fn((cb: (frame: unknown) => void) => {
        (can as { rxCb?: (frame: unknown) => void }).rxCb = cb;
      }),
      send: jest.fn((frame: unknown) => sent.push(frame)),
    };

    const binding = new J1939CANBinding(can as never, bus);
    binding.start();

    const frame = {
      id: buildJ1939Id({ pgn: 0xf004, sa: 0x0e }),
      data: [0, 0, 0, 0x10, 0x00, 0xff, 0xff, 0xff],
      extended: true,
    };
    (can as { rxCb?: (f: unknown) => void }).rxCb?.(frame);
    expect(published[0]).toMatchObject({ topic: 'j1939.rx' });

    (bus as { txCb?: (msg: unknown) => void }).txCb?.({
      payload: { pgn: 0xf004, sa: 0x0e, data: [1, 2, 3] },
    });
    expect(sent.length).toBe(1);
  });

  it('ignores invalid TX payloads', () => {
    const bus = {
      publish: jest.fn(),
      subscribe: jest.fn((_topic: string, cb: (msg: unknown) => void) => {
        cb({ payload: { pgn: 'bad' } });
      }),
    };
    const can = { onMessage: jest.fn(), send: jest.fn() };
    const binding = new J1939CANBinding(can as never, bus);
    binding.start();
    expect(can.send).not.toHaveBeenCalled();
  });
});

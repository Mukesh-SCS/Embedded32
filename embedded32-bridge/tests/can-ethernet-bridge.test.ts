import { EventEmitter } from 'events';
import { jest } from '@jest/globals';
import { buildJ1939Id } from '../../embedded32-j1939/src/id/J1939Id.js';
import { CanEthernetBridge } from '../src/can-ethernet.js';

class MockCanBus extends EventEmitter {
  emitFrame(id: number, data: number[]) {
    this.emit('message', { id, data, extended: true });
  }
}

describe('CanEthernetBridge integration', () => {
  it('forwards allowed PGNs to ethernet broadcast once', async () => {
    const bus = new MockCanBus();
    const bridge = new CanEthernetBridge(bus);
    const broadcasts: unknown[] = [];
    const eth = { broadcast: jest.fn(async (msg: unknown) => broadcasts.push(msg)) };

    bridge.addRule({ enabled: true, direction: 'can-to-eth', pgn: 0xf004 });
    await bridge.start(eth);

    bus.emitFrame(buildJ1939Id({ pgn: 0xf004, sa: 0x0e }), [0, 0, 0, 0x10, 0x00]);
    bus.emitFrame(buildJ1939Id({ pgn: 0xfeee, sa: 0x0e }), [0x50]);
    await new Promise((r) => setTimeout(r, 20));

    expect(eth.broadcast).toHaveBeenCalledTimes(1);
    expect(broadcasts[0]).toMatchObject({ pgn: 0xf004, sa: 0x0e });
    expect(bridge.getStats().messagesOut).toBe(1);
    expect(bridge.getStats().filteredOut).toBe(0);
  });

  it('blocks messages that do not match any rule', async () => {
    const bus = new MockCanBus();
    const bridge = new CanEthernetBridge(bus);
    const eth = { broadcast: jest.fn() };

    bridge.addRule({ enabled: true, direction: 'can-to-eth', pgn: 0xfeca });
    await bridge.start(eth);

    bus.emitFrame(buildJ1939Id({ pgn: 0xf004, sa: 0x01 }), [1, 2, 3]);

    expect(eth.broadcast).not.toHaveBeenCalled();
    expect(bridge.getStats().messagesIn).toBe(1);
    expect(bridge.getStats().messagesOut).toBe(0);
  });

  it('sheds load when rate limit is exceeded', async () => {
    const bus = new MockCanBus();
    const bridge = new CanEthernetBridge(bus);
    const eth = { broadcast: jest.fn() };

    bridge.addRule({
      enabled: true,
      direction: 'can-to-eth',
      pgn: 0xf004,
      rateLimit: 1,
    });
    await bridge.start(eth);

    bus.emitFrame(buildJ1939Id({ pgn: 0xf004, sa: 0x01 }), [1]);
    bus.emitFrame(buildJ1939Id({ pgn: 0xf004, sa: 0x01 }), [2]);

    expect(eth.broadcast).toHaveBeenCalledTimes(1);
    expect(bridge.getStats().filteredOut).toBe(1);
  });

  it('applies transform before forwarding', async () => {
    const bus = new MockCanBus();
    const bridge = new CanEthernetBridge(bus);
    const eth = { broadcast: jest.fn() };

    bridge.addRule({
      enabled: true,
      direction: 'can-to-eth',
      pgn: 0xf004,
      transform: (data) => data.map((b: number) => b + 1),
    });
    await bridge.start(eth);

    bus.emitFrame(buildJ1939Id({ pgn: 0xf004, sa: 0x01 }), [1, 2, 3]);

    expect(eth.broadcast).toHaveBeenCalledWith(expect.objectContaining({ data: [2, 3, 4] }));
  });

  it('ignores eth-to-can rules for CAN ingress', async () => {
    const bus = new MockCanBus();
    const bridge = new CanEthernetBridge(bus);
    const eth = { broadcast: jest.fn() };

    bridge.addRule({ enabled: true, direction: 'eth-to-can', pgn: 0xf004 });
    await bridge.start(eth);

    bus.emitFrame(buildJ1939Id({ pgn: 0xf004, sa: 0x01 }), [1]);

    expect(eth.broadcast).not.toHaveBeenCalled();
  });

  it('counts transport failures without duplicate forwarding', async () => {
    const bus = new MockCanBus();
    const bridge = new CanEthernetBridge(bus);
    const eth = {
      broadcast: jest.fn(async () => {
        throw new Error('network down');
      }),
    };

    bridge.addRule({ enabled: true, direction: 'can-to-eth', pgn: 0xf004 });
    await bridge.start(eth);

    bus.emitFrame(buildJ1939Id({ pgn: 0xf004, sa: 0x01 }), [1]);
    await new Promise((r) => setTimeout(r, 10));

    expect(eth.broadcast).toHaveBeenCalledTimes(1);
    expect(bridge.getStats().errors).toBe(1);
    expect(bridge.getStats().messagesOut).toBe(0);
  });
});

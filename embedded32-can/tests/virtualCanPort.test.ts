import { VirtualCANPort } from '../src/ports/VirtualCANPort.js';
import type { CANFrame } from '../src/CANTypes.js';

describe('VirtualCANPort', () => {
  afterEach(() => {
    VirtualCANPort.clearAllBuses();
  });

  const frame = (partial: Partial<CANFrame> & Pick<CANFrame, 'id'>): CANFrame => ({
    data: [],
    extended: false,
    ...partial,
  });

  it('broadcasts standard frames between ports on the same bus', async () => {
    const tx = new VirtualCANPort('bus-a');
    const rx = new VirtualCANPort('bus-a');
    const received: CANFrame[] = [];
    rx.onFrame((f) => received.push(f));

    await tx.send(frame({ id: 0x123, data: [1, 2, 3], extended: false }));

    expect(received).toHaveLength(1);
    expect(received[0].id).toBe(0x123);
    expect(received[0].data).toEqual([1, 2, 3]);
    expect(received[0].extended).toBe(false);
    expect(received[0].timestamp).toBeDefined();

    tx.close();
    rx.close();
  });

  it('supports 29-bit extended identifiers at min and max', async () => {
    const port = new VirtualCANPort('ext-bus');
    const ids: number[] = [];
    port.onFrame((f) => ids.push(f.id));

    await port.send(frame({ id: 0x800, data: [0], extended: true }));
    await port.send(frame({ id: 0x1fffffff, data: [0xff], extended: true }));

    expect(ids).toEqual([0x800, 0x1fffffff]);
    port.close();
  });

  it('supports 11-bit standard identifiers at min and max', async () => {
    const port = new VirtualCANPort('std-bus');
    const ids: number[] = [];
    port.onFrame((f) => ids.push(f.id));

    await port.send(frame({ id: 0x0, data: [], extended: false }));
    await port.send(frame({ id: 0x7ff, data: [0xaa], extended: false }));

    expect(ids).toEqual([0x0, 0x7ff]);
    port.close();
  });

  it('accepts empty and maximum DLC payloads', async () => {
    const port = new VirtualCANPort('dlc-bus');
    const payloads: number[][] = [];
    port.onFrame((f) => payloads.push(f.data));

    await port.send(frame({ id: 0x10, data: [] }));
    await port.send(frame({ id: 0x11, data: [0, 1, 2, 3, 4, 5, 6, 7] }));

    expect(payloads[0]).toEqual([]);
    expect(payloads[1]).toHaveLength(8);
    port.close();
  });

  it('throws when sending on a closed port', async () => {
    const port = new VirtualCANPort('closed-bus');
    port.close();

    await expect(port.send(frame({ id: 0x1, data: [1] }))).rejects.toThrow(/not connected/);
  });

  it('applies ID/mask filters and extended flag', async () => {
    const port = new VirtualCANPort('filter-bus');
    const received: CANFrame[] = [];
    port.onFrame((f) => received.push(f));
    port.setFilters([{ id: 0x18f00400, mask: 0x1fffff00, extended: true }]);

    await port.send(frame({ id: 0x18f00401, data: [1], extended: true }));
    await port.send(frame({ id: 0x18feee01, data: [2], extended: true }));
    await port.send(frame({ id: 0x123, data: [3], extended: false }));

    expect(received).toHaveLength(1);
    expect(received[0].id).toBe(0x18f00401);
    port.close();
  });

  it('accepts all frames when filters are cleared', async () => {
    const port = new VirtualCANPort('clear-filter');
    port.setFilters([{ id: 0xff, mask: 0xff }]);
    port.setFilters([]);
    let count = 0;
    port.onFrame(() => {
      count += 1;
    });

    await port.send(frame({ id: 0x200, data: [1] }));
    expect(count).toBe(1);
    port.close();
  });

  it('propagates listener errors via error event', async () => {
    const port = new VirtualCANPort('err-bus');
    const errors: unknown[] = [];
    port.on('error', (err) => errors.push(err));
    port.onFrame(() => {
      throw new Error('listener failed');
    });

    await port.send(frame({ id: 0x50, data: [1] }));

    expect(errors[0]).toBeInstanceOf(Error);
    expect((errors[0] as Error).message).toBe('listener failed');
    port.close();
  });

  it('removes port from shared bus on close', async () => {
    const port = new VirtualCANPort('shared');
    expect(VirtualCANPort.getBusInfo('shared').portCount).toBe(1);
    port.close();
    expect(VirtualCANPort.getBusInfo('shared').portCount).toBe(0);
    expect(port.isConnected()).toBe(false);
  });

  it('isolates traffic on different interface names', async () => {
    const a = new VirtualCANPort('if-a');
    const b = new VirtualCANPort('if-b');
    let onACount = 0;
    let onBCount = 0;
    a.onFrame(() => {
      onACount += 1;
    });
    b.onFrame(() => {
      onBCount += 1;
    });

    await a.send(frame({ id: 0x1, data: [1] }));

    expect(onACount).toBe(1);
    expect(onBCount).toBe(0);
    a.close();
    b.close();
  });

  it('notifies multiple frame listeners', async () => {
    const port = new VirtualCANPort('multi-listener');
    let a = 0;
    let b = 0;
    port.onFrame(() => {
      a += 1;
    });
    port.onFrame(() => {
      b += 1;
    });

    await port.send(frame({ id: 0x99, data: [9] }));

    expect(a).toBe(1);
    expect(b).toBe(1);
    port.close();
  });

  it('emits frame events on EventEmitter interface', async () => {
    const port = new VirtualCANPort('emitter');
    const frames: CANFrame[] = [];
    port.on('frame', (f: CANFrame) => frames.push(f));

    await port.send(frame({ id: 0x42, data: [4, 2] }));

    expect(frames[0].id).toBe(0x42);
    port.close();
  });
});

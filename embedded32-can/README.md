# @embedded32/can

Driver-agnostic CAN frame I/O for Embedded32 - mock, virtual, and SocketCAN backends for labs and production prototyping on Linux.

## Installation

```bash
npm install @embedded32/can
```

## Minimum runnable example

Hardware-free (works on any OS):

```typescript
import { CANInterface, MockCANDriver } from '@embedded32/can';

const can = new CANInterface(new MockCANDriver());

can.onMessage((frame) => {
  console.log('RX', frame.id.toString(16), frame.data);
  can.close();
});

can.send({ id: 0x123, data: [1, 2, 3], extended: false });
```

From monorepo root: `npx tsx embedded32-can/examples/basic-mock.ts` (after `npm run build`).

## Public API overview

| Export                   | Role                                      |
| ------------------------ | ----------------------------------------- |
| `CANInterface`           | Send/receive wrapper around a driver      |
| `MockCANDriver`          | In-memory driver for tests and examples   |
| `SocketCANDriver`        | Linux SocketCAN (`vcan0`, `can0`)         |
| `VirtualCANPort`         | Connect multiple peers on one virtual bus |
| `ICANDriver`, `CANFrame` | Types for custom drivers                  |

J1939 parsing lives in `@embedded32/j1939`, not this package.

## Runtime requirements

- Node.js **18+**
- ESM (`import`) or bundler that resolves package `exports`

## Hardware requirements

| Mode           | Hardware                                                                     |
| -------------- | ---------------------------------------------------------------------------- |
| Mock / virtual | None                                                                         |
| SocketCAN      | Linux or WSL with `vcan`/`can` interface and optional `socketcan` npm module |

## Browser compatibility

**Node.js only.** CAN hardware is not available in normal browser environments. Use simulation packages or the [browser demo](../apps/demo/README.md) on the docs site.

## Common errors

| Error                                  | Fix                                                          |
| -------------------------------------- | ------------------------------------------------------------ |
| `Cannot find module '@embedded32/can'` | Run `npm run build` in monorepo or install published tarball |
| SocketCAN open fails                   | Create `vcan0` (`sudo ip link add dev vcan0 type vcan`)      |
| J1939 frames not decoded               | Use `extended: true` and decode with `@embedded32/j1939`     |

## Related packages

- `@embedded32/j1939` - parse and decode J1939 frames
- `@embedded32/sim` - multi-ECU simulation on a virtual bus
- `@embedded32/tools` - terminal monitor and simulate commands

## Version compatibility

Align all `@embedded32/*` dependencies to **1.0.0** when installing from npm. Monorepo clones use workspace linking automatically.

## License

MIT © Mukesh Mani Tripathi

# @embedded32/sim

Multi-ECU J1939 vehicle simulation for Embedded32 - engine, transmission, brakes, aftertreatment, and profile-based `SimulationRunner` for classroom labs.

## Installation

```bash
npm install @embedded32/sim @embedded32/can @embedded32/j1939 @embedded32/core
```

## Minimum runnable example

**CLI (no code):** from monorepo root after `npm run build`:

```bash
npx embedded32-tools simulate vehicle/basic-truck
```

**Programmatic:**

```typescript
import { SimulationRunner } from '@embedded32/sim';

const runner = new SimulationRunner();
await runner.loadProfile('vehicle/basic-truck');
await runner.start();
// decoded traffic via tools or your CAN hooks
await runner.stop();
```

## Public API overview

| Export                                              | Role                                   |
| --------------------------------------------------- | -------------------------------------- |
| `SimulationRunner`                                  | Load profile, start/stop multi-ECU sim |
| `VehicleSimulator`                                  | Higher-level vehicle with scenarios    |
| `EngineSimulator`, `TransmissionSimulator`, …       | Individual ECU actors                  |
| `EngineECU`, `TransmissionECU`, `DiagnosticToolECU` | Profile-oriented ECU classes           |
| `DeterministicScheduler`                            | Repeatable tick timing for tests       |

## Runtime requirements

- Node.js **18+**
- Built dependencies: `@embedded32/can`, `@embedded32/j1939`, `@embedded32/core`

## Hardware requirements

**None** - simulation uses virtual/mock CAN. Optional SocketCAN only if you bridge sim output to `vcan0`.

## Browser compatibility

**Node.js only** in v1.0. Browser demo will use prerecorded traces (Phase 10).

## Common errors

| Error             | Fix                                                |
| ----------------- | -------------------------------------------------- |
| Profile not found | Use `vehicle/basic-truck` exactly                  |
| No traffic        | Ensure `runner.start()` and wait for tick interval |
| Import errors     | `npm run build` at monorepo root                   |

## Related packages

- `@embedded32/tools` - `embedded32-tools simulate` command
- `@embedded32/j1939` - decode simulated PGNs
- `@embedded32/can` - virtual bus attachment

## Version compatibility

Keep `@embedded32/sim@1.0.0` aligned with `j1939` and `can` **1.0.0**.

## License

MIT © Mukesh Mani Tripathi

# @embedded32/supervisor

Process-level supervisor for Embedded32 — registers modules, tracks health, coordinates startup/shutdown, and backs `@embedded32/cli start` / `demo`.

## Installation

```bash
npm install @embedded32/supervisor
```

## Minimum runnable example

```typescript
import { Supervisor } from '@embedded32/supervisor';

const supervisor = new Supervisor({
  logging: { level: 'info' },
});

supervisor.registerModule({
  id: 'hello',
  name: 'Hello Module',
  version: '1.0.0',
  start: async () => console.log('started'),
  stop: async () => console.log('stopped'),
  getStatus: () => ({ state: 'running', uptime: 0, restarts: 0 }),
});

await supervisor.start();
await supervisor.stop();
```

Easiest path for learners: `npx embedded32 demo` instead of wiring supervisor manually.

## Public API overview

| Export                     | Role                                        |
| -------------------------- | ------------------------------------------- |
| `Supervisor`               | Start/stop runtime, module registry         |
| `registerModule`           | Add modules with `start`/`stop`/`getStatus` |
| `getHealthStatus`          | Aggregate module health                     |
| `getEventBus`, `getLogger` | Shared runtime services                     |

## Runtime requirements

- Node.js **18+**
- Depends on `@embedded32/core`, `@embedded32/can`, `@embedded32/j1939`, `@embedded32/ethernet`, `@embedded32/bridge` at **1.0.0** for full stacks

## Hardware requirements

None for minimal supervisor example. Full fleet configs may enable SocketCAN modules.

## Browser compatibility

**Node.js only.**

## Common errors

| Error                 | Fix                                                    |
| --------------------- | ------------------------------------------------------ |
| Module stuck in ERROR | Check module `start()` throws; use `getHealthStatus()` |
| Double `start()`      | Guard with `isRunningFlag()` or CLI status             |
| Wrong package name    | Use `@embedded32/supervisor` scoped install            |

## Related packages

- `@embedded32/cli` — primary user entry
- `@embedded32/core` — runtime primitives inside modules
- `@embedded32/bridge` — optional bridge modules

## Version compatibility

`@embedded32/supervisor@1.0.0` matches CLI **1.0.0**.

## License

MIT © Mukesh Mani Tripathi

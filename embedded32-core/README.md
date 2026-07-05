# @embedded32/core

Lightweight embedded-style runtime for Embedded32: cooperative scheduler, in-process message bus, module base class, and configuration loading.

## Installation

```bash
npm install @embedded32/core
```

## Minimum runnable example

```typescript
import { Runtime, BaseModule } from '@embedded32/core';

class HelloModule extends BaseModule {
  onInit() {
    this.log('initialized');
  }
  onStart() {
    this.bus.subscribe('ping', () => this.log('pong'));
    this.bus.publish('ping', {});
  }
  onStop() {
    this.log('stopped');
  }
}

const runtime = new Runtime({ logLevel: 'info' });
runtime.registerModule(new HelloModule('hello'));
await runtime.start();
await runtime.stop();
```

See `embedded32-core/examples/basic-runtime.ts` in the monorepo.

## Public API overview

| Export           | Role                                                |
| ---------------- | --------------------------------------------------- |
| `Runtime`        | Orchestrates modules, scheduler, bus, logger        |
| `BaseModule`     | Author modules with `onInit` / `onStart` / `onStop` |
| `MessageBus`     | Topic pub/sub between modules                       |
| `Scheduler`      | `every`, `once`, `clear` timers                     |
| Built-in modules | Heartbeat, health, LED, CAN gateway helpers         |

## Runtime requirements

- Node.js **18+**
- CommonJS or ESM depending on consumer bundler (package builds to ESM `dist/`)

## Hardware requirements

None for core runtime alone. GPIO/LED modules need Raspberry Pi hardware when enabled.

## Browser compatibility

**Node.js focused.** Scheduler and message bus are not packaged for browser use in v1.0.

## Common errors

| Error                        | Fix                                           |
| ---------------------------- | --------------------------------------------- |
| Module never receives events | Call `runtime.start()` after `registerModule` |
| `subscribe` after stop       | Re-subscribe in `onStart`                     |
| Config file not found        | Pass valid `configPath` or omit for defaults  |

## Related packages

- `@embedded32/supervisor` — process-level module lifecycle
- `@embedded32/cli` — launch runtime from configuration
- `@embedded32/can` — CAN modules inside runtime apps
- `@embedded32/j1939` — protocol modules

## Version compatibility

`@embedded32/core@1.0.0` matches supervisor and CLI **1.0.0** in this release train.

## License

MIT © Mukesh Mani Tripathi

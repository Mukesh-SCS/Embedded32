# @embedded32/j1939

Educational SAE J1939 helpers for Embedded32: 29-bit ID parsing, a partial PGN catalog, message decoding, diagnostics subset, and CAN gateway bindings.

> **Scope:** This is a learning-oriented subset - not a complete or certified J1939 stack.

## Installation

```bash
npm install @embedded32/j1939 @embedded32/can
```

## Minimum runnable example

```typescript
import { parseJ1939Id, decodeJ1939, buildJ1939Id } from '@embedded32/j1939';

const parsed = parseJ1939Id(0x18f00401);
console.log(parsed.pgn, parsed.sa);

const msg = decodeJ1939({
  id: 0x18f00401,
  data: [0, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70],
  extended: true,
});
console.log(msg.name);

const id = buildJ1939Id({ priority: 6, pgn: 0xf004, sa: 0x00 });
```

Full walkthrough: [examples/j1939-basic.ts](../examples/j1939-basic.ts) - `npx tsx examples/j1939-basic.ts`

## Public API overview

| Export                              | Role                                             |
| ----------------------------------- | ------------------------------------------------ |
| `parseJ1939Id`, `buildJ1939Id`      | 29-bit identifier math                           |
| `decodeJ1939`, `formatJ1939Message` | Frame → structured message                       |
| `getPGNInfo`                        | Catalog metadata for known PGNs                  |
| `J1939TransportProtocol`            | Multi-packet subset (BAM/RTS - partial coverage) |
| `DiagnosticsManager`                | DM1/DM2-oriented helpers                         |
| `J1939CANBinding`                   | Connect CAN traffic to a runtime message bus     |
| `AddressClaimManager`               | Address-claim teaching utilities                 |

## Runtime requirements

- Node.js **18+**
- ESM imports
- `@embedded32/can` when using CAN bindings or examples with frames

## Hardware requirements

None for parse/decode examples. SocketCAN optional when using `J1939CANBinding` with real interfaces.

## Browser compatibility

Decode functions are pure TypeScript and may be bundled for browser demos. SocketCAN and Node-only bindings are not browser-compatible.

## Common errors

| Error                         | Fix                                                          |
| ----------------------------- | ------------------------------------------------------------ |
| `unknown PGN` / sparse decode | PGN not in catalog - check `getPGNInfo`                      |
| Wrong priority/SA             | Confirm hex ID (`0x18F00401`) and `extended: true` on frames |
| Import `J1939Id` namespace    | Use `parseJ1939Id` / `buildJ1939Id` functions instead        |

## Related packages

- `@embedded32/can` - frame transport
- `@embedded32/sim` - ECUs that emit J1939 traffic
- `@embedded32/tools` - `simulate` and `j1939 monitor` commands
- `@embedded32/sdk-js` - application-level J1939 client

## Version compatibility

Use `@embedded32/j1939@1.0.0` with matching `@embedded32/can@1.0.0`. Transport and diagnostics APIs may expand in minor releases without breaking parse/decode.

## License

MIT © Mukesh Mani Tripathi

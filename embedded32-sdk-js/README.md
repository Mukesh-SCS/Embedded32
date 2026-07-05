# @embedded32/sdk-js

Stable JavaScript/TypeScript J1939 client SDK for applications that subscribe to PGNs, request data, and send commands over configurable transports.

## Installation

```bash
npm install @embedded32/sdk-js @embedded32/j1939
```

## Minimum runnable example

```typescript
import { J1939Client, PGN, SA } from '@embedded32/sdk-js';

const client = new J1939Client({
  interface: 'virtual',
  sourceAddress: SA.DIAG_TOOL_2,
  transport: 'virtual',
});

await client.connect();

client.onPGN(PGN.EEC1, (msg) => {
  console.log('EEC1', msg.pgnName, msg.spns);
});

await client.disconnect();
```

See `embedded32-sdk-js/examples/basic-j1939.ts` in the monorepo.

## Public API overview

| Export                              | Role                                                      |
| ----------------------------------- | --------------------------------------------------------- |
| `J1939Client`                       | `connect`, `disconnect`, `onPGN`, `requestPGN`, `sendPGN` |
| `PGN`, `SA`                         | Common parameter group and source-address constants       |
| `J1939ClientConfig`, `J1939Message` | Public types                                              |

**Not public:** `@embedded32/sdk-js/internal` - may change without notice.

## Runtime requirements

- Node.js **18+**
- ESM
- Transport backend (`virtual`, `socketcan`, etc.) per config

## Hardware requirements

`virtual` transport needs no hardware. `socketcan` requires Linux CAN interface.

## Browser compatibility

Virtual transport and decode-only paths may be bundled for future browser demo (Phase 10). SocketCAN is not browser-available.

## Common errors

| Error                          | Fix                                  |
| ------------------------------ | ------------------------------------ |
| `connect()` fails on socketcan | Check interface name and permissions |
| Empty `spns` object            | PGN decoder may not cover all fields |
| Deep import from `/internal`   | Use documented public exports only   |

## Related packages

- `@embedded32/j1939` - protocol decoding layer
- `@embedded32/can` - CAN drivers for socketcan transport
- `@embedded32/bridge` - network-fed virtual transports (advanced)

## Version compatibility

Public SDK API marked stable at **v1.0.0**. Pin `@embedded32/sdk-js@1.0.0` with `@embedded32/j1939@1.0.0`.

## License

MIT © Mukesh Mani Tripathi

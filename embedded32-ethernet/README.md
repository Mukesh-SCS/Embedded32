# @embedded32/ethernet

UDP, TCP, and MQTT transports plus compact NanoProto encoding for moving J1939-shaped messages over IP in Embedded32 labs.

## Installation

```bash
npm install @embedded32/ethernet
```

## Minimum runnable example

```typescript
import { UDPServer, UDPClient } from '@embedded32/ethernet';

const server = new UDPServer(5000);
await server.start();

server.on('message', (msg) => console.log('UDP', msg));

const client = new UDPClient();
await client.send({ hello: 'embedded32' }, '127.0.0.1', 5000);
```

## Public API overview

| Export                               | Role                           |
| ------------------------------------ | ------------------------------ |
| `UDPServer`, `UDPClient`             | Datagram messaging             |
| `TCPServer`, `TCPClient`             | Stream connections             |
| `MQTTClient`                         | Pub/sub with reconnect helpers |
| `J1939NanoProto`, `NanoProtoEncoder` | Compact binary J1939 payloads  |

## Runtime requirements

- Node.js **18+**
- ESM imports
- Network permission for bind/connect operations

## Hardware requirements

None - uses host networking stack. MQTT labs need a broker (local or classroom server).

## Browser compatibility

**Node.js only** in v1.0. Browser clients may consume MQTT/WebSocket via other stacks; this package targets gateway hosts.

## Common errors

| Error               | Fix                                           |
| ------------------- | --------------------------------------------- |
| `EADDRINUSE`        | Pick a free port or stop prior server         |
| MQTT never connects | Verify broker URL, firewall, credentials      |
| Wrong package name  | Install `@embedded32/ethernet` scoped package |

## Related packages

- `@embedded32/bridge` - CAN ↔ MQTT/UDP routing
- `@embedded32/core` - runtime modules that publish telemetry
- `@embedded32/sdk-js` - application consumers

## Version compatibility

`@embedded32/ethernet@1.0.0` with `@embedded32/bridge@1.0.0`.

## License

MIT © Mukesh Mani Tripathi

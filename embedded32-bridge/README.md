# @embedded32/bridge

Route selected CAN/J1939 traffic to UDP, TCP, or MQTT using `@embedded32/ethernet` transports - gateway pattern for connected-vehicle labs.

## Installation

```bash
npm install @embedded32/bridge @embedded32/ethernet @embedded32/can @embedded32/j1939 @embedded32/core
```

## Minimum runnable example

Conceptual wiring (see package `examples/` and supervisor config for full setup):

```typescript
import { CanMqttBridge } from '@embedded32/bridge';
import { MQTTClient } from '@embedded32/ethernet';
import { CANInterface, MockCANDriver } from '@embedded32/can';

const can = new CANInterface(new MockCANDriver());
const mqtt = new MQTTClient({ broker: 'mqtt://localhost:1883' });

const bridge = new CanMqttBridge({
  canBus: can,
  mqtt,
  topicPrefix: 'classroom/bus1',
});

await bridge.start();
```

Requires a local MQTT broker for live forwarding.

## Public API overview

| Export                      | Role                                                 |
| --------------------------- | ---------------------------------------------------- |
| `CanEthernetBridge`         | CAN ↔ UDP/TCP forwarding with filters                |
| `CanMqttBridge`             | CAN ↔ MQTT topic mapping                             |
| `RuleEngine`                | Priority rules, PGN whitelist/blacklist, rate limits |
| `BridgeRule`, `RoutingRule` | Configuration types                                  |

## Runtime requirements

- Node.js **18+**
- ESM package
- `@embedded32/ethernet` for transports

## Hardware requirements

None when using `MockCANDriver`. Production gateways typically use Linux SocketCAN plus network access to MQTT/UDP peers.

## Browser compatibility

**Node.js only.** MQTT consumers may be browser apps, but this package runs on the gateway host.

## Common errors

| Error                   | Fix                                                 |
| ----------------------- | --------------------------------------------------- |
| MQTT connection refused | Start broker (`mosquitto`) or fix broker URL        |
| No forwarded messages   | Check PGN whitelist and `RuleEngine` default action |
| Wrong import path       | Use `@embedded32/bridge`, not legacy unscoped name  |

## Related packages

- `@embedded32/ethernet` - UDP, TCP, MQTT clients
- `@embedded32/j1939` - PGN-aware filtering
- `@embedded32/cli` - load bridge via supervisor config

## Version compatibility

`@embedded32/bridge@1.0.0` (ESM) must pair with `@embedded32/j1939@1.0.0` and `@embedded32/ethernet@1.0.0`.

## License

MIT © Mukesh Mani Tripathi

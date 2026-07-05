# Sample CAN/J1939 traces

Synthetic, royalty-free bus captures for classroom demos and the future browser playground (Phase 10).

## Format (`embedded32-trace-v1`)

```json
{
  "format": "embedded32-trace-v1",
  "source": "synthetic",
  "scenario": "normal-operation",
  "description": "Human-readable summary",
  "frames": [
    {
      "timestampMs": 0,
      "id": "0x18F00400",
      "extended": true,
      "data": [0, 0, 0, 125, 64, 31, 0, 0]
    }
  ]
}
```

| Field         | Type     | Notes                         |
| ------------- | -------- | ----------------------------- |
| `id`          | string   | Hex CAN ID                    |
| `extended`    | boolean  | `true` for J1939              |
| `data`        | number[] | 0–8 bytes                     |
| `timestampMs` | number   | Milliseconds from trace start |

## Files

| File                                                     | Scenario                            |
| -------------------------------------------------------- | ----------------------------------- |
| [normal-operation.json](./normal-operation.json)         | Steady EEC1 + ETC1 traffic          |
| [engine-overheat.json](./engine-overheat.json)           | High coolant + DM1 fault            |
| [sensor-failure.json](./sensor-failure.json)             | Implausible sensor spike            |
| [address-conflict.json](./address-conflict.json)         | Duplicate source address            |
| [high-bus-load.json](./high-bus-load.json)               | Dense frame schedule                |
| [multi-packet-message.json](./multi-packet-message.json) | TP.BAM-style sequence (educational) |

## Usage

Traces are **not** loaded automatically by labs - they support instructor demos and future `apps/demo` scenarios. Decode frames with:

```typescript
import { decodeJ1939 } from '@embedded32/j1939';
```

## Data policy

All payloads are generated for teaching. No proprietary vehicle logs or copyrighted PGN databases are included.

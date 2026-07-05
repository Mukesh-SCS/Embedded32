# Lab 3 instructor notes — Multi-ECU simulation

## Architecture on the whiteboard

```
EngineECU (SA 0x00) ──┐
                      ├── VirtualCANPort ("lab03-bus") ── monitor
TransmissionECU (0x03)┘
```

Each ECU needs its own `J1939PortImpl(bus, address)` before `bindJ1939Port`.

## Solution pattern

```typescript
const enginePort = new J1939PortImpl(bus, 0x00);
const engine = new EngineECU({ name: 'engine', address: 0x00, rateMs: 100 });
engine.bindJ1939Port(enginePort);
scheduler.register(engine);
scheduler.start();
```

## Timing

600 ms at 100 ms broadcast rate yields ~6 frames per ECU minimum — verifier requires `LAB03_FRAME_COUNT >= 8`.

## Common issues

| Issue               | Fix                                     |
| ------------------- | --------------------------------------- |
| `LAB03_ECU_COUNT=0` | Forgot `scheduler.start()`              |
| Only one PGN        | Only one ECU registered                 |
| Same SA twice       | Wrong address on second `J1939PortImpl` |

## Extension

Add `DiagnosticToolECU` at SA `249` and compare to `basic-truck` profile.

## Verification

```bash
npm run test:labs
```

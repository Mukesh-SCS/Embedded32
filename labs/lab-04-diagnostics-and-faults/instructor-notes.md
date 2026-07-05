# Lab 4 instructor notes — Diagnostics and fault injection

## Teaching narrative

1. Normal operation — EEC1 broadcasts coolant in ET1 PGN (Lab 3 context).
2. Fault condition — coolant above range → ECU sets MIL and emits DM1.
3. Diagnostic tool listens (future: `diag_tool` in `basic-truck` profile).

## Solution payload

```typescript
[0x04, 0x1a, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00];
```

- `0x04` — MIL bit set
- `0x1a` — SPN 26 LSB
- `0x20` — FMI 0, occurrence count 1

## Written answer key

- **Lamp:** Malfunction Indicator Lamp (MIL)
- **Parameter:** Engine Coolant Temperature (SPN 26)
- **FMI 0:** Data valid but above normal operating range
- **Affected ECU:** Engine at source address `0x00`

## Safety / honesty

Clarify that injecting faults in simulation is not equivalent to manipulating real vehicle emissions or safety systems.

## Verification

```bash
npm run test:labs
```

## Optional demo

Run `examples/j1939-diagnostics.ts` before students open the starter.

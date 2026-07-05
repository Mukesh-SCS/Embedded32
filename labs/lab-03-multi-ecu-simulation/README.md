# Lab 3 — Multi-ECU simulation

**Time:** 2 hours  
**Hardware:** None

## Learning objectives

- Connect multiple ECU simulators on one virtual CAN bus
- Observe distinct source addresses in J1939 traffic
- Identify engine (EEC1) and transmission (ETC1) broadcasts
- Use `DeterministicScheduler` for periodic ECU ticks

## Prerequisites

- Labs 1–2
- Read [ECU simulation concepts](../../docs/concepts/ecu-simulation.md)

## Tasks

1. Complete the TODOs in `starter/lab.ts` to wire engine and transmission ECUs.
2. Run for 600 ms and verify at least two source addresses appear.
3. Confirm EEC1 (`PGN.EEC1`) and ETC1 (`PGN.ETC1`) are both observed.
4. Write a short bus log excerpt (5 lines) identifying which ECU sent each PGN.

## Run

```bash
npx tsx labs/lab-03-multi-ecu-simulation/starter/lab.ts
```

## Alternative observation

Compare with the full profile runner:

```bash
npx embedded32-tools simulate vehicle/basic-truck
```

## Check your work

```bash
npm run test:labs
```

## Related documentation

- [Architecture — simulation flow](../../docs/architecture.md)
- `@embedded32/sim` README

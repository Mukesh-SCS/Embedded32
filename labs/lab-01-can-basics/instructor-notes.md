# Lab 1 instructor notes — CAN communication basics

## Setup (5 minutes)

1. Ensure students cloned the monorepo and ran `npm run build`.
2. No CAN hardware or Linux VM required.
3. Demo live: run `solution/lab.ts` and point at the single `MATCH` line.

## Teaching flow

| Segment | Topic                         | Tip                                          |
| ------- | ----------------------------- | -------------------------------------------- |
| 10 min  | Lecture: CAN frame fields     | Draw ID + 8 data bytes on board              |
| 15 min  | Walk through `starter/lab.ts` | Emphasize handler registration before `send` |
| 25 min  | Student implements filter     | Circulate — common bug is `===` vs hex typo  |
| 10 min  | Review + stretch goals        | Introduce `VirtualCANPort` for Lab 3 preview |

## Solution highlights

```typescript
function acceptFrame(frame: CANFrame): boolean {
  return frame.id === FILTER_ID;
}
```

`MockCANDriver` echoes each sent frame asynchronously (~10 ms). The starter includes `sleep` calls so handlers are ready.

## Verification

```bash
npm run test:labs
```

Expected markers in `expected-output/sample.txt`.

## FAQ

**Why only one frame matches?** Three IDs are sent; filter keeps `0x200`.

**Does this work on Windows?** Yes — mock driver is cross-platform.

**Relation to J1939?** J1939 uses extended 29-bit IDs; that is Lab 2.

## Assessment alignment

Maps to learning outcome: _interpret raw CAN traffic_ (see `docs/education/learning-outcomes.md`).

# Lab 2 - J1939 messaging

**Time:** 90 minutes  
**Hardware:** None

## Learning objectives

- Parse a 29-bit J1939 CAN identifier into priority, PGN, and source address
- Decode a catalog PGN payload to a human-readable name
- Build a J1939 ID from logical fields
- Explain PDU1 vs PDU2 at a conceptual level (see [J1939 concepts](../../docs/concepts/j1939.md))

## Prerequisites

- Lab 1 or equivalent CAN familiarity
- `npm run build` completed

## Tasks

1. Run the starter and observe parsed fields for ID `0x18F00400`.
2. Complete the `buildJ1939Id` TODO so `LAB02_BUILT_ID=0x18F00400`.
3. Answer in your lab report:
   - What is the PGN for EEC1?
   - Which ECU source address is in the sample frame?
   - Why must `extended: true` be set when decoding?

## Run

```bash
npx tsx labs/lab-02-j1939-messaging/starter/lab.ts
```

## Scope note

Embedded32 ships a **partial** PGN catalog suitable for education - not full SAE J1939-71 coverage.

## Check your work

```bash
npm run test:labs
```

## Related documentation

- [J1939 concepts](../../docs/concepts/j1939.md)
- [examples/j1939-basic.ts](../../examples/j1939-basic.ts)

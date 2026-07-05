# Lab 1 — CAN communication basics

**Time:** 60–90 minutes  
**Hardware:** None (uses `MockCANDriver`)

## Learning objectives

After completing this lab you will be able to:

- Describe CAN identifier and payload fields
- Send and receive classic CAN frames in TypeScript
- Apply a software acceptance filter by CAN ID
- Log matched frames for debugging

## Prerequisites

- Node.js 18+
- Completed [Getting started](../../docs/getting-started.md) or equivalent
- Repository built: `npm ci && npm run build`

## Tasks

1. Open `starter/lab.ts` and read the frame definitions.
2. Implement `acceptFrame()` so only ID `0x200` is logged.
3. Run your code:

   ```bash
   npx tsx labs/lab-01-can-basics/starter/lab.ts
   ```

4. Confirm output shows **one** `MATCH` line and `LAB01_MATCHED=1`.
5. (Optional) Change `FILTER_ID` and predict how many frames match before running.

## Concepts

| Term    | Meaning                                               |
| ------- | ----------------------------------------------------- |
| CAN ID  | 11-bit (standard) or 29-bit (extended) address        |
| DLC     | Data length — up to 8 bytes on classic CAN            |
| Payload | Data bytes carried in the frame                       |
| Filter  | Rule that selects which frames an application handles |

## Stretch goals

- Log extended frames (`extended: true`) separately.
- Add a mask filter (accept IDs `0x200`–`0x2FF`).
- Connect two `VirtualCANPort` peers on the same interface name.

## Check your work

Compare against `solution/lab.ts` or run the automated verifier:

```bash
npm run test:labs
```

## Related documentation

- [CAN concepts](../../docs/concepts/can.md)
- `@embedded32/can` README

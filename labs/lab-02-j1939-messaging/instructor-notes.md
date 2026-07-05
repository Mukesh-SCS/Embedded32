# Lab 2 instructor notes - J1939 messaging

## Key teaching points

- **0x18F00400** breaks down as priority 6, PGN `0xF004`, SA `0x00`.
- Students often confuse PF/PS with PGN - use the diagram in `docs/concepts/j1939.md`.
- `buildJ1939Id({ priority: 6, pgn: 0xf004, sa: 0x00 })` must match the sample parse.

## Demo script

```bash
npx tsx examples/j1939-basic.ts
npx tsx labs/lab-02-j1939-messaging/solution/lab.ts
```

## Common mistakes

| Mistake                   | Correction                           |
| ------------------------- | ------------------------------------ |
| Omitting `extended: true` | J1939 requires 29-bit IDs            |
| Using decimal ID in parse | Use hex literal `0x18f00400`         |
| Wrong SA in build         | Engine ECU in profile uses SA `0x00` |

## Verification

`npm run test:labs` - lab 02 section.

## Timeboxing

- 20 min lecture + diagram
- 40 min coding
- 20 min written questions
- 10 min review

Do **not** claim full SAE compliance - emphasize educational subset.

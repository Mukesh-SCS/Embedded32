# Browser educational demo

A **hardware-free, client-side** CAN/J1939 learning demo for the Embedded32 site. Everything runs in the browser - no server, WebSocket, SocketCAN, or MQTT.

## Capabilities

- **Playback:** play, pause, reset, restart, step forward/back, seek (frame + time), loop, configurable speed
- **Views:** ECU network, frame timeline, metrics, frame table (paginated), frame inspector, signal panel
- **Import/export:** validate and load JSON traces; export normalized trace, decoded JSON, and CSV (formula-safe)
- **Teaching decoders:** EEC1, ET1, AMB, ETC1, CCVS1, DM1, Address Claimed (PGN 60928), TP.CM, TP.DT
- **BAM reassembler:** limited teaching implementation (not production transport-protocol compliance)

## Supported PGNs (teaching subset)

| PGN    | Name            | Notes                    |
| ------ | --------------- | ------------------------ |
| 0xF004 | EEC1            | Engine speed             |
| 0xFEEE | ET1             | Coolant temperature      |
| 0xFEF5 | AMB             | Barometric pressure      |
| 0xF000 | ETC1            | Output shaft speed       |
| 0xFEF1 | CCVS1           | Vehicle speed            |
| 0xFECA | DM1             | Active DTCs, lamp status |
| 0xEE00 | Address Claimed | NAME arbitration         |
| 0xEC00 | TP.CM           | BAM announce             |
| 0xEB00 | TP.DT           | Data transfer            |

## Not supported

- Full J1939 PGN database
- RTS/CTS transport protocol
- Live SocketCAN or hardware buses
- Production-grade diagnostic compliance

## Source layout

| Path               | Purpose                              |
| ------------------ | ------------------------------------ |
| `src/normalize.ts` | CAN ID normalization (`0x` optional) |
| `src/export.ts`    | Import validation + CSV/JSON export  |
| `src/decoder.ts`   | Teaching J1939 decoders              |
| `src/bam.ts`       | BAM teaching reassembler             |
| `src/player.ts`    | Single-timer trace player            |
| `src/scenarios.ts` | Scenario metadata registry           |
| `src/traces.ts`    | Bundled synthetic traces             |

## Adding a scenario

1. Add JSON under `examples/traces/`
2. Run `node apps/demo/scripts/generate-traces.mjs`
3. Add metadata in `src/scenarios.ts`
4. Add tests in `tests/demo.test.ts`

## Adding a decoder

1. Register PGN in `src/decoder.ts` (`PGN_DECODERS`)
2. Add unit tests
3. Document in this README

## Testing

```bash
cd apps/demo && npx vitest run
```

From monorepo root: `npm run test:e2e` (includes demo UI under `/Embedded32/demo/`).

## Regenerating bundled traces

```bash
node apps/demo/scripts/generate-traces.mjs
```

# Browser educational demo

A **hardware-free, client-side** CAN/J1939 demo for the Embedded32 documentation site. Everything runs in the browser — no server, WebSocket, SocketCAN, or MQTT connection is required.

## What it does

- Plays synthetic J1939 bus traces (copied from [`examples/traces/`](../../examples/traces/))
- Decodes a **teaching subset** of J1939 messages entirely in the browser
- Shows a live frame log, decoded signals, and a simple bus-load indicator

## Scope and honesty

This is a **simulation for learning**, not a real bus connection:

- Decoding covers a small PGN/SPN subset (engine speed, coolant temp, vehicle speed, DM1 faults)
- Traces are synthetic and labeled `"source": "synthetic"`
- No live hardware, no network I/O, no secrets

## Source layout

| Path | Purpose |
|------|---------|
| `src/decoder.ts` | Browser-safe J1939 ID + SPN subset decoder |
| `src/player.ts` | Trace playback engine (timers, bus-load estimate) |
| `src/traces.ts` | Bundled synthetic traces (mirrors `examples/traces/`) |
| `src/types.ts` | Shared demo types |

## Usage

The demo is rendered by the documentation site at `/demo`. See
[`apps/site/src/app/demo`](../site/src/app/demo). The modules here are framework-agnostic
TypeScript and can also be imported into other browser hosts.

## Regenerating bundled traces

`src/traces.ts` mirrors the canonical traces in `examples/traces/`. If those change, update
this file to match so the static site build has no filesystem dependency at runtime.

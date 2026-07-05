# Package selection guide

Choose the smallest package set for your goal. All `@embedded32/*` packages are version `1.0.0` in this monorepo unless noted otherwise.

## Quick reference

| Goal                                         | Recommended package      | Required supporting packages                 | Works without hardware | Runtime        | Example                                                                                   |
| -------------------------------------------- | ------------------------ | -------------------------------------------- | ---------------------- | -------------- | ----------------------------------------------------------------------------------------- |
| Send/receive raw CAN frames (mock)           | `@embedded32/can`        | -                                            | Yes                    | Node.js 18+    | [embedded32-can/examples/basic-mock.ts](../embedded32-can/examples/basic-mock.ts)         |
| Parse/decode J1939 IDs and PGNs              | `@embedded32/j1939`      | `@embedded32/can`                            | Yes                    | Node.js 18+    | [examples/j1939-basic.ts](../examples/j1939-basic.ts)                                     |
| Simulate engine/transmission/diagnostic ECUs | `@embedded32/sim`        | `core`, `can`, `j1939`                       | Yes                    | Node.js 18+    | `npx embedded32-tools simulate vehicle/basic-truck`                                       |
| Monitor/decode traffic in terminal           | `@embedded32/tools`      | `sim`, `can`, `j1939`, `core`                | Yes                    | Node.js 18+    | `npx embedded32-tools --help`                                                             |
| Launch configured runtime / demo             | `@embedded32/cli`        | `supervisor`, `bridge`, `ethernet`, …        | Yes (demo mode)        | Node.js 18+    | `npx embedded32 demo`                                                                     |
| Lightweight scheduler + message bus app      | `@embedded32/core`       | `@embedded32/can`                            | Yes                    | Node.js 18+    | [embedded32-core/examples/basic-runtime.ts](../embedded32-core/examples/basic-runtime.ts) |
| Module lifecycle supervisor                  | `@embedded32/supervisor` | `core`, `can`, `j1939`, `ethernet`, `bridge` | Partial                | Node.js 18+    | Used by `@embedded32/cli`                                                                 |
| UDP/TCP/MQTT transports                      | `@embedded32/ethernet`   | `@embedded32/core`                           | Yes                    | Node.js 18+    | Package README                                                                            |
| Route CAN to network/MQTT                    | `@embedded32/bridge`     | `ethernet`, `j1939`, `can`, `core`           | Yes                    | Node.js 18+    | Package README                                                                            |
| Application SDK (virtual transport)          | `@embedded32/sdk-js`     | `@embedded32/j1939`                          | Yes                    | Node.js 18+    | [embedded32-sdk-js/examples/basic-j1939.ts](../embedded32-sdk-js/examples/basic-j1939.ts) |
| Linux SocketCAN on real bus                  | `@embedded32/can`        | optional `socketcan` npm module              | No                     | Linux / WSL    | [embedded32-can/examples/socketcan-demo.ts](../embedded32-can/examples/socketcan-demo.ts) |
| Python client (experimental)                 | `@embedded32/sdk-python` | -                                            | Partial                | Python 3.8+    | Private - not on npm yet                                                                  |
| C embedded client                            | `@embedded32/sdk-c`      | -                                            | Platform-specific      | C / Linux      | Private - not on npm yet                                                                  |
| React monitoring UI                          | `@embedded32/dashboard`  | -                                            | Yes (mock data)        | Browser + Vite | `cd embedded32-dashboard && npm run dev`                                                  |

## CLI naming

Two command-line packages are published:

| Command            | Package             | Purpose                                                        |
| ------------------ | ------------------- | -------------------------------------------------------------- |
| `embedded32`       | `@embedded32/cli`   | Runtime launcher: `demo`, `start`, `init`, `status`            |
| `embedded32-tools` | `@embedded32/tools` | Labs toolkit: `simulate`, `monitor`, `j1939 monitor`, `can up` |

Install globally only after packages are published to npm, or use `npx` from a built monorepo clone.

## Typical learning paths

### Path A - Protocol fundamentals (no hardware)

1. `@embedded32/can` - mock driver
2. `@embedded32/j1939` - parse and decode
3. `@embedded32/tools` - `simulate vehicle/basic-truck`

### Path B - Runtime and modules

1. `@embedded32/core` - scheduler and message bus
2. `@embedded32/supervisor` - module lifecycle
3. `@embedded32/cli` - `embedded32 demo`

### Path C - Connected systems

1. `@embedded32/j1939` + `@embedded32/can`
2. `@embedded32/ethernet` - MQTT/UDP
3. `@embedded32/bridge` - selective routing

## Version compatibility

- Monorepo packages use aligned version `1.0.0` internally.
- When installing from npm, use matching `1.0.0` versions for all `@embedded32/*` dependencies.
- `@embedded32/sdk-js` `/internal` export is not a stable public API.

## Related documentation

- [Getting started](./getting-started.md)
- [Architecture](./architecture.md)
- [Generated API reference](./api/) - run `npm run docs:api` from repository root

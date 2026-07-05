# @embedded32/tools

Command-line toolkit for CAN/J1939 monitoring, logging, and vehicle simulation - the `embedded32-tools` executable.

## Installation

```bash
npm install @embedded32/tools
```

From monorepo clone (development):

```bash
npm ci && npm run build
npx embedded32-tools --help
```

## Minimum runnable example

Hardware-free simulation (recommended first run):

```bash
npx embedded32-tools simulate vehicle/basic-truck
```

You should see decoded J1939 lines from engine, transmission, and diagnostic ECUs. Press `Ctrl+C` to stop.

## Public API overview

This package is primarily a **CLI**. The published entry is the `embedded32-tools` binary.

| Command              | Purpose                                  |
| -------------------- | ---------------------------------------- |
| `simulate <profile>` | Run profile (e.g. `vehicle/basic-truck`) |
| `monitor <iface>`    | Live CAN/J1939 decode                    |
| `log <iface>`        | Log frames to file                       |
| `can up <iface>`     | Create virtual CAN (Linux/WSL)           |
| `j1939 monitor`      | Legacy J1939 monitor                     |
| `can monitor`        | Raw CAN monitor                          |
| `ecu simulate`       | Legacy multi-ECU simulator               |

Run `embedded32-tools --help` for the full list.

## Runtime requirements

- Node.js **18+**
- Monorepo or installed tarball with compiled `dist/cli.js`

## Hardware requirements

| Command                  | Hardware                            |
| ------------------------ | ----------------------------------- |
| `simulate`               | None                                |
| `monitor vcan0` / `can0` | Linux SocketCAN interface           |
| `can up`                 | Linux/WSL with `ip link` privileges |

## Browser compatibility

**Not applicable** - terminal CLI only.

## Common errors

| Error                  | Fix                                                                     |
| ---------------------- | ----------------------------------------------------------------------- |
| `command not found`    | Use `npx embedded32-tools` or global install                            |
| Empty monitor on Linux | Start `simulate` in another terminal or check interface name            |
| Wrong command prefix   | Bin is `embedded32-tools`, not `embedded32` (that is `@embedded32/cli`) |

## Related packages

- `@embedded32/cli` - runtime launcher (`embedded32 demo`, `start`)
- `@embedded32/sim` - simulation engine used by `simulate`
- `@embedded32/can`, `@embedded32/j1939` - protocol stack

## Version compatibility

`@embedded32/tools@1.0.0` depends on pinned internal packages at **1.0.0**.

## License

MIT © Mukesh Mani Tripathi

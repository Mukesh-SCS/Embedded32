# @embedded32/cli

Command-line launcher for the Embedded32 supervisor-backed runtime - `embedded32` executable for demo, start, init, and status.

## Installation

```bash
npm install @embedded32/cli
```

Global install (after npm publish approval):

```bash
npm install -g @embedded32/cli
```

Monorepo development:

```bash
npm run build
npx embedded32 --help
```

## Minimum runnable example

Hardware-free demo:

```bash
npx embedded32 demo
```

Starts configured simulators and runtime modules. Press `Ctrl+C` for graceful shutdown.

## Public API overview

| Command                           | Purpose                     |
| --------------------------------- | --------------------------- |
| `embedded32 demo`                 | All-in-one teaching demo    |
| `embedded32 start [config]`       | Start from YAML/JSON config |
| `embedded32 init`                 | Write starter configuration |
| `embedded32 status`               | Inspect running runtime     |
| `embedded32 --help` / `--version` | Help and version            |

Programmatic import of `@embedded32/cli` is supported for embedding; most users invoke the bin only.

## Runtime requirements

- Node.js **18+**
- CommonJS bin entry (`embedded32`)
- Pulls `@embedded32/supervisor`, `@embedded32/core`, bridge, ethernet, sim, etc. at **1.0.0**

## Hardware requirements

`demo` mode runs without CAN hardware. `start` with SocketCAN config requires Linux `vcan0`/`can0` as configured.

## Browser compatibility

CLI is Node-only. Demo may print dashboard URL (`localhost:5173`) when dashboard is run separately - dashboard is a private package.

## Common errors

| Error                   | Fix                                               |
| ----------------------- | ------------------------------------------------- |
| Unknown command exits 1 | Run `embedded32 --help`                           |
| Config not found        | Run `embedded32 init` or pass valid path          |
| Confused with tools CLI | Use `embedded32-tools` for `simulate` / `monitor` |

## Related packages

- `@embedded32/tools` - `embedded32-tools` simulation and monitoring
- `@embedded32/supervisor` - module lifecycle behind `start`/`demo`
- `@embedded32/bridge`, `@embedded32/ethernet` - networking in full configs

## Version compatibility

`@embedded32/cli@1.0.0` requires matching **1.0.0** workspace dependencies.

## License

MIT © Mukesh Mani Tripathi

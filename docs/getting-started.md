# Getting started

Complete this guide in about **15 minutes** using only a Node.js workstation - no CAN adapter required.

## Prerequisites

- **Node.js** 18 or newer (`node --version`)
- **npm** 9 or newer (`npm --version`)
- **Git**
- Optional: `npx tsx` (installed on demand) for TypeScript examples

## 1. Clone and install

```bash
git clone https://github.com/Mukesh-SCS/Embedded32.git
cd Embedded32
npm ci
npm run build
```

If `npm ci` fails, run `npm install` once and report a lockfile issue.

## 2. Install packages (monorepo)

Inside this repository, workspace packages are linked automatically. You do not need separate `npm install @embedded32/*` commands while developing from the clone.

For a standalone project after packages are published to npm:

```bash
npm install @embedded32/can @embedded32/j1939
```

## 3. Start a simulated ECU network

From the repository root:

```bash
npx embedded32-tools simulate vehicle/basic-truck
```

You should see decoded J1939 traffic from simulated **engine**, **transmission**, and **diagnostic tool** ECUs on a virtual bus.

Press `Ctrl+C` to stop.

## 4. Send and decode one J1939 message

Run the hardware-free example:

```bash
npx tsx examples/j1939-basic.ts
```

Expected output includes:

- Parsed priority, PGN, and source address from `0x18F00401`
- A decoded message name (for example Electronic Engine Controller 1)
- A mock CAN receive line showing PGN and source address

### What the example does

```typescript
import { MockCANDriver, CANInterface } from '@embedded32/can';
import { parseJ1939Id, decodeJ1939 } from '@embedded32/j1939';

const parsed = parseJ1939Id(0x18f00401);
const can = new CANInterface(new MockCANDriver());
can.onMessage((frame) => console.log(decodeJ1939(frame)));
can.send({ id: 0x18f00401, data: [0, 1, 2, 3, 4, 5, 6, 7], extended: true });
```

## 5. Display output in your own script

Create `my-first-j1939.mjs`:

```javascript
import { parseJ1939Id, decodeJ1939, formatJ1939Message } from '@embedded32/j1939';

const frame = {
  id: 0x18fef100,
  data: [0x40, 0x1f, 0, 0, 0, 0, 0, 0],
  extended: true,
};

console.log(parseJ1939Id(frame.id));
console.log(formatJ1939Message(decodeJ1939(frame)));
```

Run from repo root after `npm run build`:

```bash
node my-first-j1939.mjs
```

## 6. Optional - runtime demo

```bash
npx embedded32 demo
```

Starts the supervisor-backed demo with simulators and optional local dashboard instructions. Press `Ctrl+C` to exit.

## Common troubleshooting

| Problem                                  | Likely cause                          | Fix                                       |
| ---------------------------------------- | ------------------------------------- | ----------------------------------------- |
| `Cannot find module '@embedded32/j1939'` | Build not run or not in monorepo root | `npm run build` from repository root      |
| `embedded32-tools: command not found`    | CLI not on PATH                       | Use `npx embedded32-tools` from repo root |
| `tsx` not found                          | tsx not installed                     | `npx tsx examples/j1939-basic.ts`         |
| Simulation shows no traffic              | Profile path wrong                    | Use `vehicle/basic-truck` exactly         |
| Type errors in examples                  | Stale `dist/`                         | `npm run build`                           |

## Optional SocketCAN (Linux / WSL)

Only needed for hardware labs:

```bash
sudo modprobe vcan
sudo ip link add dev vcan0 type vcan
sudo ip link set up vcan0
```

Then:

```bash
npx embedded32-tools monitor vcan0
```

## Next step - first lab

Continue to [labs/README.md](../labs/README.md) for the structured lab sequence (Phase 5).

## Related docs

- [Package selection guide](./package-guide.md)
- [J1939 concepts](./concepts/j1939.md)
- [Architecture](./architecture.md)

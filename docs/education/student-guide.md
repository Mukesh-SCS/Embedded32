# Student guide

Welcome to the Embedded32 embedded-vehicle networking module.

## What you will use

- **Language:** TypeScript on Node.js 18+
- **Hardware:** None for required labs (simulation only)
- **Editor:** VS Code, Cursor, or any IDE with TypeScript support

## Setup (first day)

```bash
git clone https://github.com/Mukesh-SCS/Embedded32.git
cd Embedded32
npm ci
npm run build
```

Verify your environment:

```bash
npx tsx examples/j1939-basic.ts
npm run test:labs
```

The second command is what instructors use to grade lab solutions.

## How labs work

Each lab has:

- `README.md` - instructions
- `starter/` - your starting code (edit this)
- `solution/` - reference (do not copy verbatim; learn from it)
- `expected-output/` - sample markers your program should print

Run your work:

```bash
npx tsx labs/lab-01-can-basics/starter/lab.ts
```

## Lab sequence

1. [Lab 1 - CAN basics](../../labs/lab-01-can-basics/)
2. [Lab 2 - J1939 messaging](../../labs/lab-02-j1939-messaging/)
3. [Lab 3 - Multi-ECU simulation](../../labs/lab-03-multi-ecu-simulation/)
4. [Lab 4 - Diagnostics](../../labs/lab-04-diagnostics-and-faults/)

## Study resources

- [Getting started](../getting-started.md) - 15-minute quickstart
- [Concept guides](../concepts/) - CAN, J1939, simulation, diagnostics
- [Package guide](../package-guide.md) - which npm package to use

## Submission checklist

- [ ] Code runs with `npx tsx` from repository root
- [ ] No absolute paths (e.g. `C:\Users\...`) in your files
- [ ] Lab report answers written questions where asked
- [ ] Output markers match the lab README (e.g. `LAB01_MATCHED=1`)

## Getting unstuck

| Problem              | Try                               |
| -------------------- | --------------------------------- |
| Module not found     | `npm run build` at repo root      |
| No simulation output | Call `scheduler.start()` in Lab 3 |
| Wrong J1939 fields   | Set `extended: true` on frames    |

Ask on your course forum first; open a GitHub issue for confirmed bugs.

## Academic integrity

You may discuss concepts with classmates. Submit your own code and your own lab write-ups.

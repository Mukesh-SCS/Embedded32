# Instructor guide

Guide for faculty teaching the Embedded32 two-week module.

## Course summary

Embedded32 teaches CAN, SAE J1939 (subset), ECU simulation, and diagnostics using TypeScript - **without requiring CAN hardware** for core labs.

## Before the first session

1. Clone the repository and run:

   ```bash
   npm ci
   npm run build
   npm run test:labs
   ```

2. Skim [course-module.md](./course-module.md) and [system-requirements.md](./system-requirements.md).
3. Decide track: **hardware-free only** or **optional SocketCAN** (Linux lab machines).

## Weekly structure

| Week | Lectures                                | Labs         |
| ---- | --------------------------------------- | ------------ |
| 1    | CAN, J1939 IDs, decode pipeline         | Lab 1, Lab 2 |
| 2    | Simulation, diagnostics, bridging intro | Lab 3, Lab 4 |

## Lab delivery

| Lab | Starter path                                        | Verification        |
| --- | --------------------------------------------------- | ------------------- |
| 1   | `labs/lab-01-can-basics/starter/lab.ts`             | `npm run test:labs` |
| 2   | `labs/lab-02-j1939-messaging/starter/lab.ts`        | same                |
| 3   | `labs/lab-03-multi-ecu-simulation/starter/lab.ts`   | same                |
| 4   | `labs/lab-04-diagnostics-and-faults/starter/lab.ts` | same                |

Each lab folder includes `rubric.md` and `instructor-notes.md`.

## Grading workflow

1. Students submit repository link or patch plus short write-up where required.
2. Run `npm run test:labs` on their branch (or compare markers manually).
3. Apply rubric scores from each lab's `rubric.md`.
4. Use [assessment-guide.md](./assessment-guide.md) for exam-style questions.

## Demonstrations

| Demo                  | Command                                              |
| --------------------- | ---------------------------------------------------- |
| Full vehicle sim      | `npx embedded32-tools simulate vehicle/basic-truck`  |
| J1939 example         | `npx tsx examples/j1939-basic.ts`                    |
| Trace replay (manual) | Load JSON from `examples/traces/` and decode in REPL |

## Honest positioning

Tell students explicitly:

- Embedded32 is **not** automotive-certified or a complete J1939 stack.
- Simulation is for learning - not live vehicle tuning.
- PGN/SPN catalog is partial.

## Getting help

- [Student guide](./student-guide.md) - share with class
- [GitHub Issues](https://github.com/Mukesh-SCS/Embedded32/issues) - bugs and doc fixes
- Maintainer email via repository profile (no private immigration or personal documents in issues)

## Optional SocketCAN week

If Linux VMs are available, add a bonus session:

```bash
sudo ip link add dev vcan0 type vcan
sudo ip link set up vcan0
npx embedded32-tools monitor vcan0
```

Run simulation in one terminal and monitor in another only when bridging sim to vcan is configured - default labs do not require this.

## Citation for syllabi and lab handouts

Ask students to cite the repository version they used. Templates and BibTeX: [citation.md](../citation.md).

For course materials, you may cite:

> Tripathi, M. M. (2026). _Embedded32_ classroom labs (Version 1.0.0). https://github.com/Mukesh-SCS/Embedded32/tree/main/labs

A Zenodo DOI will be available after the maintainer archives a GitHub Release - until then, require students to record the Git commit hash in lab reports.

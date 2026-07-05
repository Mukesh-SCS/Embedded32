# Course module (two weeks)

Approximate **2-week** undergraduate or bootcamp module on embedded vehicle networking with Embedded32.

## Prerequisites

- JavaScript or TypeScript fundamentals
- Comfort with async/await and npm
- Optional: introductory networking concepts

## Learning objectives

See [learning-outcomes.md](./learning-outcomes.md) for the full outcome list.

## Week 1 - Foundations

### Day 1–2: Introduction and CAN

| Activity                             | Materials                                          |
| ------------------------------------ | -------------------------------------------------- |
| Lecture: embedded + vehicle networks | [CAN concepts](../concepts/can.md)                 |
| Quickstart hands-on                  | [Getting started](../getting-started.md)           |
| **Lab 1**                            | [lab-01-can-basics](../../labs/lab-01-can-basics/) |

### Day 3–4: J1939

| Activity                     | Materials                                                    |
| ---------------------------- | ------------------------------------------------------------ |
| Lecture: 29-bit IDs, PGN, SA | [J1939 concepts](../concepts/j1939.md)                       |
| Demo decode pipeline         | `examples/j1939-basic.ts`                                    |
| **Lab 2**                    | [lab-02-j1939-messaging](../../labs/lab-02-j1939-messaging/) |

### Day 5: Review

- Quiz (see [assessment-guide.md](./assessment-guide.md))
- Optional: trace walkthrough with `examples/traces/normal-operation.json`

## Week 2 - Simulation and diagnostics

### Day 6–7: Multi-ECU systems

| Activity                        | Materials                                                              |
| ------------------------------- | ---------------------------------------------------------------------- |
| Lecture: virtual bus, ECU roles | [ECU simulation](../concepts/ecu-simulation.md)                        |
| CLI demo                        | `embedded32-tools simulate vehicle/basic-truck`                        |
| **Lab 3**                       | [lab-03-multi-ecu-simulation](../../labs/lab-03-multi-ecu-simulation/) |

### Day 8–9: Diagnostics

| Activity                  | Materials                                                                  |
| ------------------------- | -------------------------------------------------------------------------- |
| Lecture: DM1, lamps, DTCs | [Diagnostics](../concepts/diagnostics.md)                                  |
| Example                   | `examples/j1939-diagnostics.ts`                                            |
| **Lab 4**                 | [lab-04-diagnostics-and-faults](../../labs/lab-04-diagnostics-and-faults/) |

### Day 10: Capstone discussion

- Bridge/MQTT overview ([bridge concepts](../concepts/bridge.md))
- Project roadmap honesty - what Embedded32 does **not** claim
- Course retrospective

## Grading suggestion

| Component            | Weight |
| -------------------- | ------ |
| Lab 1                | 15%    |
| Lab 2                | 20%    |
| Lab 3                | 25%    |
| Lab 4                | 25%    |
| Quiz + participation | 15%    |

Adjust per institution policy.

## Hardware paths

| Track            | Requirements                              |
| ---------------- | ----------------------------------------- |
| **A - Default**  | Laptop with Node 18+ only                 |
| **B - Optional** | Linux VM with `vcan0` for SocketCAN bonus |

Details: [system-requirements.md](./system-requirements.md)

## Instructor preparation

- Run `npm run test:labs` before each lab session
- Read each lab's `instructor-notes.md`
- [Instructor guide](./instructor-guide.md)

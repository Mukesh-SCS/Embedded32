# Embedded32 classroom labs

Four hardware-free labs for learning CAN, J1939, multi-ECU simulation, and diagnostics.

| Lab | Topic                    | Directory                                                         | Time    |
| --- | ------------------------ | ----------------------------------------------------------------- | ------- |
| 1   | CAN communication basics | [lab-01-can-basics](./lab-01-can-basics/)                         | ~90 min |
| 2   | J1939 messaging          | [lab-02-j1939-messaging](./lab-02-j1939-messaging/)               | ~90 min |
| 3   | Multi-ECU simulation     | [lab-03-multi-ecu-simulation](./lab-03-multi-ecu-simulation/)     | ~2 hr   |
| 4   | Diagnostics and faults   | [lab-04-diagnostics-and-faults](./lab-04-diagnostics-and-faults/) | ~2 hr   |

## Before you start

```bash
git clone https://github.com/Mukesh-SCS/Embedded32.git
cd Embedded32
npm ci
npm run build
```

## Running a lab

```bash
npx tsx labs/lab-01-can-basics/starter/lab.ts
```

Replace `starter` with `solution` to view the reference implementation.

## Instructor verification

```bash
npm run test:labs
```

Validates all lab solutions, expected output markers, and basic repository hygiene (no absolute paths or credentials in lab files).

## Course materials

- [Instructor guide](../docs/education/instructor-guide.md)
- [Student guide](../docs/education/student-guide.md)
- [Two-week course module](../docs/education/course-module.md)

## Sample traces

Prerecorded bus captures for demos: [examples/traces](../examples/traces/)

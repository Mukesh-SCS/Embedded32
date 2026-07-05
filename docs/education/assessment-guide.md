# Assessment guide

Suggested quizzes and exam items aligned with module [learning outcomes](./learning-outcomes.md).

## Lab assessment

Each lab includes `rubric.md` with a 100-point breakdown. Automated markers are verified by:

```bash
npm run test:labs
```

Instructors may require students to paste terminal output showing required `LABxx_*` lines.

## Short quiz (Week 1)

1. **CAN:** How many data bytes can a classic CAN frame carry?
2. **CAN:** What does `extended: true` indicate?
3. **J1939:** Which field identifies the message type — PGN or SPN?
4. **J1939:** In ID `0x18F00400`, what is the source address (hex)?
5. **Practical:** Write one line of TypeScript to parse a J1939 ID using `parseJ1939Id`.

**Answer key:** 8 bytes; 29-bit ID; PGN; `0x00`; `parseJ1939Id(0x18f00400)`.

## Short quiz (Week 2)

1. **Simulation:** Why use `VirtualCANPort` instead of SocketCAN in labs?
2. **Simulation:** Which PGN does the engine ECU broadcast as EEC1?
3. **Diagnostics:** What does MIL indicate in DM1 byte 0?
4. **Diagnostics:** What do SPN and FMI describe?
5. **Ethics:** Why should students not connect experimental tools to undocumented vehicle buses?

## Practical exam option (90 minutes)

| Task                                          | Points |
| --------------------------------------------- | ------ |
| Filter CAN frames by ID                       | 25     |
| Parse and decode one J1939 frame              | 25     |
| Run multi-ECU sim and list two SAs            | 25     |
| Decode provided DM1 bytes and summarize fault | 25     |

Provide a built repository on exam machines (`npm run build` completed).

## Oral defense prompts

- Walk through how a frame travels from `EngineECU` to your monitor callback.
- Explain why Embedded32 does not claim full SAE J1939 coverage.
- How would you add a dashboard ECU to Lab 3?

## Academic integrity

Compare submission markers to `npm run test:labs` output. Identical non-trivial code across students may warrant review.

## Rubric mapping

| Outcome IDs | Primary assessment   |
| ----------- | -------------------- |
| 1–3         | Lab 1 + Quiz W1      |
| 4–7         | Lab 2 + Quiz W1      |
| 8–10        | Lab 3 + Quiz W2      |
| 11–13       | Lab 4 + Quiz W2      |
| 14–15       | Participation + oral |

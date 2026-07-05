# Learning outcomes

After completing the Embedded32 two-week module, students should be able to:

## CAN and framing

1. Explain the difference between standard (11-bit) and extended (29-bit) CAN identifiers.
2. Send and receive classic CAN frames using `@embedded32/can` mock drivers.
3. Implement a simple acceptance filter by CAN ID.

## J1939

4. Parse a 29-bit J1939 identifier into priority, PGN, and source address.
5. Decode catalog PGNs to human-readable names using `@embedded32/j1939`.
6. Build a J1939 CAN ID from logical fields.
7. Describe PDU1 vs PDU2 at a conceptual level.

## Simulation

8. Wire multiple ECU simulators to a shared virtual CAN bus.
9. Identify which source address originated a given PGN.
10. Relate simulation output to a simplified vehicle profile (`basic-truck`).

## Diagnostics

11. Explain the purpose of DM1 active fault broadcasts.
12. Extract MIL status and SPN/FMI from a synthetic DM1 payload.
13. Write a short diagnostic summary identifying the affected ECU.

## Professional practice

14. Run repository verification commands (`npm run build`, `npm run test:labs`).
15. State the **limitations** of an educational J1939 subset versus production tooling.

## Not claimed as outcomes

Students are **not** expected to:

- Certify compliance with SAE J1939 conformance tests
- Operate production HIL or safety-critical systems
- Use Embedded32 as a replacement for professional CAN analyzer hardware

# Lab 2 rubric — J1939 messaging

Total: **100 points**

| Criterion                                 | Points | Full credit                          |
| ----------------------------------------- | ------ | ------------------------------------ |
| Correct priority, PGN, SA from parse      | 30     | `6`, `0xF004`, `0x00`                |
| PGN name from catalog                     | 15     | Contains `EEC1` or full catalog name |
| `decodeJ1939` used with `extended: true`  | 15     | Decoded name matches EEC1            |
| `buildJ1939Id` round-trip                 | 30     | `LAB02_BUILT_ID=0x18F00400`          |
| Short written answers (PGN, SA, extended) | 10     | Accurate prose in submission         |

## Automated markers

- `LAB02_PGN=0xF004`
- `LAB02_SA=0x00`
- `LAB02_BUILT_ID=0x18F00400`
- `LAB02_NAME` contains `EEC1`

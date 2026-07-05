# Lab 3 rubric — Multi-ECU simulation

Total: **100 points**

| Criterion                                     | Points | Full credit                      |
| --------------------------------------------- | ------ | -------------------------------- |
| Shared `VirtualCANPort` with monitor callback | 15     | Counts frames and parses IDs     |
| Engine ECU at SA `0x00` broadcasting          | 25     | `LAB03_HAS_EEC1=true`            |
| Transmission ECU at SA `0x03` broadcasting    | 25     | `LAB03_HAS_ETC1=true`            |
| Two distinct source addresses observed        | 20     | `LAB03_ECU_COUNT=2`              |
| Bus log excerpt with PGN ↔ ECU mapping        | 15     | Correct identification in report |

## Automated thresholds

- `LAB03_ECU_COUNT=2`
- `LAB03_HAS_EEC1=true`
- `LAB03_HAS_ETC1=true`
- `LAB03_FRAME_COUNT` ≥ 8 (runtime check in verifier)

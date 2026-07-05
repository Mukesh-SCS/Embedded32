# Lab 4 rubric — Diagnostics and fault injection

Total: **100 points**

| Criterion                            | Points | Full credit                        |
| ------------------------------------ | ------ | ---------------------------------- |
| DM1 payload with MIL on              | 25     | `LAB04_MIL=true`                   |
| Correct SPN 26 encoded               | 30     | `LAB04_DTC_SPN=26`                 |
| FMI 0 (above normal)                 | 15     | `LAB04_DTC_FMI=0`                  |
| `DiagnosticsManager.processDM1` used | 10     | Active count = 1                   |
| Written diagnostic summary           | 20     | Clear, accurate, names ECU SA 0x00 |

## Automated markers

- `LAB04_MIL=true`
- `LAB04_DTC_SPN=26`
- `LAB04_DTC_FMI=0`
- `LAB04_ACTIVE_COUNT=1`

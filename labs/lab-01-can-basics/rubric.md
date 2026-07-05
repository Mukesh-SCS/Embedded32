# Lab 1 rubric — CAN communication basics

Total: **100 points**

| Criterion                             | Points | Excellent (full)                           | Partial                              | Missing         |
| ------------------------------------- | ------ | ------------------------------------------ | ------------------------------------ | --------------- |
| `acceptFrame` filters ID `0x200` only | 40     | Returns true only for `frame.id === 0x200` | Filters wrong ID or uses loose logic | Not implemented |
| Send loop transmits 3 frames          | 20     | All three frames sent with distinct IDs    | Missing sends or wrong IDs           | No send logic   |
| Logging shows matched frame payload   | 20     | `MATCH` line includes id and data array    | Logs without payload detail          | No logging      |
| Program prints verification markers   | 10     | `LAB01_SENT=3` and `LAB01_MATCHED=1`       | One marker wrong                     | No markers      |
| Code quality and comments             | 10     | Clear names, brief comment on filter       | Works but hard to read               | Does not run    |

## Automated checks

`npm run test:labs` verifies solution output contains:

- `LAB01_SENT=3`
- `LAB01_MATCHED=1`
- `MATCH id=0x200`

## Common deductions

- **-10** Accepting all frames (`return true` left in place)
- **-5** Off-by-one on hex ID (`0x20` vs `0x200`)
- **-5** Race: handler registered after sends without delay

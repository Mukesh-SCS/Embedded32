# Code coverage baseline

Recorded **2026-07-04** on branch `feat/open-source-education-platform` using `npm run test:coverage`.

## Policy

1. **Measure first** — baseline below; do not claim high coverage project-wide.
2. **No global 90% gate yet** — `@embedded32/can` and `@embedded32/j1939` need more tests before strict thresholds.
3. **Prevent regression on strong packages** — `@embedded32/core` should not drop below baseline without justification.
4. **CI** — `npm run test:coverage` runs on Node 20 in the CI workflow.

## Baseline (2026-07-04)

| Package             | Lines  | Statements | Functions | Branches |
| ------------------- | ------ | ---------- | --------- | -------- |
| `@embedded32/j1939` | 50.55% | 49.89%     | 29.23%    | 30.55%   |
| `@embedded32/core`  | 99.33% | 98.75%     | 100%      | 90.24%   |
| `@embedded32/can`   | 19.11% | 19.71%     | 35.71%    | 0%       |

## Commands

```bash
npm run build
npm run test:coverage
```

Per-package:

```bash
cd embedded32-j1939 && npm run test:coverage
```

## Future thresholds (not enforced yet)

| Package | Target direction                           |
| ------- | ------------------------------------------ |
| `j1939` | Increase lines toward 60% before enforcing |
| `core`  | Maintain ≥ 95% lines                       |
| `can`   | Add driver tests; target 50% lines         |

When enforcing in Jest `coverageThreshold`, add per-package config — not a monorepo-wide blanket.

## Related issues

See [seed-issues.md](./seed-issues.md) — coverage reporting and bridge/dashboard test expansion.

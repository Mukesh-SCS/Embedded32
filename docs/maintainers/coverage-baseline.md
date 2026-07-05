# Coverage baseline

Recorded before education hardening (approximate pre-change values):

| Package              | Lines (before) | Target            | Enforced in `scripts/coverage-report.mjs` |
| -------------------- | -------------- | ----------------- | ----------------------------------------- |
| `@embedded32/can`    | ~19%           | ≥60%              | yes                                       |
| `@embedded32/j1939`  | ~51%           | ≥70%              | yes                                       |
| `@embedded32/core`   | varies         | report only       | no                                        |
| `@embedded32/bridge` | n/a            | integration tests | report only                               |

Re-run: `npm run test:coverage`

Per-package Jest thresholds are also set in each package `jest.config.js` (`can` 60%, `j1939` 70%).

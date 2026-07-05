# Baseline Status

Recorded during **Phase 1** audit on branch `feat/open-source-education-platform`.

Environment:

| Item                | Value                                                      |
| ------------------- | ---------------------------------------------------------- |
| OS                  | Windows 10 (10.0.26200)                                    |
| Shell               | PowerShell                                                 |
| Node.js             | (system default; root `engines` requires `>=20.9.0`)       |
| npm                 | 11.6.2 (warns about unknown `devdir` env config)           |
| Branch              | `feat/open-source-education-platform`                      |
| Pre-change baseline | Yes — no structural refactoring performed before recording |

---

## Root commands

### `npm ci`

| Field            | Value                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Command          | `npm ci`                                                                                                                 |
| Exit code        | **1**                                                                                                                    |
| Affected package | Root workspace                                                                                                           |
| Pre-existing     | **Yes**                                                                                                                  |
| Summary          | `package-lock.json` is out of sync with `package.json`. Missing lockfile entries: `encoding@0.1.13`, `iconv-lite@0.6.3`. |

**Workaround used for subsequent baseline steps:** `npm install` (exit 0, 914 packages added).

---

### `npm install` (fallback)

| Field            | Value                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Command          | `npm install`                                                                                                               |
| Exit code        | **0**                                                                                                                       |
| Affected package | Root workspace                                                                                                              |
| Pre-existing     | Lockfile drift is pre-existing                                                                                              |
| Summary          | Install succeeded with deprecation warnings (`inflight`, `glob@7`) and `41` reported vulnerabilities (1 critical, 28 high). |

---

### `npm run build`

| Field            | Value                                                                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Command          | `npm run build` → `lerna run build`                                                                                                                                                      |
| Exit code        | **0**                                                                                                                                                                                    |
| Affected package | 11 Lerna-managed packages                                                                                                                                                                |
| Pre-existing     | **Yes** (partial coverage)                                                                                                                                                               |
| Summary          | All invoked package builds succeeded. `@embedded32/sdk-c` build is a no-op echo. `@embedded32/dashboard` is **not** included in Lerna build graph despite being an npm workspace member. |

Packages built:

- `@embedded32/can`, `@embedded32/core`, `@embedded32/j1939`, `@embedded32/sim`
- `@embedded32/tools`, `@embedded32/bridge`, `@embedded32/ethernet`, `@embedded32/supervisor`
- `@embedded32/cli`, `@embedded32/sdk-js`, `@embedded32/sdk-c` (stub)

---

### `npm run test`

| Field            | Value                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| Command          | `npm run test` → `lerna run test`                                                                                   |
| Exit code        | **0**                                                                                                               |
| Affected package | 12 Lerna-managed packages                                                                                           |
| Pre-existing     | **Yes** (shallow coverage)                                                                                          |
| Summary          | Lerna reported success for all packages, but several packages use placeholder test scripts that only echo messages. |

Notable per-package behavior:

| Package                  | Test behavior              | Result                                           |
| ------------------------ | -------------------------- | ------------------------------------------------ |
| `@embedded32/can`        | `echo "no tests yet"`      | Exit 0 (no real tests)                           |
| `@embedded32/tools`      | `echo "no tests yet"`      | Exit 0 (no real tests)                           |
| `@embedded32/sdk-c`      | echo stub                  | Exit 0 (no real tests)                           |
| `@embedded32/sdk-python` | echo stub                  | Exit 0 (no real tests)                           |
| `@embedded32/j1939`      | Jest — 45 tests            | Pass                                             |
| `@embedded32/core`       | Jest — multiple suites     | Pass (expected console.error in scheduler tests) |
| `@embedded32/bridge`     | Jest — 2 placeholder tests | Pass                                             |
| `@embedded32/sim`        | Jest — 2 placeholder tests | Pass                                             |
| `@embedded32/supervisor` | Jest — 2 placeholder tests | Pass                                             |
| `@embedded32/cli`        | Jest — 2 placeholder tests | Pass                                             |
| `@embedded32/ethernet`   | Jest                       | Pass                                             |
| `@embedded32/sdk-js`     | Jest (`--passWithNoTests`) | Pass                                             |

`@embedded32/dashboard` is not executed by root `npm run test`.

---

## Packaging dry-run (`npm pack --dry-run`)

Manually run on all 10 public packages after build. All commands exited **0** and produced tarballs with compiled `dist/` output.

**Resolved in Phase 2** (see commit on `feat/open-source-education-platform`):

- `prepack` scripts copy root `LICENSE` and rebuild before pack
- `files` arrays include `dist`, `README.md`, and `LICENSE`
- Workspace `*` dependencies replaced with pinned `1.0.0` versions
- Duplicate `embedded32` bin resolved: `@embedded32/tools` uses `embedded32-tools`
- `@embedded32/cli` no longer depends on private `@embedded32/dashboard`
- `@embedded32/bridge` converted to ESM for J1939 interop

`npm run audit:packages` and `npm run test:package-install` both pass after Phase 2.

---

## Phase 2 commands (post-fix)

| Command                        | Exit  | Summary                                                            |
| ------------------------------ | ----- | ------------------------------------------------------------------ |
| `npm ci`                       | **0** | Works after lockfile update                                        |
| `npm run build`                | **0** | All Lerna packages build                                           |
| `npm run test`                 | **0** | Includes wired `@embedded32/can` tests (9) and CLI packaging tests |
| `npm run audit:packages`       | **0** | All 10 public packages pass                                        |
| `npm run test:package-install` | **0** | All 10 packages install and smoke-test in isolated projects        |

---

## Commands not present at root (Phase 1)

Updated in Phase 3 — all root workflow commands now exist:

| Command                        | Status                                                              |
| ------------------------------ | ------------------------------------------------------------------- |
| `npm run lint`                 | **Added Phase 3** — ESLint 9 flat config                            |
| `npm run typecheck`            | **Added Phase 3** — `lerna run typecheck` across 13 packages        |
| `npm run format`               | **Added Phase 3**                                                   |
| `npm run format:check`         | **Added Phase 3**                                                   |
| `npm run audit:packages`       | Passes                                                              |
| `npm run test:package-install` | Passes                                                              |
| `npm run verify`               | **Added Phase 3** — passes on `feat/open-source-education-platform` |

---

## CI / automation

| Item                 | Status                                                                 |
| -------------------- | ---------------------------------------------------------------------- |
| `.github/workflows/` | **Present** — `ci.yml`, `codeql.yml`, `dependency-review.yml`, `release.yml` |
| Dependabot           | **Present** — `.github/dependabot.yml`                               |
| CodeQL               | **Present** — weekly + PR                                              |
| Release dry-run      | **Present** — `npm run release:dry-run` (Phase 8)                      |
| Documentation site   | **Present** — `apps/site` Next.js static export (Phase 9)              |
| Browser demo         | **Present** — `apps/demo` client-side CAN/J1939 (Phase 10)             |
| Pages deployment     | **Present** — `deploy-pages.yml` → GitHub Pages (Phase 11)             |
| Citation / Zenodo    | **Present** — `CITATION.cff`, `test:citation`, zenodo runbook (Phase 12) |
| Evidence metrics   | **Present** — `evidence/`, `evidence:collect`, `test:evidence` (Phase 13) |
| Upgrade validation | **Present** — `validate:upgrade`, `open-source-upgrade-summary.md` (Phase 15) |

---

## Recommended Phase 2 priorities (from baseline)

1. Fix `package-lock.json` so `npm ci` works on a clean checkout.
2. Add `prepack`, correct `files` arrays (include `README.md`, `LICENSE`).
3. Replace workspace `*` dependency versions with pinned or Lerna-compatible ranges before publish.
4. Resolve duplicate `embedded32` bin between `@embedded32/cli` and `@embedded32/tools`.
5. Add real tests for `@embedded32/can` and `@embedded32/tools` (test files exist under `embedded32-can/tests/` but are not wired).
6. Include `@embedded32/dashboard` in Lerna or document intentional exclusion.

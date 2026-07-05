# Contributor issue backlog

Twelve **real** issues identified from the repository audit and Phases 1–5 work. Create them on GitHub when `gh` is available or via the web UI.

**Automated seeding:**

```bash
gh auth login
node scripts/seed-contributor-issues.mjs
```

Dry run:

```bash
node scripts/seed-contributor-issues.mjs --dry-run
```

Create labels first if missing - see [manual-github-settings.md](./manual-github-settings.md).

---

## Issue 1 - CI workflow

**Title:** Add GitHub Actions CI workflow running npm run verify  
**Labels:** `enhancement`, `help wanted`

Add `.github/workflows/ci.yml` for pull requests and `main` pushes: `npm ci`, lint, format check, typecheck, test, build, audits, `test:labs`.

---

## Issue 2 - Labs in verify

**Title:** Include test:labs in root npm run verify  
**Labels:** `good first issue`, `testing`, `education`

Extend `package.json` `verify` to run `npm run test:labs`.

---

## Issue 3 - Dashboard tests

**Title:** Add React component tests for embedded32-dashboard  
**Labels:** `testing`, `help wanted`

Replace test stub with component tests for key dashboard views.

---

## Issue 4 - Bridge tests

**Title:** Expand @embedded32/bridge integration test coverage  
**Labels:** `testing`, `package`

Test `RuleEngine` routing and bridge configuration paths.

---

## Issue 5 - Trace replay

**Title:** Add CLI utility to replay examples/traces JSON files  
**Labels:** `enhancement`, `education`, `good first issue`

Decode synthetic traces from `examples/traces/` for instructor demos.

---

## Issue 6 - TypeDoc warning

**Title:** Resolve TypeDoc unsupported TypeScript version warning  
**Labels:** `documentation`, `package`

Address or document TypeDoc + TypeScript version mismatch on `npm run docs:api`.

---

## Issue 7 - SDK metadata

**Title:** Align sdk-python and sdk-c package metadata with monorepo  
**Labels:** `documentation`, `package`

Fix repository URLs and document build/publish status for private SDKs.

---

## Issue 8 - Browser demo

**Title:** Build browser educational demo under apps/demo  
**Labels:** `enhancement`, `education`

Phase 10: CAN viewer, J1939 decoder, scenarios from traces - no fake SocketCAN.

---

## Issue 9 - Documentation site

**Title:** Build documentation website under apps/site  
**Labels:** `enhancement`, `documentation`

Phase 9 Next.js site with labs, packages, and honest maturity messaging.

---

## Issue 10 - Code coverage

**Title:** Add code coverage reporting with honest baseline  
**Labels:** `testing`, `enhancement`

Jest coverage for core libraries; prevent regression before strict thresholds.

---

## Issue 11 - ESLint warnings

**Title:** Reduce ESLint warning backlog in legacy packages  
**Labels:** `good first issue`, `help wanted`

Drive warning count down without behavior changes.

---

## Issue 12 - Dependabot and CodeQL

**Title:** Add Dependabot and CodeQL GitHub workflows  
**Labels:** `enhancement`, `help wanted`

Phase 7 security automation configs.

---

## After creating issues

- Link this document in a maintainer discussion post
- Apply `good first issue` sparingly to tasks with clear scope
- Do not close issues as "done" until acceptance criteria in the issue body are met

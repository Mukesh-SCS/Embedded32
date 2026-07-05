# Documentation consistency audit

Recorded during education hardening work. Use `npm run test:docs-status` to catch regressions.

## Coverage baseline (pre-change)

| Package | Lines (approx.) | Notes |
|---------|-----------------|-------|
| `@embedded32/can` | 19% | MockCANDriver only; VirtualCANPort untested |
| `@embedded32/j1939` | 51% | DM, TP, gateway, integration suites |
| `@embedded32/bridge` | n/a | Placeholder tests only |
| `@embedded32/dashboard` | n/a | Stub test script |
| `apps/demo` | n/a | No unit tests |

Targets after this work: CAN ≥60%, J1939 ≥70%, bridge integration tests, dashboard + demo unit tests, Playwright E2E on static export.

## Contradiction inventory

| Statement | Location | Actual status | Correction |
|-----------|----------|---------------|------------|
| Four labs are **planned** under `labs/` (Phase 5) | `README.md` | Four labs ship with starter/solution/rubric | Describe as available; link `labs/README.md` |
| Placeholder index: `labs/README.md` | `README.md` | Real lab catalog | Remove “placeholder” wording |
| Future browser demo with prerecorded traces | `README.md` | `/demo` implemented in `apps/demo/` | Link to browser demo section |
| Security details will appear in `SECURITY.md` (Phase 6) | `README.md` | `SECURITY.md` complete | Link directly to security policy |
| `docs site (planned)` / `browser demo (planned)` | `docs/architecture.md` | Site and demo built | Mark as built; note Pages URL pending owner enable |
| `/demo` — Placeholder until Phase 10 | `apps/site/README.md` | Live demo route | Document implemented demo |
| coming in Phase 10 (homepage) | `apps/site/src/app/page.tsx` | Demo at `/demo` | Link to interactive demo |
| Planned browser playground (Phase 10) | `docs/education/system-requirements.md` | Demo ships | Optional browser track; link `/demo` |
| future browser playground | `examples/traces/README.md` | Traces power `apps/demo` | Say traces feed the site demo |
| planned browser demo | `embedded32-can/README.md` | Demo exists | Link `apps/demo/README.md` |
| future browser demo (Phase 10) | `embedded32-sdk-js/README.md` | Bundled in demo | Document `/demo` integration |
| Planned lab 4 (`labs/04-diagnostics`) | `docs/concepts/diagnostics.md` | `labs/lab-04-diagnostics-and-faults/` exists | Fix path; remove “Planned” |
| Detailed guidance will appear in `SECURITY.md` (Phase 6) | `docs/concepts/bridge.md` | MQTT guidance in `SECURITY.md` | Link to security policy |
| Complete SAE J1939 implementation | `docs/README.md` | Educational subset | “Educational J1939 subset” |
| `npm install -g embedded32-cli` | `docs/README.md` | Package is `@embedded32/cli` | Correct install command |
| `npm install embedded32-dashboard` | `embedded32-dashboard/README.md` | Private `@embedded32/dashboard` | Monorepo dev workflow only |
| Network topology / CSV export claims | `embedded32-dashboard/README.md` | Not all features implemented | Trim to actual components |
| CAN/tools “no tests yet” | `docs/maintainers/repository-audit.md` | Jest suites exist | Update audit (historical) |
| Node 18+ everywhere vs root `>=20.9.0` | `CONTRIBUTING.md`, package READMEs | CI uses Node 20/22 | Document Node 20.9+ for monorepo |
| npm install `@embedded32/*` without caveat | Package READMEs | Not on npm registry yet | “From monorepo clone until publish” |
| public deploy pending vs workflow exists | `README.md` status table | Workflow ready; live URL needs owner | Clarify workflow vs live URL |
| React 18 in changelog | `CHANGELOG.md` | React 19 in use | Update to React 19 |
| Browser demo will use prerecorded traces (Phase 10) | `embedded32-sim/README.md` | Demo implemented | Link `/demo` |
| structured lab sequence (Phase 5) | `docs/getting-started.md` | Labs available | Remove stale phase label |
| structured coursework (Phase 5) | `docs/architecture.md` | Complete | Remove phase label |

## Intentionally accurate (no change)

- GitHub Pages deployment (`docs/deployment/GITHUB_PAGES.md`); Vercel explicitly not used.
- Zenodo DOI not yet available (`docs/citation.md`).
- Not production-certified / not full J1939 (`README.md` maturity disclaimer).
- npm publish requires maintainer approval.

## Automation

`scripts/verify-documentation-status.mjs` scans markdown and site sources for obsolete phrases listed above. Historical maintainer audit docs are excluded from phrase scanning.

# Roadmap

Milestone-based plan for the Embedded32 education platform. Updated after the **15-phase open-source upgrade** (all phases complete on `feat/open-source-education-platform`).

## Upgrade status (Phases 1–15)

| Phase | Focus | Status |
|-------|--------|--------|
| 1 | Repository audit | ✅ Complete |
| 2 | npm packaging reliability | ✅ Complete |
| 3 | Monorepo workflow (lint, verify) | ✅ Complete |
| 4 | Documentation rewrite + TypeDoc | ✅ Complete |
| 5 | Classroom labs + course docs | ✅ Complete |
| 6 | Community files + templates | ✅ Complete |
| 7 | CI, CodeQL, Dependabot | ✅ Complete |
| 8 | Controlled release dry-run | ✅ Complete |
| 9 | Documentation site (`apps/site/`) | ✅ Complete |
| 10 | Browser demo (`apps/demo/`) | ✅ Complete |
| 11 | GitHub Pages deployment | ✅ Workflow ready — owner must enable Pages |
| 12 | Citation + Zenodo runbook | ✅ Complete — DOI pending owner archive |
| 13 | Evidence metrics tracking | ✅ Complete |
| 14 | Roadmap and planning sync | ✅ This document |
| 15 | Final validation summary | ✅ See [open-source-upgrade-summary.md](./docs/maintainers/open-source-upgrade-summary.md) |

Summary report: [docs/maintainers/open-source-upgrade-summary.md](./docs/maintainers/open-source-upgrade-summary.md)

---

## v1.0.x — Reliability and trust

**Status:** Upgrade phases complete; **npm publish** and **GitHub Pages live URL** require maintainer owner actions.

- [x] Repository audit and packaging fixes
- [x] Monorepo verify workflow (lint, typecheck, test, build, audits)
- [x] Core documentation rewrite and TypeDoc API
- [x] Four classroom labs with automated verification
- [x] Community files and issue templates
- [x] GitHub Actions CI and security automation
- [x] Controlled release dry-run
- [x] Citation metadata and Zenodo runbook
- [x] Evidence metrics tracking
- [x] Documentation site and GitHub Pages workflow
- [x] Browser educational demo
- [ ] **Owner:** Enable GitHub Pages (Settings → Pages → GitHub Actions)
- [ ] **Owner:** npm publish with maintainer approval
- [ ] **Owner:** Zenodo archive + DOI in `CITATION.cff`
- [ ] **Owner:** GitHub branch protection + required CI checks

Evidence snapshot: [evidence/metrics-latest.json](./evidence/metrics-latest.json)

---

## v1.1 — Education foundation

**Status:** Core materials shipped; expansion items remain.

- [x] Instructor and student guides
- [x] Synthetic sample traces (6 scenarios)
- [x] Four labs with rubrics and instructor notes
- [ ] Additional lab rubrics and instructor feedback loop
- [ ] Improved cross-package examples
- [ ] CLI trace replay command (see [seed-issues.md](./docs/maintainers/seed-issues.md))
- [ ] Expanded J1939 PGN catalog (honest subset growth)

**Target:** First external classroom pilot documented in [evidence/outreach-log.md](./evidence/outreach-log.md).

---

## v1.2 — Web learning platform

**Status:** Site and demo built; live deployment and analytics pending.

- [x] Documentation site (`apps/site/`) — Next.js static export
- [x] GitHub Pages workflow (`.github/workflows/deploy-pages.yml`)
- [x] Browser CAN/J1939 playground (`apps/demo/`)
- [ ] PGN explorer and ECU network visualization (beyond current demo)
- [ ] Privacy-respecting analytics (demo/lab usage only — no third-party trackers without review)

**Published URL (after owner enables Pages):** https://mukesh-scs.github.io/Embedded32/

---

## v1.3 — Community growth

**Status:** Not started — depends on v1.0.x owner actions and pilot feedback.

- [ ] External contributor onboarding playbook (beyond [CONTRIBUTING.md](./CONTRIBUTING.md))
- [ ] Additional translated docs (community-driven)
- [ ] Instructor pilot feedback collection
- [ ] Optional community calls
- [ ] More labs (bridge, MQTT, SocketCAN optional track)

Use [seed-contributor-issues.mjs](./scripts/seed-contributor-issues.mjs) or [seed-issues.md](./docs/maintainers/seed-issues.md) for backlog.

---

## v2.0 — Consideration only

Version 2.0 is reserved for **genuine breaking changes** (for example monorepo directory migration or public API redesign). It will not be used for marketing alone.

Potential v2 topics (not committed):

- Unified CLI surface (`embedded32` vs `embedded32-tools`)
- Stable browser SDK bundle
- Formal plugin API for ECU profiles
- Independent package versioning (Changesets) if maintainer team grows

---

## How to influence the roadmap

- Open a [feature request](https://github.com/Mukesh-SCS/Embedded32/issues/new?template=feature.yml)
- Comment on existing issues with `enhancement` or `education` labels
- Contribute labs or documentation via pull request
- Propose lab topics via [lab-request.yml](https://github.com/Mukesh-SCS/Embedded32/issues/new?template=lab-request.yml)

---

## Non-goals

- Claiming automotive safety certification or full SAE J1939 compliance
- Replacing professional CAN analyzer hardware
- Publishing npm packages or deploying production sites without maintainer review
- Fabricating adoption metrics, DOIs, or download statistics

---

## Maintainer references

| Topic | Document |
|-------|----------|
| Daily commands | [monorepo-workflow.md](./docs/maintainers/monorepo-workflow.md) |
| Release + npm | [release-process.md](./docs/maintainers/release-process.md) |
| GitHub Pages | [GITHUB_PAGES.md](./docs/deployment/GITHUB_PAGES.md) |
| Zenodo / DOI | [zenodo-release.md](./docs/maintainers/zenodo-release.md) |
| Evidence | [evidence-collection.md](./docs/maintainers/evidence-collection.md) |
| Upgrade completion | [open-source-upgrade-summary.md](./docs/maintainers/open-source-upgrade-summary.md) |

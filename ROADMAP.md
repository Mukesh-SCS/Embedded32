# Roadmap

Milestone-based plan for the Embedded32 education platform. Dates are tentative.

## v1.0.x — Reliability and trust

**Status:** In progress on `feat/open-source-education-platform`

- [x] Repository audit and packaging fixes
- [x] Monorepo verify workflow (lint, typecheck, test, build, audits)
- [x] Core documentation rewrite and TypeDoc API
- [x] Four classroom labs with automated verification
- [x] Community files and issue templates
- [ ] GitHub Actions CI and security automation (Phase 7)
- [ ] Controlled release dry-run (Phase 8)
- [ ] npm publish with maintainer approval

## v1.1 — Education foundation

- [x] Instructor and student guides
- [x] Synthetic sample traces
- [ ] Additional lab rubrics and instructor feedback loop
- [ ] Improved cross-package examples
- [ ] Trace replay tooling for demos
- [ ] Expanded J1939 PGN catalog (honest subset growth)

## v1.2 — Web learning platform

- [ ] Documentation site (`apps/site/`)
- [ ] Browser CAN/J1939 playground (`apps/demo/`)
- [ ] PGN explorer and ECU visualization
- [ ] Vercel preview deployments
- [ ] Privacy-respecting analytics (demo/lab usage only)

## v1.3 — Community growth

- [ ] External contributor onboarding playbook
- [ ] Additional translated docs (community-driven)
- [ ] Instructor pilot feedback collection
- [ ] Optional community calls
- [ ] More labs (bridge, MQTT, SocketCAN optional track)

## v2.0 — Consideration only

Version 2.0 is reserved for **genuine breaking changes** (for example monorepo directory migration or public API redesign). It will not be used for marketing alone.

Potential v2 topics (not committed):

- Unified CLI surface
- Stable browser SDK bundle
- Formal plugin API for ECU profiles

## How to influence the roadmap

- Open a [feature request](https://github.com/Mukesh-SCS/Embedded32/issues/new?template=feature.yml)
- Comment on existing issues with `enhancement` or `education` labels
- Contribute labs or documentation via pull request

## Non-goals

- Claiming automotive safety certification
- Replacing professional CAN analyzer hardware
- Publishing npm packages without maintainer review

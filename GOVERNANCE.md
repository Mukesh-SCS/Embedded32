# Governance

Embedded32 uses a **simple maintainer-led model** appropriate for a small open-source education project.

## Project leadership

- **Lead maintainer:** Mukesh Mani Tripathi ([@Mukesh-SCS](https://github.com/Mukesh-SCS))
- **Maintainers:** Listed in [MAINTAINERS.md](MAINTAINERS.md)

There is no separate foundation or corporate steering committee.

## Maintainer responsibilities

- Triage issues and pull requests
- Keep documentation honest and education-focused
- Run or delegate verification (`npm run verify`, `npm run test:labs`) before merges
- Approve npm publishes and production deployments (no automated publish without approval)
- Enforce [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## How decisions are made

| Decision type                   | Process                                                  |
| ------------------------------- | -------------------------------------------------------- |
| Bug fixes, docs, tests, labs    | Maintainer review on PR; consensus preferred             |
| Public API or packaging changes | Discuss in issue first; changelog required               |
| npm publish / version bump      | Lead maintainer approval only                            |
| New maintainer                  | Proposal in issue or discussion; lead maintainer decides |
| Breaking changes                | Require migration notes; avoid unless necessary          |

Larger architectural changes (monorepo moves, new release systems) should be documented in an issue before implementation.

## How to become a maintainer

1. Contribute consistently (merged PRs, issue triage, lab improvements).
2. Demonstrate understanding of project scope and verification workflow.
3. Be nominated by an existing maintainer or self-nominate with evidence of contributions.
4. Lead maintainer adds entry to [MAINTAINERS.md](MAINTAINERS.md).

There is no minimum time commitment defined - maintainers should set expectations with the lead maintainer.

## Release approval

- **npm:** No package is published without explicit maintainer approval (see `docs/maintainers/manual-npm-settings.md` when published).
- **Website / GitHub Pages:** Production deploys run via `.github/workflows/deploy-pages.yml`; enabling Pages and the `github-pages` environment requires owner action.
- **Version policy:** Semantic versioning; see [ROADMAP.md](ROADMAP.md).

## Conflict resolution

1. Discuss in the relevant issue or PR thread.
2. If unresolved, lead maintainer makes a final decision.
3. Persistent Code of Conduct violations may result in a ban per [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Inactivity

If a listed maintainer is inactive for 12+ months with no communication, the lead maintainer may move them to **emeritus** status in [MAINTAINERS.md](MAINTAINERS.md). This is not punitive - roles can be restored on request.

## What this project does not govern

- University course policies or grading
- Third-party npm or GitHub terms of service
- Vehicle manufacturer diagnostic access rights

## Changes to governance

Propose edits to this file via pull request. Substantive changes should remain simple and reflect actual practice.

# Contributing to Embedded32

Thank you for helping make Embedded32 a reliable classroom and open-source platform for CAN, J1939, simulation, and diagnostics learning.

## Ways to contribute

- **Documentation** - guides, concepts, package READMEs, education materials
- **Labs** - new exercises under `labs/` with starter, solution, rubric, and instructor notes
- **Tests** - unit tests, lab verification, packaging smoke tests
- **Bug fixes** - packaging, CLI behavior, simulation correctness
- **Examples** - hardware-free demos under `examples/`
- **Issues** - clear bug reports and feature proposals

## Development setup

### Prerequisites

- Node.js **18+** and npm **9+**
- Git

### Clone and install

```bash
git clone https://github.com/Mukesh-SCS/Embedded32.git
cd Embedded32
npm ci
```

If `npm ci` fails due to lockfile drift, run `npm install` once and open an issue.

### Build and verify

```bash
npm run build
npm run verify
```

| Command                        | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `npm run lint`                 | ESLint                              |
| `npm run typecheck`            | TypeScript across packages          |
| `npm run test`                 | Package unit tests                  |
| `npm run test:labs`            | Classroom lab solution verification |
| `npm run audit:packages`       | Tarball packaging audit             |
| `npm run test:package-install` | Clean install smoke tests           |
| `npm run format:check`         | Prettier                            |

## Repository structure

```
Embedded32/
├── embedded32-*/          # @embedded32/* npm packages
├── apps/site/             # Documentation site (Next.js)
├── apps/demo/             # Client-side CAN/J1939 browser demo
├── labs/                  # Classroom labs
├── docs/                    # Human documentation + generated API
├── examples/              # Cross-package examples and traces
├── scripts/               # Maintainer automation
└── .github/               # Community templates and CI (Phase 7+)
```

Published import paths (`@embedded32/*`) must remain stable unless a breaking change is documented in `CHANGELOG.md`.

## Branch naming

| Prefix   | Use                |
| -------- | ------------------ |
| `feat/`  | New feature or lab |
| `fix/`   | Bug fix            |
| `docs/`  | Documentation only |
| `chore/` | Tooling, deps, CI  |
| `test/`  | Test-only changes  |

Example: `feat/lab-05-bridge-basics`

## Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

Optional body explaining why.
```

**Types:** `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `style`

**Examples:**

```
docs(education): add instructor troubleshooting section
fix(can): handle closed MockCANDriver in lab example
test(labs): assert Lab 03 minimum frame count
```

Keep documentation-only changes in separate commits from behavioral changes when possible.

## Running tests

```bash
# All package tests
npm run test

# Lab solutions (instructors and CI)
npm run test:labs

# Full gate (before opening a PR)
npm run verify
```

### Adding tests

- Place Jest tests in each package's `tests/` directory.
- Follow existing ESM patterns (`--experimental-vm-modules` where configured).
- For labs, update `expected-output/` and `scripts/verify-labs.mjs` when changing solution markers.
- Document why tests are skipped if a change cannot be tested.

## Updating documentation

- Root and package READMEs must stay honest - no false certification claims.
- Concept pages live in `docs/concepts/`.
- Course material lives in `docs/education/`.
- Regenerate API docs when public exports change: `npm run docs:api`.
- Run `npm run format` on edited markdown.

## Submitting a pull request

1. Fork the repository and create a branch from `main` (or the active integration branch).
2. Make focused changes with tests or documented test exceptions.
3. Run `npm run verify` and `npm run test:labs` when touching labs or docs examples.
4. Fill out the [pull request template](.github/pull_request_template.md).
5. Link related issues (`Fixes #123`).

Maintainers may request changes; please keep PRs reasonably scoped.

## Reporting bugs

Use the [bug report issue form](https://github.com/Mukesh-SCS/Embedded32/issues/new?template=bug.yml).

Include:

- Package affected and version
- Node.js version and OS
- Steps to reproduce
- Expected vs actual behavior
- Logs or terminal output

**Do not** post exploit details or private credentials in public issues - see [SECURITY.md](SECURITY.md).

## Proposing features

Use the [feature request issue form](https://github.com/Mukesh-SCS/Embedded32/issues/new?template=feature.yml).

Explain the teaching or engineering problem, proposed behavior, and alternatives considered.

## Creating educational labs

New labs should follow the structure in `labs/lab-01-can-basics/`:

```
labs/lab-NN-name/
  README.md
  starter/
  solution/
  expected-output/
  rubric.md
  instructor-notes.md
```

Requirements:

- Hardware-free unless clearly marked optional
- Runnable via `npx tsx` from repository root after `npm run build`
- Verification markers checked by `npm run test:labs`
- Honest scope notes for J1939 subset limitations

Use the [lab request issue form](https://github.com/Mukesh-SCS/Embedded32/issues/new?template=lab-request.yml) to propose new labs before opening a large PR.

## Becoming a maintainer

Embedded32 is maintained by a small core team. Maintainers are added when contributors demonstrate:

- Several merged PRs (code, docs, or labs)
- Reliable use of `npm run verify`
- Respect for project scope and honest documentation

See [GOVERNANCE.md](GOVERNANCE.md) and [MAINTAINERS.md](MAINTAINERS.md). Express interest by commenting on a relevant issue or discussion - there is no formal application form.

## Code of conduct

This project follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Be respectful, welcome newcomers, and focus on constructive feedback.

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).

## Questions

- [GitHub Discussions](https://github.com/Mukesh-SCS/Embedded32/discussions) - questions and ideas
- [SUPPORT.md](SUPPORT.md) - where to ask for help
- [Issues](https://github.com/Mukesh-SCS/Embedded32/issues) - bugs and features

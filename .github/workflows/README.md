# GitHub Actions workflows

| Workflow          | File                                             | Trigger             | Purpose                                                           |
| ----------------- | ------------------------------------------------ | ------------------- | ----------------------------------------------------------------- |
| CI                | [ci.yml](./ci.yml)                               | PR + push to `main` | Lint, format, test, build, audits, labs, examples, docs, coverage |
| Release           | [release.yml](./release.yml)                     | Manual only         | Verify + dry-run; publish only with `PUBLISH` + environment approval |
| Deploy Pages      | [deploy-pages.yml](./deploy-pages.yml)           | Push to `main` + manual | Build static site export and deploy to GitHub Pages           |
| CodeQL            | [codeql.yml](./codeql.yml)                       | PR, push, weekly    | Security and quality analysis (JS/TS)                             |
| Dependency review | [dependency-review.yml](./dependency-review.yml) | Pull requests       | Block new high-severity dependency vulnerabilities                |

Dependabot: [../dependabot.yml](../dependabot.yml)

## Supported Node.js versions

The full monorepo (including the Next.js 16 documentation site in `apps/site`, which
requires Node `>=20.9.0`) is verified on **Node 20 and Node 22**. The root `engines`
field declares `node >=20.9.0`.

Individual published libraries may still declare `node >=18` in their own
`package.json`; that library-only compatibility is not exercised by this
full-workspace CI and would need a separate package-only workflow (excluding
`apps/site`) to be validated.

## Local equivalent

```bash
npm ci
npm run verify
npm run test:coverage
```

## Required checks (after branch protection)

Enable in GitHub → Settings → Branches:

- `Verify (Node 20)`
- `Verify (Node 22)`
- `Verify (Windows, Node 20)`
- `Analyze JavaScript/TypeScript` (CodeQL)
- `Review dependencies` (on PRs)

See [manual-github-settings.md](../../docs/maintainers/manual-github-settings.md).

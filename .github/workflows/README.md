# GitHub Actions workflows

| Workflow          | File                                             | Trigger             | Purpose                                                           |
| ----------------- | ------------------------------------------------ | ------------------- | ----------------------------------------------------------------- |
| CI                | [ci.yml](./ci.yml)                               | PR + push to `main` | Lint, format, test, build, audits, labs, examples, docs, coverage |
| CodeQL            | [codeql.yml](./codeql.yml)                       | PR, push, weekly    | Security and quality analysis (JS/TS)                             |
| Dependency review | [dependency-review.yml](./dependency-review.yml) | Pull requests       | Block new high-severity dependency vulnerabilities                |

Dependabot: [../dependabot.yml](../dependabot.yml)

## Local equivalent

```bash
npm ci
npm run verify
npm run test:coverage
```

## Required checks (after branch protection)

Enable in GitHub → Settings → Branches:

- `Verify (Node 18)`
- `Verify (Node 20)`
- `Verify (Windows, Node 20)`
- `Analyze JavaScript/TypeScript` (CodeQL)
- `Review dependencies` (on PRs)

See [manual-github-settings.md](../../docs/maintainers/manual-github-settings.md).

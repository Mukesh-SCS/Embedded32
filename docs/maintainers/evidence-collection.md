# Evidence collection

How maintainers generate and commit verifiable metrics for the open-source education platform upgrade.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run evidence:collect` | Full snapshot (`verify` + `test:coverage` + counts) |
| `npm run evidence:collect -- --skip-verify` | Skip verify (faster) |
| `npm run evidence:collect -- --skip-verify --use-existing-coverage` | Use existing `coverage/coverage-summary.json` files |
| `npm run test:evidence` | Validate `metrics-latest.json` and snapshots |
| `npm run verify` | Includes `test:evidence` |

## Snapshot format (`embedded32-evidence-v1`)

Each JSON file includes:

```json
{
  "format": "embedded32-evidence-v1",
  "collectedAt": "ISO-8601 timestamp",
  "git": { "branch", "commit", "commitShort" },
  "verification": { "npmVerifyPassed", "verifySkipped" },
  "packages": { "publicCount", "directories" },
  "education": { "labCount", "labs", "syntheticTraceCount", "educationDocCount", "browserDemoPresent" },
  "documentation": { "markdownDocCount", "siteStaticRouteCount", "apiReferenceIndexPresent", "citationDocPresent" },
  "quality": { "coverage": { "collected", "packages": { "j1939", "core", "can" } } },
  "automation": { "workflowCount", "workflows", "rootScripts" },
  "deployment": { "githubPagesWorkflowPresent", "publishedUrl", "npmPublished" },
  "citation": { "cffPresent", "zenodoDoiIssued" },
  "notes": []
}
```

## When to collect

- End of each upgrade phase (or monthly on `main`)
- Before grant or conference reports citing platform maturity
- After adding labs, workflows, or major documentation changes

## Commit policy

Commit both:

- `evidence/metrics-latest.json`
- `evidence/snapshots/YYYY-MM-DD.json`

Do not commit secrets, student data, or private contracts. `verify-evidence.mjs` scans for common token patterns.

## Interpreting metrics honestly

| Metric | Honest use |
|--------|------------|
| `npmVerifyPassed: true` | Full local verify passed at collection time — not a substitute for CI badge |
| `siteStaticRouteCount` | Requires prior `apps/site` build; `null` if `out/` missing |
| `npmPublished: false` | Manual flag — set true only after maintainer-approved npm release |
| `zenodoDoiIssued: false` | Stays false until `CITATION.cff` contains a real `identifiers.doi` |
| Outreach numbers | Only in `evidence/outreach-log.md`, never fabricated in JSON |

## CI integration

`test:evidence` runs in `npm run verify` and checks structure of **committed** snapshots. It does not re-collect metrics on every CI run (avoids doubling verify runtime).

Optional: maintainers may run `evidence:collect` in a scheduled workflow later — not enabled by default.

## Related

- [evidence/README.md](../../evidence/README.md)
- [coverage-baseline.md](./coverage-baseline.md)
- [open-source-upgrade-summary.md](./open-source-upgrade-summary.md) (Phase 15)

# Evidence and adoption tracking

Verifiable metrics for the Embedded32 open-source education platform upgrade. Used for maintainer reporting, grant documentation, and honest progress reviews.

**Do not store private, confidential, or credential-bearing files in this folder.**

## Automated metrics

```bash
# Full snapshot (runs verify + coverage - slow)
npm run evidence:collect

# Fast snapshot (filesystem counts + existing coverage artifacts)
npm run evidence:collect -- --skip-verify --use-existing-coverage

# Validate committed evidence
npm run test:evidence
```

Outputs:

| File                        | Purpose                                          |
| --------------------------- | ------------------------------------------------ |
| `metrics-latest.json`       | Most recent snapshot (overwrite on each collect) |
| `snapshots/YYYY-MM-DD.json` | Dated archive (one file per collection day)      |

Snapshot format: `embedded32-evidence-v1` (see [maintainers/evidence-collection.md](../docs/maintainers/evidence-collection.md)).

## What is measured automatically

| Category          | Examples                                                               |
| ----------------- | ---------------------------------------------------------------------- |
| **Verification**  | Whether `npm run verify` passed when collected                         |
| **Packages**      | Count and names of public `@embedded32/*` packages                     |
| **Education**     | Lab count, synthetic traces, education docs, browser demo              |
| **Documentation** | Markdown doc count, site routes (if `apps/site/out` exists), API index |
| **Quality**       | Jest coverage for `j1939`, `core`, `can`                               |
| **Automation**    | GitHub workflow list, root npm scripts                                 |
| **Deployment**    | GitHub Pages workflow presence, published URL (not live ping)          |
| **Citation**      | `CITATION.cff` present, whether Zenodo DOI field exists                |

## What is **not** measured automatically

GitHub stars, npm download counts, classroom pilot enrollments, and survey feedback are recorded manually in [outreach-log.md](./outreach-log.md). Do not invent numbers - use `not recorded` until data exists.

## Maintainer workflow

1. After a major milestone or monthly review, run `npm run evidence:collect`.
2. Commit updated `metrics-latest.json` and the dated snapshot under `snapshots/`.
3. Update `outreach-log.md` with any external metrics you have permission to share.
4. Reference snapshots in reports using the collection date and git commit in the JSON.

## Related

- [docs/maintainers/evidence-collection.md](../docs/maintainers/evidence-collection.md)
- [docs/maintainers/coverage-baseline.md](../docs/maintainers/coverage-baseline.md)
- [docs/maintainers/baseline-status.md](../docs/maintainers/baseline-status.md)

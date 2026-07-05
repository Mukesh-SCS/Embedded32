# Release process

Embedded32 uses **Lerna fixed versioning** for the `@embedded32/*` npm scope. Releases are **manual and approval-gated** — nothing publishes from CI without an explicit maintainer action.

## Mechanism: Lerna (retained)

| Decision | Rationale |
|----------|-----------|
| **Keep Lerna** | Already manages 12 packages, fixed `1.0.0` version in `lerna.json`, and `lerna run build/test` is wired |
| **Do not add Changesets** | Would duplicate Lerna; increases release complexity for a small maintainer team |

Changesets may be reconsidered if packages need **independent versioning** later.

## Public packages (10)

These are published to npm when a release is approved:

- `@embedded32/can`, `@embedded32/core`, `@embedded32/j1939`, `@embedded32/sim`
- `@embedded32/tools`, `@embedded32/bridge`, `@embedded32/ethernet`, `@embedded32/supervisor`
- `@embedded32/cli`, `@embedded32/sdk-js`

**Not published:** `@embedded32/dashboard`, `@embedded32/sdk-c`, `@embedded32/sdk-python` (private).

## Pre-release checklist

From a clean checkout on `main` after CI is green:

```bash
npm ci
npm run release:dry-run
```

`release:dry-run` runs the full `npm run verify` suite, then `npm pack --dry-run` for each public package.

Faster local check (skips verify):

```bash
npm run build
npm run release:dry-run -- --skip-verify
```

Optional flags:

| Flag | Purpose |
|------|---------|
| `--tag latest` | Production dist-tag (default) |
| `--tag next` | Prerelease dist-tag |
| `--bump patch` | Show proposed patch version (does not modify files) |

## Versioning policy

- **Fixed monorepo version** — all public packages share one version in `lerna.json`
- **Semver** — patch for fixes, minor for features, major only for documented breaking changes
- **Internal deps** — `@embedded32/*` dependencies must match the release version (currently pinned `1.0.0`)

## Changelog

Update `CHANGELOG.md` under `[Unreleased]` before tagging:

- Added / Changed / Fixed / Deprecated / Removed / Security
- Breaking changes with migration notes
- Move `[Unreleased]` into a dated version section on release

## GitHub Release workflow

File: `.github/workflows/release.yml`

| Trigger | Behavior |
|---------|----------|
| `workflow_dispatch` | Always runs verify + dry-run |
| `confirm_publish: PUBLISH` | Additional publish job (requires `npm-publish` environment approval) |

**Default:** dry-run only. The publish job does not run unless the maintainer types `PUBLISH` **and** approves the GitHub Environment.

## Manual publish (local — discouraged)

Only if the workflow is unavailable:

```bash
npm ci
npm run verify
npm run release:dry-run -- --skip-verify
# After explicit maintainer approval:
npx lerna publish from-package --yes --dist-tag latest
```

Set provenance when publishing:

```bash
NPM_CONFIG_PROVENANCE=true npm publish
```

Lerna passes through npm config when configured.

## npm tags

| Tag | Use |
|-----|-----|
| `latest` | Stable releases |
| `next` | Prereleases (beta, RC) |

Do not republish an existing version to hide mistakes — deprecate on npm if needed.

## Post-release

1. Create GitHub Release with notes from `CHANGELOG.md`
2. Trigger Zenodo archive (see `docs/maintainers/zenodo-release.md` — Phase 12)
3. Update `docs/citation.md` when DOI is issued
4. Verify npm package pages show README + LICENSE

## Related docs

- [manual-npm-settings.md](./manual-npm-settings.md)
- [manual-github-settings.md](./manual-github-settings.md)
- [GOVERNANCE.md](../../GOVERNANCE.md)

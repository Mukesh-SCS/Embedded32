# Manual npm settings

Actions the **repository owner** must perform on [npmjs.com](https://www.npmjs.com) before the first approved release. The release workflow does **not** publish automatically during normal development.

## Account security

- [ ] Enable **two-factor authentication** (2FA) on the npm account
- [ ] Use an org or user account that owns the `@embedded32` scope
- [ ] Restrict publish tokens - prefer **trusted publishing** over long-lived tokens

## Trusted publishing (recommended)

Configure [npm trusted publishers](https://docs.npmjs.com/generating-provenance-statements) for GitHub Actions:

1. npm → Account / Org → **Trusted publishing**
2. Link repository `Mukesh-SCS/Embedded32`
3. Allow workflow: `Release` (`.github/workflows/release.yml`)
4. Enable **provenance** on publish

GitHub Environment `npm-publish` should require manual approval before the publish job runs.

## Scope and package ownership

Verify ownership of each public package before release:

| Package                  | Expected status             |
| ------------------------ | --------------------------- |
| `@embedded32/can`        | Owned by maintainer account |
| `@embedded32/core`       | Owned by maintainer account |
| `@embedded32/j1939`      | Owned by maintainer account |
| `@embedded32/sim`        | Owned by maintainer account |
| `@embedded32/tools`      | Owned by maintainer account |
| `@embedded32/bridge`     | Owned by maintainer account |
| `@embedded32/ethernet`   | Owned by maintainer account |
| `@embedded32/supervisor` | Owned by maintainer account |
| `@embedded32/cli`        | Owned by maintainer account |
| `@embedded32/sdk-js`     | Owned by maintainer account |

If packages already exist on npm from prior publishes:

- [ ] Review tarball contents on npm for each version
- [ ] Compare with local `npm run release:dry-run` output
- [ ] **Deprecate** broken versions with a message - do not delete versions to hide errors

## CLI binaries

| Package             | Binary             |
| ------------------- | ------------------ |
| `@embedded32/cli`   | `embedded32`       |
| `@embedded32/tools` | `embedded32-tools` |

Confirm `npx embedded32 --help` and `npx embedded32-tools --help` after publish.

## Pre-publish verification (every release)

```bash
npm ci
npm run release:dry-run
```

Must pass before any publish approval.

## Publish approval protocol

1. CI green on `main`
2. `release:dry-run` passes locally or in GitHub Actions
3. `CHANGELOG.md` updated
4. Lead maintainer approves GitHub Environment `npm-publish`
5. Run Release workflow with `confirm_publish: PUBLISH`

**Never** run `lerna publish` or `npm publish` from a laptop without the dry-run checklist.

## Provenance

Publish with provenance statements:

```bash
NPM_CONFIG_PROVENANCE=true
```

The GitHub release workflow sets this for the publish job when trusted publishing is configured.

## Deprecation policy

- Use `npm deprecate @embedded32/<pkg>@<version> "<message>"` for bad releases
- Do not unpublish except within npm's short unpublish window for accidents
- Document deprecations in `CHANGELOG.md` Security / Fixed sections

## Secrets (if not using trusted publishing)

Only if trusted publishing is unavailable:

- [ ] Create a granular **Automation** token with publish scope for `@embedded32/*`
- [ ] Store as GitHub secret `NPM_TOKEN` on Environment `npm-publish`
- [ ] Rotate token periodically

Prefer trusted publishing - avoid permanent tokens in repository secrets.

## Post-publish

- [ ] Verify download counts are not confused with monorepo `npm install` in development
- [ ] Confirm package `repository.directory` links resolve on GitHub
- [ ] Announce release in GitHub Discussions (optional)

## Related

- [release-process.md](./release-process.md)
- [repository-audit.md](./repository-audit.md)

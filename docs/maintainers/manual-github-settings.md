# Manual GitHub repository settings

Actions the **repository owner** must perform in the GitHub web UI. These cannot be applied from this repository alone.

## Community and collaboration

- [ ] **Enable Issues** — Settings → General → Features → Issues
- [ ] **Enable Discussions** — Settings → General → Features → Discussions (categories: General, Q&A, Ideas, Show and tell)
- [ ] **Enable private vulnerability reporting** — Security → Private vulnerability reporting → Enable
- [ ] Add repository **description** and **website URL** when `apps/site` is deployed
- [ ] Add **topics:** `embedded-systems`, `can-bus`, `j1939`, `ecu`, `typescript`, `education`, `simulation`, `automotive`

## Branch protection (after CI exists — Phase 7)

- [ ] Protect `main` (or default integration branch)
- [ ] Require pull request before merging
- [ ] Require status checks: `ci` workflow (once added)
- [ ] Require branches to be up to date before merge
- [ ] Do not allow force pushes to `main`

## Security and dependencies

- [ ] Enable **Dependabot alerts** — Settings → Security → Code security
- [ ] Enable **Dependabot security updates** (optional grouping)
- [ ] Enable **secret scanning** and **push protection** if available for the account/org
- [ ] Review default **Actions** permissions (read-only for GITHUB_TOKEN unless workflows need write)

## Social preview

- [ ] Upload a **social preview image** (Repository settings → Social preview)
- [ ] Use original artwork — do not copy third-party automotive branding

## Labels (for contributor issues)

Create labels matching project needs:

| Label              | Color suggestion | Purpose                  |
| ------------------ | ---------------- | ------------------------ |
| `good first issue` | `#7057ff`        | Starter tasks            |
| `help wanted`      | `#008672`        | Needs contributor        |
| `documentation`    | `#0075ca`        | Docs only                |
| `education`        | `#d4c5f9`        | Labs and course material |
| `testing`          | `#fef2c0`        | Test coverage            |
| `package`          | `#bfdadc`        | npm packaging            |
| `bug`              | `#d73a4a`        | Defects                  |
| `enhancement`      | `#a2eeef`        | Features                 |
| `discussion`       | `#cfd3d7`        | Needs design input       |

## Issue forms

After merging Phase 6, verify forms render: Issues → New issue → choose template.

## CODEOWNERS

After merge, confirm [@Mukesh-SCS](https://github.com/Mukesh-SCS) receives review requests on pull requests.

## Vercel (Phase 11)

- [ ] Connect repository to Vercel
- [ ] Set root directory to `apps/site`
- [ ] Configure preview deployments for pull requests

## Zenodo (Phase 12)

- [ ] Connect GitHub account to Zenodo
- [ ] Enable this repository for archiving on release
- [ ] Add DOI badge to README after first archive

## npm publish environment (Phase 8)

Before the first npm release:

- [ ] Settings → Environments → create **`npm-publish`**
- [ ] Add **required reviewers** (lead maintainer minimum)
- [ ] Restrict deployment branches to `main` (optional)
- [ ] Configure npm **trusted publishing** (see [manual-npm-settings.md](./manual-npm-settings.md))
- [ ] Add `NPM_TOKEN` secret only if trusted publishing is unavailable

The [Release workflow](../../.github/workflows/release.yml) runs dry-run by default. The publish job runs only when `confirm_publish` is exactly `PUBLISH` **and** the environment is approved.

## Verification checklist

After completing settings:

1. Open a test issue using the bug template
2. Confirm Discussions tab is visible
3. Confirm Security → Advisories allows private reports
4. Confirm branch protection blocks direct pushes (if enabled)

Document completion date in a maintainer note or project discussion — do not store credentials in the repo.

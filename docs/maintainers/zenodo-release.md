# Zenodo release and DOI workflow

Embedded32 uses [Zenodo](https://zenodo.org) to mint **version-specific DOIs** for GitHub releases. This is a **maintainer-only** process — nothing is archived automatically until Zenodo is connected and a release is published.

## Current status

| Item | Status |
|------|--------|
| `CITATION.cff` in repository | **Present** — no DOI field until Zenodo issues one |
| Zenodo GitHub integration | **Owner action required** |
| Concept DOI (all versions) | **Not issued** |
| Version DOI for v1.0.0 | **Not issued** |

Do **not** add a placeholder or fabricated DOI to `CITATION.cff`, `docs/citation.md`, or the README.

## One-time Zenodo setup (owner)

1. Sign in to [zenodo.org](https://zenodo.org) with your GitHub account ([@Mukesh-SCS](https://github.com/Mukesh-SCS)).
2. Go to **Account** → **GitHub** → enable access for the `Mukesh-SCS/Embedded32` repository.
3. On Zenodo, open **Upload** → **New upload** is not needed yet — instead use the **GitHub** tab to toggle **ON** for `Embedded32`.
4. Confirm Zenodo will create a new deposition on each **GitHub Release** (not on every tag push unless configured).

See also [manual-github-settings.md](./manual-github-settings.md) (Zenodo checklist).

## Per-release archive workflow

After a tagged GitHub Release is created (see [release-process.md](./release-process.md)):

1. **Create the GitHub Release** on `main` with notes from `CHANGELOG.md`.
2. Zenodo detects the release and drafts a deposition (usually within minutes).
3. Open the draft on Zenodo and review metadata:
   - **Title:** Embedded32 (match `CITATION.cff`)
   - **Authors:** Mukesh Mani Tripathi
   - **Description:** Use the abstract from `CITATION.cff` or release notes
   - **License:** MIT
   - **Version:** Match the Git tag (e.g. `v1.0.0`)
   - **Related identifier:** Link to `https://github.com/Mukesh-SCS/Embedded32`
4. **Publish** the deposition on Zenodo to mint the version DOI.
5. Copy the issued DOI (format `10.5281/zenodo.XXXXXXX`).

## Update repository citation files

When a real DOI is issued, update these files in one commit:

### `CITATION.cff`

Add under `identifiers`:

```yaml
identifiers:
  - type: doi
    value: 10.5281/zenodo.XXXXXXX
```

Update `version` and `date-released` to match the release. Refresh `preferred-citation` to include the DOI URL `https://doi.org/10.5281/zenodo.XXXXXXX`.

### `docs/citation.md`

- Replace the DOI status table with the issued concept and version DOIs.
- Update BibTeX `doi = {10.5281/zenodo.XXXXXXX}` and remove `note = {DOI pending ...}`.
- Add the APA line with DOI URL.

### `README.md`

Add the Zenodo badge (replace `XXXXXXX` with the record id):

```markdown
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXXXX)
```

Place it near the citation section, not at the top of the README unless the DOI is stable.

## Concept DOI vs version DOI

| Type | Purpose |
|------|---------|
| **Concept DOI** | Resolves to the latest Zenodo record for the project — cite when you want “Embedded32” generally |
| **Version DOI** | Points to one GitHub Release snapshot — cite for reproducibility |

Instructors should cite the **version DOI** (or tag + commit) when assigning labs so students reproduce the same materials.

## Verification after DOI update

```bash
npm run test:citation
npm run verify
```

`scripts/verify-citation.mjs` ensures `CITATION.cff` parses, required fields exist, and no placeholder DOI slipped in.

## What Zenodo archives

Zenodo receives the **GitHub Release tarball** (repository snapshot at the tag). It does not separately archive:

- npm packages (publish via Lerna separately)
- GitHub Pages build artifacts (deployed via `deploy-pages.yml`)

Document in the Zenodo description that the software is a TypeScript monorepo with labs, docs site source, and npm packages.

## Troubleshooting

| Problem | Action |
|---------|--------|
| Zenodo did not create a draft | Confirm GitHub integration is ON for this repo; release must be a GitHub Release, not only a tag |
| Wrong files in archive | Zenodo uses GitHub’s release asset; tag the correct commit before releasing |
| Duplicate deposition | Do not re-publish the same version; edit metadata on Zenodo or create a patch release |
| DOI not showing on GitHub | GitHub reads `CITATION.cff` — add `identifiers` with type `doi` after Zenodo publish |

## Related

- [docs/citation.md](../citation.md) — public citation guide
- [release-process.md](./release-process.md) — npm and GitHub release order
- [CITATION.cff](../../CITATION.cff) — machine-readable metadata

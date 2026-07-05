# Embedded32 documentation site

Next.js documentation website for labs, guides, packages, and API reference.

## Local development

From monorepo root (API docs must exist first):

```bash
npm ci
npm run build
npm run docs:api
cd apps/site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
cd apps/site
npm run build
npm run start
```

`npm run build` runs `scripts/sync-content.mjs`, which copies `docs/api/` into `public/api-ref/`.

## Verification

From monorepo root:

```bash
npm run test:docs
```

Includes `apps/site` production build when `package.json` is present.

## Deployment

Deployed to **GitHub Pages** via `.github/workflows/deploy-pages.yml`. Full runbook:
[docs/deployment/GITHUB_PAGES.md](../../docs/deployment/GITHUB_PAGES.md).

| Setting          | Value                                      |
| ---------------- | ------------------------------------------ |
| Framework        | Next.js static export (`output: 'export'`) |
| Build command    | `npm run build --workspace apps/site`      |
| Output directory | `apps/site/out`                            |
| Base path        | `/Embedded32` (production)                 |
| Published URL    | `https://mukesh-scs.github.io/Embedded32/` |

The workflow runs `npm run docs:api` before the site build and validates the export with
`node scripts/verify-pages-build.mjs`. Vercel is not used.

## Content sources

| Route         | Source                                           |
| ------------- | ------------------------------------------------ |
| `/docs/*`     | `docs/**/*.md` (excludes `maintainers/`, `api/`) |
| `/labs/*`     | `labs/lab-*/README.md`                           |
| `/packages/*` | `embedded32-*/README.md`                         |
| `/api-ref/*`  | Copied from `docs/api/` (TypeDoc)                |
| `/demo`       | Placeholder until Phase 10                       |

Maintainer-only docs remain in `docs/maintainers/` and are not published on this site.

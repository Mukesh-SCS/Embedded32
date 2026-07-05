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

Production deployment to Vercel is documented in Phase 11. **Do not deploy without maintainer approval.**

Suggested Vercel settings:

| Setting | Value |
|---------|-------|
| Root directory | `apps/site` |
| Build command | `npm run build` |
| Install command | `npm install` (run `docs:api` in a prebuild step or commit synced API HTML) |

For CI builds, `test:docs` generates API docs before the site build.

## Content sources

| Route | Source |
|-------|--------|
| `/docs/*` | `docs/**/*.md` (excludes `maintainers/`, `api/`) |
| `/labs/*` | `labs/lab-*/README.md` |
| `/packages/*` | `embedded32-*/README.md` |
| `/api-ref/*` | Copied from `docs/api/` (TypeDoc) |
| `/demo` | Placeholder until Phase 10 |

Maintainer-only docs remain in `docs/maintainers/` and are not published on this site.

# GitHub Pages deployment

The Embedded32 documentation site (`apps/site/`) is deployed to **GitHub Pages** via GitHub Actions. Vercel is not used.

## Published URL

```text
https://mukesh-scs.github.io/Embedded32/
```

Because this is a **project site** (not a user/org root site), all assets are served under the `/Embedded32/` base path.

## Framework and output

| Property         | Value                                 |
| ---------------- | ------------------------------------- |
| Framework        | Next.js 15 (App Router)               |
| Mode             | Static export (`output: 'export'`)    |
| Build command    | `npm run build --workspace apps/site` |
| Output directory | `apps/site/out`                       |
| Base path        | `/Embedded32` (production only)       |
| Asset prefix     | `/Embedded32/` (production only)      |

Every route is pre-rendered to static HTML (`trailingSlash: true`), so nested routes work without a client-side router fallback. The workflow still copies `index.html` to `404.html` as a safety net.

## Workflow

| Item        | Value                                             |
| ----------- | ------------------------------------------------- |
| File        | `.github/workflows/deploy-pages.yml`              |
| Name        | `Deploy Embedded32 Documentation to GitHub Pages` |
| Environment | `github-pages`                                    |

### Triggers

- Push to `main` touching: `apps/site/**`, `apps/demo/**`, `docs/**`, `labs/**`, `embedded32-*/README.md`, the workflow file, or root manifests
- Manual `workflow_dispatch`

### Steps

1. Checkout
2. `actions/configure-pages`
3. Node 20 + `npm ci`
4. `npm run docs:api` (builds workspace packages via `predocs:api`, then generates TypeDoc under `docs/api/`, synced into `public/api-ref/`)
5. `npm run build --workspace apps/site` (static export to `apps/site/out`)
6. `node scripts/verify-pages-build.mjs` (build validation)
7. Copy `index.html` → `404.html` fallback
8. Upload `apps/site/out` as the Pages artifact
9. `actions/deploy-pages` publishes it (up to 3 attempts with backoff on transient Pages API failures)

## Local commands

Development server (base path disabled locally):

```bash
npm ci
npm run docs:api
npm run dev --workspace apps/site
# http://localhost:3000
```

Production build (same as CI):

```bash
npm ci
npm run docs:api
npm run build --workspace apps/site
node scripts/verify-pages-build.mjs
```

Preview the production export locally:

```bash
npx serve apps/site/out
```

## Base-path configuration

Configured in `apps/site/next.config.ts`:

```ts
const isProduction = process.env.NODE_ENV === 'production';
const REPO_BASE = '/Embedded32';

const nextConfig = {
  output: 'export',
  basePath: isProduction ? REPO_BASE : '',
  assetPrefix: isProduction ? `${REPO_BASE}/` : '',
  images: { unoptimized: true },
  trailingSlash: true,
  transpilePackages: ['@embedded32/demo'],
  env: { NEXT_PUBLIC_BASE_PATH: isProduction ? REPO_BASE : '' },
};
```

- `<Link>` and `next/image` prefix the base path automatically.
- Raw `<a href>` and asset URLs (e.g. inside rendered markdown, or links to the static
  `/api-ref/` TypeDoc HTML) use the `withBasePath()` helper in `apps/site/src/lib/basePath.ts`.
- Never hardcode `/Embedded32/` in source; use the helper so local dev still works.

## Owner setup (one-time, GitHub UI)

1. Open the GitHub repository.
2. Go to **Settings**.
3. Open **Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Go to the **Actions** tab.
6. Run **Deploy Embedded32 Documentation to GitHub Pages** (via **Run workflow**).
7. Confirm the deployment environment is named `github-pages`.
8. Verify the public URL:

   ```text
   https://mukesh-scs.github.io/Embedded32/
   ```

## Running the workflow manually

Actions → **Deploy Embedded32 Documentation to GitHub Pages** → **Run workflow** → branch `main`.

## Testing nested routes

After deploy, open these directly (and refresh each):

```text
https://mukesh-scs.github.io/Embedded32/docs/getting-started/
https://mukesh-scs.github.io/Embedded32/labs/
https://mukesh-scs.github.io/Embedded32/packages/
https://mukesh-scs.github.io/Embedded32/demo/
```

Refreshing must not produce a GitHub Pages 404 - each route is a real static HTML file.

## Diagnosing failures

| Symptom                             | Likely cause                                    | Fix                                                                           |
| ----------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| CSS/JS 404, unstyled page           | Assets not under `/Embedded32/`                 | Confirm `basePath`/`assetPrefix`; production build uses `NODE_ENV=production` |
| Blank page, console 404 on `_next/` | Base path missing                               | Rebuild with `npm run build --workspace apps/site`                            |
| Nested route 404 on refresh         | Missing static HTML                             | Ensure `generateStaticParams` covers the route; `trailingSlash: true`         |
| `verify-pages-build` fails          | Missing `out/`, `api-ref/`, or bad asset prefix | Run `npm run docs:api` then rebuild                                           |
| Deploy step: "try again later"      | Transient GitHub Pages API failure              | Workflow retries deploy up to 3 times; rerun failed jobs if all attempts fail |
| Deploy step skipped                 | Pages source not set to GitHub Actions          | Settings → Pages → Source = GitHub Actions                                    |

## Static-only constraints

GitHub Pages hosts **static files only**. The site must not attempt to run or connect to:

- Node.js servers, WebSocket servers, SocketCAN bridges, MQTT brokers, databases
- Server-side API routes, secrets, or hardware interfaces

The browser demo (`apps/demo/`) is fully client-side: synthetic traces, client-side decoding, no network I/O. Any local-only connection (e.g. `ws://localhost:...` to a dev dashboard) must be clearly labeled as optional local development and must never be baked into the deployed bundle.

## Custom domain (later)

To use a custom domain:

1. Add a `CNAME` file to `apps/site/public/` containing the domain (e.g. `docs.embedded32.dev`).
2. Configure DNS: a `CNAME` record pointing to `mukesh-scs.github.io`.
3. In Settings → Pages, set the custom domain and enable **Enforce HTTPS**.
4. Update `REPO_BASE` handling: a root custom domain serves from `/`, so set `basePath`/`assetPrefix`
   to empty in production when a custom domain is active.

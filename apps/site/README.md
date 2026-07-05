# Embedded32 documentation site

Neo-brutalist education platform built with **Next.js static export** for GitHub Pages at `/Embedded32/`.

## Design system

Components live in `src/components/ui/`:

- `BrutalButton`, `BrutalCard`, `Badge`, `Callout`, `CodePanel`, `MetricBlock`, `SectionHeading`, `StatusStrip`
- Tokens in `src/app/globals.css` (ink/paper/yellow/cyan, hard borders, offset shadows)
- System font stacks only (no external font downloads)

## Local development

```bash
npm ci
npm run build
npm run docs:api
cd apps/site && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
cd apps/site && npm run build
```

Output: `apps/site/out/` - synced to GitHub Pages by CI.

## Demo

Interactive CAN/J1939 demo at `/demo`. See [`apps/demo/README.md`](../demo/README.md).

## Testing

```bash
npm run test:e2e        # Playwright against /Embedded32/ export
npm run verify:pages    # Static export validation
```

Accessibility: `@axe-core/playwright` checks serious/critical violations on the homepage.

## Deployment

GitHub Pages serves the static export from `.github/workflows/deploy-pages.yml` (unchanged base path `/Embedded32/`).

Do **not** commit `apps/site/.next/` or `apps/site/out/`.

## Screenshots

After redesign: see `docs/screenshots/redesign/`.

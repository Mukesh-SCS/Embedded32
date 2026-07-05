# API reference

Generated TypeDoc HTML for all ten published `@embedded32/*` packages.

## Generate locally

From repository root (after `npm install` and `npm run build`):

```bash
npm run docs:api
```

Output is written to this directory. Open [index.html](./index.html) in a browser.

## Packages documented

- `@embedded32/can`
- `@embedded32/core`
- `@embedded32/j1939`
- `@embedded32/sim`
- `@embedded32/ethernet`
- `@embedded32/bridge`
- `@embedded32/supervisor`
- `@embedded32/cli`
- `@embedded32/tools`
- `@embedded32/sdk-js`

Private packages (`dashboard`, `sdk-c`, `sdk-python`) are excluded.

## Regeneration

Re-run `npm run docs:api` after public API changes. Commit updated HTML when documentation releases are intentional (site deployment is Phase 9).

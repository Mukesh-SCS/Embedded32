# Monorepo workflow

Root commands for developing Embedded32 from a clean checkout.

## Prerequisites

- Node.js >= 18
- npm >= 9

```bash
npm ci
```

## Daily development

| Command                        | Purpose                                              |
| ------------------------------ | ---------------------------------------------------- |
| `npm run build`                | Compile all Lerna-managed packages                   |
| `npm run test`                 | Run package unit tests                               |
| `npm run typecheck`            | TypeScript `--noEmit` in every package               |
| `npm run lint`                 | ESLint across TypeScript sources                     |
| `npm run format`               | Apply Prettier formatting                            |
| `npm run format:check`         | Verify Prettier formatting without writing           |
| `npm run audit:packages`       | Verify npm tarball contents                          |
| `npm run test:package-install` | Smoke-test tarball installs                          |
| `npm run test:labs`            | Verify classroom lab solutions and hygiene           |
| `npm run test:examples`        | Run key examples after build                         |
| `npm run test:docs`            | Generate API docs and build `apps/site`                               |
| `npm run test:coverage`        | Coverage report for j1939, core, can                 |
| `npm run verify`               | Full pre-merge check (includes labs, examples, docs) |

## Workspace layout

- **npm workspaces** — dependency linking across `embedded32-*` packages
- **Lerna** — orchestrates `build`, `test`, and `typecheck` across packages (includes `embedded32-dashboard`)
- **Shared TypeScript** — `tsconfig.base.json`, `tsconfig.node16.json`, `tsconfig.commonjs.json`

Package paths are unchanged from the original repository layout. Published import paths (`@embedded32/*`) are unchanged.

## Package groups

| Profile             | Packages                          | Module system               |
| ------------------- | --------------------------------- | --------------------------- |
| Node ESM (Node16)   | `can`, `j1939`, `bridge`, `tools` | `import` / `type: module`   |
| Node ESM (bundler)  | `core`                            | ESM with bundler resolution |
| Node ESM (legacy)   | `sim`                             | ESNext + node resolution    |
| Node ESM (NodeNext) | `sdk-js`                          | NodeNext                    |
| Node CommonJS       | `ethernet`, `supervisor`, `cli`   | `require`                   |
| Browser (Vite)      | `dashboard`                       | React + `noEmit` typecheck  |
| Non-TypeScript      | `sdk-c`, `sdk-python`             | stub scripts only           |

## Platform directories

| Path                 | Phase | Purpose                                       |
| -------------------- | ----- | --------------------------------------------- |
| `apps/site/`         | 9     | Documentation website (Next.js static export) |
| `apps/demo/`         | 10    | Client-side CAN/J1939 browser demo modules    |
| `labs/`              | 5     | Classroom labs (four complete labs)           |
| `docs/education/`    | 5     | Instructor and student guides                 |
| `examples/traces/`   | 5     | Synthetic sample bus traces                   |
| `docs/api/`          | 4     | Generated API reference                       |
| `docs/deployment/`   | 11    | GitHub Pages deployment runbook               |
| `.github/workflows/` | 7, 11 | CI, CodeQL, dependency review, Pages deploy   |

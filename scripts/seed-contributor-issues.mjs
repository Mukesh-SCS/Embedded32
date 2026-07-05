#!/usr/bin/env node
/**
 * Create contributor-friendly GitHub issues from the Phase 1–5 audit backlog.
 * Requires: gh CLI authenticated (`gh auth login`)
 *
 * Usage: node scripts/seed-contributor-issues.mjs
 * Dry run: node scripts/seed-contributor-issues.mjs --dry-run
 */

import { spawnSync } from 'node:child_process';

const DRY_RUN = process.argv.includes('--dry-run');

const ISSUES = [
  {
    title: 'Add GitHub Actions CI workflow running npm run verify',
    labels: ['enhancement', 'help wanted'],
    body: `## Summary
Add \`.github/workflows/ci.yml\` to run on pull requests and pushes to \`main\`.

## Tasks
- Checkout, Node 18 setup, \`npm ci\`
- \`npm run lint\`, \`format:check\`, \`typecheck\`, \`test\`, \`build\`
- \`npm run audit:packages\`, \`test:package-install\`, \`test:labs\`

## Context
Phase 7 deliverable; blocks branch protection in manual GitHub settings.

## Acceptance
CI passes from a clean clone on Windows and Linux runners.`,
  },
  {
    title: 'Include test:labs in root npm run verify',
    labels: ['good first issue', 'testing', 'education'],
    body: `## Summary
Extend root \`verify\` script to run \`npm run test:labs\` after package smoke tests.

## Why
Classroom lab solutions should not regress silently.

## Files
- \`package.json\` scripts.verify
- \`docs/maintainers/monorepo-workflow.md\`

## Acceptance
\`npm run verify\` fails when a lab solution marker is broken.`,
  },
  {
    title: 'Add React component tests for embedded32-dashboard',
    labels: ['testing', 'help wanted'],
    body: `## Summary
Replace dashboard test stub with meaningful component tests (e.g. CAN frame list, DM1 viewer).

## Context
Dashboard is private but included in Lerna; test script currently stubs.

## Suggested approach
- Vitest or Jest + React Testing Library
- Mock WebSocket data from \`src/services/ws.ts\`

## Acceptance
\`npm run test\` in dashboard package runs real assertions.`,
  },
  {
    title: 'Expand @embedded32/bridge integration test coverage',
    labels: ['testing', 'package'],
    body: `## Summary
Bridge package has minimal placeholder tests. Add tests for rule engine routing and MQTT/Ethernet config validation.

## Packages
\`@embedded32/bridge\`

## Acceptance
At least one test exercises \`RuleEngine\` forward/drop decisions with sample PGN filters.`,
  },
  {
    title: 'Add CLI utility to replay examples/traces JSON files',
    labels: ['enhancement', 'education', 'good first issue'],
    body: `## Summary
Create a small script or \`embedded32-tools\` subcommand to read \`examples/traces/*.json\` and decode frames with \`@embedded32/j1939\`.

## Why
Supports instructor demos and future browser demo (Phase 10).

## Acceptance
\`normal-operation.json\` replays with deterministic console output; documented in \`examples/traces/README.md\`.`,
  },
  {
    title: 'Resolve TypeDoc unsupported TypeScript version warning',
    labels: ['documentation', 'package'],
    body: `## Summary
\`npm run docs:api\` warns that TypeDoc does not officially support the repo TypeScript version.

## Options
- Pin TypeScript to a supported 5.x minor for docs
- Upgrade TypeDoc when compatible
- Document the warning in \`docs/api/README.md\` if benign

## Acceptance
\`npm run docs:api\` completes without errors; warning addressed or documented.`,
  },
  {
    title: 'Align sdk-python and sdk-c package metadata with monorepo',
    labels: ['documentation', 'package'],
    body: `## Summary
Private SDK packages may still reference outdated repository URLs or lack build documentation.

## Tasks
- Verify \`repository.directory\` fields
- Add pointers to CMake/pytest docs in README
- Note publish status (not on npm/PyPI yet)

## Acceptance
README accurately describes build steps from this monorepo.`,
  },
  {
    title: 'Build browser educational demo under apps/demo',
    labels: ['enhancement', 'education'],
    body: `## Summary
Implement Phase 10 browser demo: CAN viewer, J1939 decoder, ECU visualization, scenario selector using prerecorded traces.

## Constraints
- No fake SocketCAN in browser
- Deterministic scenarios from \`examples/traces/\`

## Acceptance
\`apps/demo\` builds locally; mobile-friendly layout.`,
  },
  {
    title: 'Build documentation website under apps/site',
    labels: ['enhancement', 'documentation'],
    body: `## Summary
Phase 9 Next.js site with docs, packages, labs, and demo routes.

## Pages
See project plan: /docs, /labs, /packages, /demo, /contribute

## Acceptance
Production build command documented; no unverified adoption claims on homepage.`,
  },
  {
    title: 'Add code coverage reporting with honest baseline',
    labels: ['testing', 'enhancement'],
    body: `## Summary
Measure Jest coverage for core libraries (\`j1939\`, \`core\`, \`can\`) and publish baseline in CI.

## Policy
Record current coverage; prevent decreases before enforcing high thresholds.

## Acceptance
Coverage artifact or summary in CI logs; documented in maintainer docs.`,
  },
  {
    title: 'Reduce ESLint warning backlog in legacy packages',
    labels: ['good first issue', 'help wanted'],
    body: `## Summary
Root \`npm run lint\` passes with zero errors but many warnings in CLIs and simulators.

## Approach
Fix warnings package-by-package without behavior changes.

## Acceptance
Warning count decreases; no new errors introduced.`,
  },
  {
    title: 'Add Dependabot and CodeQL GitHub workflows',
    labels: ['enhancement', 'help wanted'],
    body: `## Summary
Phase 7 security automation: \`.github/dependabot.yml\` and \`codeql.yml\`.

## Acceptance
Weekly dependency PRs grouped where practical; CodeQL runs on TypeScript/JavaScript.`,
  },
];

function gh(args) {
  const result = spawnSync('gh', args, { encoding: 'utf8', shell: process.platform === 'win32' });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status ?? 1,
  };
}

function main() {
  const auth = gh(['auth', 'status']);
  if (!auth.ok) {
    console.error('gh CLI not authenticated. Run: gh auth login');
    console.error('Or create issues manually from docs/maintainers/seed-issues.md');
    process.exit(1);
  }

  let created = 0;
  for (const issue of ISSUES) {
    const args = ['issue', 'create', '--title', issue.title, '--body', issue.body];
    for (const label of issue.labels) {
      args.push('--label', label);
    }
    if (DRY_RUN) {
      console.log(`[dry-run] would create: ${issue.title} [${issue.labels.join(', ')}]`);
      created++;
      continue;
    }
    const result = gh(args);
    if (result.ok) {
      console.log(result.stdout.trim());
      created++;
    } else {
      console.error(`Failed: ${issue.title}`);
      console.error(result.stderr || result.stdout);
    }
  }
  console.log(`\n${DRY_RUN ? 'Planned' : 'Created'} ${created}/${ISSUES.length} issues`);
}

main();

#!/usr/bin/env node
/**
 * Generate apps/demo/src/traces.ts from the canonical synthetic traces in examples/traces/.
 * Keeps the browser demo free of any filesystem/runtime dependency on the monorepo root.
 *
 * Run from monorepo root:  node apps/demo/scripts/generate-traces.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEMO_ROOT = path.resolve(__dirname, '..');
const MONOREPO_ROOT = path.resolve(DEMO_ROOT, '../..');
const TRACES_DIR = path.join(MONOREPO_ROOT, 'examples', 'traces');
const OUT_FILE = path.join(DEMO_ROOT, 'src', 'traces.ts');

const ORDER = [
  'normal-operation',
  'engine-overheat',
  'sensor-failure',
  'high-bus-load',
  'address-conflict',
  'multi-packet-message',
];

function loadTraces() {
  const files = fs.readdirSync(TRACES_DIR).filter((f) => f.endsWith('.json'));
  const traces = files.map((file) => JSON.parse(fs.readFileSync(path.join(TRACES_DIR, file), 'utf8')));
  traces.sort((a, b) => {
    const ai = ORDER.indexOf(a.scenario);
    const bi = ORDER.indexOf(b.scenario);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return traces;
}

function main() {
  const traces = loadTraces();
  const banner = `// AUTO-GENERATED from examples/traces/ by apps/demo/scripts/generate-traces.mjs\n// Do not edit by hand — run \`node apps/demo/scripts/generate-traces.mjs\` to refresh.\n`;
  const body = `import type { Trace } from './types';\n\nexport const TRACES: Trace[] = ${JSON.stringify(traces, null, 2)};\n\nexport function getTrace(scenario: string): Trace | undefined {\n  return TRACES.find((t) => t.scenario === scenario);\n}\n`;
  fs.writeFileSync(OUT_FILE, `${banner}\n${body}`);
  console.log(`generate-traces: wrote ${traces.length} traces to src/traces.ts`);
}

main();

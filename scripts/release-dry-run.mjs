#!/usr/bin/env node
/**
 * Release dry-run — reports what would be published without publishing anything.
 *
 * Usage:
 *   node scripts/release-dry-run.mjs
 *   node scripts/release-dry-run.mjs --skip-verify
 *   node scripts/release-dry-run.mjs --tag next --bump patch
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function parseArgs(argv) {
  const opts = {
    skipVerify: false,
    tag: 'latest',
    bump: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--skip-verify') opts.skipVerify = true;
    else if (arg === '--tag' && argv[i + 1]) opts.tag = argv[++i];
    else if (arg === '--bump' && argv[i + 1]) opts.bump = argv[++i];
  }
  return opts;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function run(command, args, cwd = ROOT) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

function isPublicPackage(pkgJson) {
  if (pkgJson.private === true) return false;
  if (pkgJson.name?.startsWith('@embedded32/')) return true;
  return pkgJson.publishConfig?.access === 'public';
}

function discoverPublicPackages() {
  const rootPkg = readJson(path.join(ROOT, 'package.json'));
  return (rootPkg.workspaces ?? [])
    .map((entry) => {
      const dir = path.join(ROOT, entry);
      const pkgPath = path.join(dir, 'package.json');
      if (!fs.existsSync(pkgPath)) return null;
      const pkgJson = readJson(pkgPath);
      if (!isPublicPackage(pkgJson)) return null;
      return { dir, entry, pkgJson, pkgPath };
    })
    .filter(Boolean)
    .sort((a, b) => a.pkgJson.name.localeCompare(b.pkgJson.name));
}

function bumpVersion(version, bump) {
  const match = /^(\d+)\.(\d+)\.(\d+)(.*)$/.exec(version);
  if (!match) return version;
  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]);
  const suffix = match[4] ?? '';
  if (bump === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bump === 'minor') {
    minor += 1;
    patch = 0;
  } else if (bump === 'patch') {
    patch += 1;
  } else {
    return version;
  }
  return `${major}.${minor}.${patch}${suffix}`;
}

function collectInternalDeps(pkgJson) {
  const deps = { ...pkgJson.dependencies, ...pkgJson.peerDependencies };
  return Object.entries(deps)
    .filter(([name]) => name.startsWith('@embedded32/'))
    .map(([name, range]) => ({ name, range }));
}

function parsePackListing(stdout) {
  const files = [];
  const lines = stdout.split(/\r?\n/);
  let inContents = false;

  for (const line of lines) {
    if (line.includes('Tarball Contents')) {
      inContents = true;
      continue;
    }
    if (inContents && line.includes('Tarball Details')) {
      break;
    }
    if (!inContents) continue;

    const match = line.match(/^\s*npm notice\s+(?:\d+(?:\.\d+)?[kKmMgG]?B\s+)?(.+)$/);
    if (match) {
      files.push(match[1].trim());
    }
  }

  return files;
}

function packSummary(packageDir, packageName, version) {
  const result = run('npm', ['pack', '--dry-run'], packageDir);
  if (!result.ok) {
    return { ok: false, error: result.stdout };
  }
  const files = parsePackListing(result.stdout);
  const filename = `${packageName.replace('@', '').replace('/', '-')}-${version}.tgz`;
  return { ok: true, filename, files };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const lerna = readJson(path.join(ROOT, 'lerna.json'));
  const packages = discoverPublicPackages();

  console.log(`${colors.cyan}Embedded32 release dry-run${colors.reset}`);
  console.log(`${colors.dim}No packages will be published.${colors.reset}\n`);

  console.log(`Lerna fixed version: ${lerna.version}`);
  console.log(`npm dist-tag:        ${opts.tag}`);
  if (opts.bump) {
    console.log(`Proposed bump:       ${opts.bump} → ${bumpVersion(lerna.version, opts.bump)}`);
  }
  console.log('');

  if (!opts.skipVerify) {
    console.log('Running verification suite (npm run verify)...\n');
    const verify = run('npm', ['run', 'verify']);
    if (!verify.ok) {
      console.error(`${colors.red}Verification failed — release blocked.${colors.reset}`);
      console.error(verify.stdout);
      process.exit(1);
    }
    console.log(`${colors.green}✓ Verification passed${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠ Skipped verify (--skip-verify)${colors.reset}\n`);
  }

  let failures = 0;

  console.log('Publish candidates:\n');
  console.log('| Package | Current | Proposed | Internal @embedded32 deps |');
  console.log('|---------|---------|----------|-------------------------|');

  for (const pkg of packages) {
    const current = pkg.pkgJson.version;
    const proposed = opts.bump ? bumpVersion(current, opts.bump) : current;
    const internal = collectInternalDeps(pkg.pkgJson)
      .map((d) => `${d.name}@${d.range}`)
      .join(', ');
    console.log(
      `| ${pkg.pkgJson.name} | ${current} | ${proposed} | ${internal || '—'} |`
    );
  }

  console.log('\nTarball dry-run:\n');

  for (const pkg of packages) {
    process.stdout.write(`  ${pkg.pkgJson.name} ... `);
    const build = run('npm', ['run', 'build', '--if-present', '--silent'], pkg.dir);
    if (!build.ok) {
      console.log(`${colors.red}build failed${colors.reset}`);
      failures++;
      continue;
    }
    const pack = packSummary(pkg.dir, pkg.pkgJson.name, pkg.pkgJson.version);
    if (!pack.ok) {
      console.log(`${colors.red}pack failed${colors.reset}`);
      console.log(`${colors.dim}${pack.error}${colors.reset}`);
      failures++;
      continue;
    }
    const hasDist = pack.files.some((f) => f.startsWith('dist/'));
    const hasLicense = pack.files.includes('LICENSE');
    const flags = [
      hasDist ? 'dist' : 'NO-DIST',
      hasLicense ? 'LICENSE' : 'NO-LICENSE',
    ].join(', ');
    console.log(`${colors.green}${pack.filename}${colors.reset} (${flags})`);
  }

  console.log('\nSummary');
  console.log(`  Public packages: ${packages.length}`);
  console.log(`  Private skipped: dashboard, sdk-c, sdk-python`);
  console.log(`  Publish command (maintainer only, not executed):`);
  console.log(
    `    npx lerna publish from-package --yes --dist-tag ${opts.tag}`
  );
  console.log(`  Provenance: enable npm trusted publishing + \`NPM_CONFIG_PROVENANCE=true\``);

  if (failures > 0) {
    console.error(`\n${colors.red}Dry-run failed for ${failures} package(s).${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.green}Release dry-run complete. Nothing was published.${colors.reset}`);
}

main();

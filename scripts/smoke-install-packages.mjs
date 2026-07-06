#!/usr/bin/env node
/**
 * Smoke-test every public @embedded32/* package by packing, installing into a
 * temporary project, and exercising a minimal public API (or CLI entry point).
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    ...options,
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function isPublicPackage(pkgJson) {
  if (pkgJson.private === true) return false;
  if (pkgJson.name?.startsWith('@embedded32/')) return true;
  return false;
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
      return { dir, pkgJson, pkgPath };
    })
    .filter(Boolean);
}

function getInternalDeps(pkgJson) {
  return Object.keys(pkgJson.dependencies ?? {}).filter((name) => name.startsWith('@embedded32/'));
}

function topoSortPackages(packages) {
  const byName = new Map(packages.map((pkg) => [pkg.pkgJson.name, pkg]));
  const sorted = [];
  const visiting = new Set();
  const visited = new Set();

  function visit(name) {
    if (visited.has(name)) return;
    if (visiting.has(name)) return;
    visiting.add(name);
    const pkg = byName.get(name);
    if (pkg) {
      for (const dep of getInternalDeps(pkg.pkgJson)) {
        if (byName.has(dep)) visit(dep);
      }
    }
    visiting.delete(name);
    visited.add(name);
    if (pkg) sorted.push(pkg);
  }

  for (const pkg of packages) visit(pkg.pkgJson.name);
  return sorted;
}

function packAll(packages) {
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'embedded32-pack-'));
  const tarballs = new Map();

  for (const pkg of packages) {
    const build = run('npm', ['run', 'build'], { cwd: pkg.dir });
    if (!build.ok) {
      throw new Error(`${pkg.pkgJson.name}: build failed before pack`);
    }

    const pack = run('npm', ['pack', '--pack-destination', stagingDir], { cwd: pkg.dir });
    if (!pack.ok) {
      throw new Error(`${pkg.pkgJson.name}: npm pack failed\n${pack.stderr}`);
    }

    const match = (pack.stdout + pack.stderr).match(/embedded32[^\s]*\.tgz/);
    if (!match) {
      throw new Error(`${pkg.pkgJson.name}: could not determine tarball name`);
    }

    tarballs.set(pkg.pkgJson.name, path.join(stagingDir, match[0]));
  }

  return { stagingDir, tarballs };
}

const API_SMOKE = {
  '@embedded32/can': {
    moduleType: 'esm',
    code: `import { MockCANDriver } from '@embedded32/can';\nif (typeof MockCANDriver !== 'function') throw new Error('MockCANDriver missing');\nconsole.log('ok');`,
  },
  '@embedded32/core': {
    moduleType: 'esm',
    code: `import { Scheduler } from '@embedded32/core';\nconst s = new Scheduler();\nif (!s) throw new Error('Scheduler missing');\nconsole.log('ok');`,
  },
  '@embedded32/j1939': {
    moduleType: 'esm',
    code: `import { parseJ1939Id } from '@embedded32/j1939';\nconst parsed = parseJ1939Id(0x18fef100);\nif (!parsed) throw new Error('parseJ1939Id failed');\nconsole.log('ok');`,
  },
  '@embedded32/sim': {
    moduleType: 'esm',
    code: `import { EngineECU } from '@embedded32/sim';\nif (typeof EngineECU !== 'function') throw new Error('EngineECU missing');\nconsole.log('ok');`,
  },
  '@embedded32/ethernet': {
    moduleType: 'cjs',
    code: `const { NanoProtoEncoder } = require('@embedded32/ethernet');\nif (!NanoProtoEncoder) throw new Error('NanoProtoEncoder missing');\nconsole.log('ok');`,
  },
  '@embedded32/bridge': {
    moduleType: 'esm',
    code: `import { RuleEngine } from '@embedded32/bridge';\nif (typeof RuleEngine !== 'function') throw new Error('RuleEngine missing');\nconsole.log('ok');`,
  },
  '@embedded32/supervisor': {
    moduleType: 'cjs',
    code: `const { Supervisor } = require('@embedded32/supervisor');\nconst s = new Supervisor({});\nif (!s) throw new Error('Supervisor missing');\nconsole.log('ok');`,
  },
  '@embedded32/sdk-js': {
    moduleType: 'esm',
    code: `import { J1939Client } from '@embedded32/sdk-js';\nif (typeof J1939Client !== 'function') throw new Error('J1939Client missing');\nconsole.log('ok');`,
  },
  '@embedded32/tools': {
    moduleType: 'cli',
    bin: 'embedded32-tools',
    args: ['--help'],
    expectInOutput: 'EMBEDDED32 PLATFORM',
  },
  '@embedded32/cli': {
    moduleType: 'cli',
    bin: 'embedded32',
    args: ['--help'],
    expectInOutput: 'Embedded32',
  },
};

function collectTransitiveInternalDeps(pkgName, allPackages) {
  const byName = new Map(allPackages.map((pkg) => [pkg.pkgJson.name, pkg]));
  const queue = [pkgName];
  const seen = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    seen.add(current);
    const currentPkg = byName.get(current);
    if (!currentPkg) continue;
    for (const dep of getInternalDeps(currentPkg.pkgJson)) {
      queue.push(dep);
    }
  }

  seen.delete(pkgName);
  return seen;
}

function installTarballs(projectDir, tarballPaths) {
  for (const tarball of tarballPaths) {
    const install = run('npm', ['install', tarball], { cwd: projectDir });
    if (!install.ok) {
      throw new Error(`npm install ${path.basename(tarball)} failed:\n${install.stderr}`);
    }
  }
}

function smokeApi(projectDir, spec) {
  if (spec.moduleType === 'cli') {
    return;
  }

  const ext = spec.moduleType === 'esm' ? 'mjs' : 'cjs';
  const scriptPath = path.join(projectDir, `smoke.${ext}`);
  fs.writeFileSync(scriptPath, spec.code, 'utf8');

  const result = run('node', [scriptPath], { cwd: projectDir });
  if (!result.ok || !result.stdout.includes('ok')) {
    throw new Error(`API smoke failed:\n${result.stdout}\n${result.stderr}`);
  }
}

function smokeCli(projectDir, spec) {
  const binPath = path.join(projectDir, 'node_modules', '.bin', spec.bin);
  const cmd = process.platform === 'win32' ? `${binPath}.cmd` : binPath;

  if (!fs.existsSync(cmd)) {
    throw new Error(`CLI binary not found: ${cmd}`);
  }

  const help = run(cmd, spec.args, { cwd: projectDir });
  if (!help.ok) {
    throw new Error(`${spec.bin} ${spec.args.join(' ')} failed (exit ${help.status})`);
  }
  if (spec.expectInOutput && !help.stdout.includes(spec.expectInOutput)) {
    throw new Error(`${spec.bin} --help output missing expected text`);
  }

  const version = run(cmd, ['--version'], { cwd: projectDir });
  if (!version.ok || !version.stdout.trim()) {
    throw new Error(`${spec.bin} --version failed`);
  }

  const invalid = run(cmd, ['definitely-not-a-command'], { cwd: projectDir });
  if (invalid.ok || invalid.status === 0) {
    throw new Error(`${spec.bin} invalid command should exit non-zero`);
  }
}

function smokePackage(pkg, tarballs, allPackages, ordered) {
  const name = pkg.pkgJson.name;
  const spec = API_SMOKE[name];
  if (!spec) {
    throw new Error(`No smoke spec defined for ${name}`);
  }

  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'embedded32-smoke-'));

  try {
    run('npm', ['init', '-y'], { cwd: projectDir });

    const pkgJsonPath = path.join(projectDir, 'package.json');
    const projectPkg = readJson(pkgJsonPath);
    if (spec.moduleType === 'esm') {
      projectPkg.type = 'module';
      fs.writeFileSync(pkgJsonPath, JSON.stringify(projectPkg, null, 2));

      const transitive = collectTransitiveInternalDeps(name, allPackages);
      const installList = ordered
        .filter((pkg) => transitive.has(pkg.pkgJson.name))
        .map((pkg) => tarballs.get(pkg.pkgJson.name));
      installList.push(tarballs.get(name));
      installTarballs(projectDir, installList.filter(Boolean));

      smokeApi(projectDir, spec);
    } else if (spec.moduleType === 'cjs') {
      const transitive = collectTransitiveInternalDeps(name, allPackages);
      const installList = ordered
        .filter((pkg) => transitive.has(pkg.pkgJson.name))
        .map((pkg) => tarballs.get(pkg.pkgJson.name));
      installList.push(tarballs.get(name));
      installTarballs(projectDir, installList.filter(Boolean));
      smokeApi(projectDir, spec);
    } else if (spec.moduleType === 'cli') {
      const installList = [];
      const transitive = collectTransitiveInternalDeps(name, allPackages);
      for (const depName of ordered.map((pkg) => pkg.pkgJson.name)) {
        if (transitive.has(depName) && tarballs.has(depName)) {
          installList.push(tarballs.get(depName));
        }
      }
      installList.push(tarballs.get(name));
      installTarballs(projectDir, installList.filter(Boolean));
      smokeCli(projectDir, spec);
    }
  } finally {
    fs.rmSync(projectDir, { recursive: true, force: true });
  }
}

function main() {
  console.log(`${colors.cyan}Embedded32 package install smoke tests${colors.reset}`);
  console.log(`${colors.dim}Root: ${ROOT}${colors.reset}\n`);

  const packages = discoverPublicPackages();
  const ordered = topoSortPackages(packages);
  let stagingDir;

  try {
    const packed = packAll(ordered);
    stagingDir = packed.stagingDir;
    const { tarballs } = packed;

    let failed = 0;
    for (const pkg of ordered) {
      const name = pkg.pkgJson.name;
      try {
        smokePackage(pkg, tarballs, packages, ordered);
        console.log(`${colors.green}PASS${colors.reset}  ${name}`);
      } catch (error) {
        failed += 1;
        console.log(`${colors.red}FAIL${colors.reset}  ${name}`);
        console.log(`       ${colors.red}${error.message}${colors.reset}`);
      }
    }

    console.log('');
    if (failed > 0) {
      console.log(`${colors.red}${failed} package(s) failed smoke install.${colors.reset}`);
      process.exit(1);
    }
    console.log(
      `${colors.green}All ${ordered.length} packages passed smoke install tests.${colors.reset}`
    );
  } finally {
    if (stagingDir) {
      fs.rmSync(stagingDir, { recursive: true, force: true });
    }
  }
}

main();

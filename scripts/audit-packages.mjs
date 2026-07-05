#!/usr/bin/env node
/**
 * Audits all public @embedded32/* packages for publish readiness.
 *
 * For each public package:
 *  1. Runs the package build script (when present)
 *  2. Runs `npm pack --dry-run`
 *  3. Verifies entry points, compiled JS, declarations, README, and LICENSE
 *  4. Prints a human-readable summary and exits non-zero on failure
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function log(message) {
  console.log(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function isPublicPackage(pkgJson) {
  if (pkgJson.private === true) return false;
  if (pkgJson.publishConfig?.access === "public") return true;
  if (pkgJson.name?.startsWith("@embedded32/")) return true;
  return false;
}

function discoverWorkspaces() {
  const rootPkg = readJson(path.join(ROOT, "package.json"));
  const workspaces = rootPkg.workspaces ?? [];
  return workspaces
    .map((entry) => {
      const dir = path.join(ROOT, entry);
      const pkgPath = path.join(dir, "package.json");
      if (!fs.existsSync(pkgPath)) return null;
      return { dir, pkgJson: readJson(pkgPath), pkgPath };
    })
    .filter(Boolean);
}

function normalizeEntry(entry) {
  if (!entry) return null;
  return entry.replace(/^\.\//, "");
}

function resolvePackageFile(packageDir, entry) {
  const normalized = normalizeEntry(entry);
  if (!normalized) return null;
  return path.join(packageDir, normalized);
}

function parsePackListing(stdout) {
  const files = [];
  const lines = stdout.split(/\r?\n/);
  let inContents = false;

  for (const line of lines) {
    if (line.includes("Tarball Contents")) {
      inContents = true;
      continue;
    }
    if (inContents && line.includes("Tarball Details")) {
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

function hasFile(files, pattern) {
  return files.some((file) => {
    if (typeof pattern === "string") return file === pattern || file.endsWith(`/${pattern}`);
    return pattern.test(file);
  });
}

function auditPackage({ dir, pkgJson }) {
  const name = pkgJson.name;
  const issues = [];
  const warnings = [];
  const checks = [];

  // Build
  if (pkgJson.scripts?.build) {
    const build = run("npm", ["run", "build"], dir);
    if (!build.ok) {
      issues.push(`build failed (exit ${build.status})`);
      if (build.stderr.trim()) issues.push(`build stderr: ${build.stderr.trim().split("\n")[0]}`);
    } else {
      checks.push("build");
    }
  } else {
    warnings.push("no build script");
  }

  // Pack dry-run
  const pack = run("npm", ["pack", "--dry-run"], dir);
  if (!pack.ok) {
    issues.push(`npm pack --dry-run failed (exit ${pack.status})`);
    return { name, dir, issues, warnings, checks, packedFiles: [], fileCount: 0 };
  }
  checks.push("npm pack --dry-run");

  const packedFiles = parsePackListing(pack.stdout + pack.stderr);
  const fileCount = packedFiles.length;

  // Entry point on disk
  const mainEntry = normalizeEntry(pkgJson.main);
  if (!mainEntry) {
    issues.push("missing package.json main field");
  } else {
    const mainPath = resolvePackageFile(dir, mainEntry);
    if (!fs.existsSync(mainPath)) {
      issues.push(`main entry missing on disk: ${mainEntry}`);
    } else if (!hasFile(packedFiles, mainEntry)) {
      issues.push(`main entry not included in tarball: ${mainEntry}`);
    } else {
      checks.push("main entry");
    }
  }

  // Types
  const typesEntry = normalizeEntry(pkgJson.types ?? pkgJson.typings);
  if (!typesEntry) {
    warnings.push("missing types field in package.json");
  } else {
    const typesPath = resolvePackageFile(dir, typesEntry);
    if (!fs.existsSync(typesPath)) {
      issues.push(`types entry missing on disk: ${typesEntry}`);
    } else if (!hasFile(packedFiles, typesEntry)) {
      issues.push(`types entry not included in tarball: ${typesEntry}`);
    } else {
      checks.push("types entry");
    }
  }

  // Compiled artifacts in tarball
  const hasJs = packedFiles.some((f) => f.endsWith(".js"));
  const hasDts = packedFiles.some((f) => f.endsWith(".d.ts"));
  if (!hasJs) issues.push("tarball contains no .js files");
  else checks.push("compiled JavaScript");
  if (!hasDts) issues.push("tarball contains no .d.ts files");
  else checks.push("TypeScript declarations");

  // README
  if (!hasFile(packedFiles, "README.md")) {
    issues.push("README.md not included in tarball");
  } else {
    checks.push("README.md");
  }

  // LICENSE
  const licenseOnDisk =
    fs.existsSync(path.join(dir, "LICENSE")) || fs.existsSync(path.join(ROOT, "LICENSE"));
  if (!hasFile(packedFiles, "LICENSE")) {
    if (licenseOnDisk) {
      issues.push("LICENSE exists in repo but is not included in tarball (add to files array)");
    } else {
      issues.push("LICENSE file missing");
    }
  } else {
    checks.push("LICENSE");
  }

  // Bin entries for CLI packages
  if (pkgJson.bin) {
    for (const [binName, binPath] of Object.entries(
      typeof pkgJson.bin === "string" ? { [path.basename(pkgJson.bin)]: pkgJson.bin } : pkgJson.bin
    )) {
      const resolved = resolvePackageFile(dir, binPath);
      if (!fs.existsSync(resolved)) {
        issues.push(`bin "${binName}" points to missing file: ${binPath}`);
        continue;
      }
      if (!hasFile(packedFiles, binPath)) {
        issues.push(`bin "${binName}" not included in tarball: ${binPath}`);
        continue;
      }
      const content = fs.readFileSync(resolved, "utf8");
      if (!content.startsWith("#!")) {
        warnings.push(`bin "${binName}" missing shebang in ${binPath}`);
      }
      checks.push(`bin:${binName}`);
    }
  }

  // Workspace-only dependency versions
  for (const [depName, depVersion] of Object.entries(pkgJson.dependencies ?? {})) {
    if (depName.startsWith("@embedded32/") && depVersion === "*") {
      warnings.push(`dependency ${depName} uses workspace wildcard "*" (not valid on npm publish)`);
    }
  }

  // prepack
  if (!pkgJson.scripts?.prepack) {
    warnings.push("no prepack script (tarball may ship stale dist without manual build)");
  } else {
    checks.push("prepack");
  }

  // Metadata
  if (!pkgJson.description) warnings.push("missing description");
  if (!pkgJson.license) warnings.push("missing license field");
  if (!pkgJson.repository?.url) warnings.push("missing repository URL");
  if (!pkgJson.publishConfig?.access) warnings.push("missing publishConfig.access");

  return { name, dir, issues, warnings, checks, packedFiles, fileCount };
}

function main() {
  log(`${colors.cyan}Embedded32 package audit${colors.reset}`);
  log(`${colors.dim}Root: ${ROOT}${colors.reset}\n`);

  const workspaces = discoverWorkspaces();
  const publicPackages = workspaces.filter(({ pkgJson }) => isPublicPackage(pkgJson));
  const privatePackages = workspaces.filter(({ pkgJson }) => !isPublicPackage(pkgJson));

  log(`Found ${workspaces.length} workspace packages (${publicPackages.length} public, ${privatePackages.length} private)\n`);

  const results = publicPackages.map(auditPackage);

  // Detect duplicate bin names across public packages
  const binOwners = new Map();
  for (const { pkgJson, dir } of publicPackages) {
    if (!pkgJson.bin) continue;
    const bins =
      typeof pkgJson.bin === "string"
        ? { [path.basename(pkgJson.bin, ".js")]: pkgJson.bin }
        : pkgJson.bin;
    for (const binName of Object.keys(bins)) {
      if (!binOwners.has(binName)) binOwners.set(binName, []);
      binOwners.get(binName).push(pkgJson.name);
    }
  }
  for (const [binName, owners] of binOwners) {
    if (owners.length > 1) {
      for (const result of results) {
        if (owners.includes(result.name)) {
          result.issues.push(`duplicate bin name "${binName}" shared with: ${owners.filter((o) => o !== result.name).join(", ")}`);
        }
      }
    }
  }

  let failed = 0;
  let warned = 0;

  for (const result of results) {
    const relDir = path.relative(ROOT, result.dir);
    const status =
      result.issues.length > 0
        ? `${colors.red}FAIL${colors.reset}`
        : result.warnings.length > 0
          ? `${colors.yellow}WARN${colors.reset}`
          : `${colors.green}PASS${colors.reset}`;

    log(`${status}  ${colors.cyan}${result.name}${colors.reset}  ${colors.dim}(${relDir}, ${result.fileCount} tarball files)${colors.reset}`);

    if (result.checks.length) {
      log(`       ${colors.green}✓${colors.reset} ${result.checks.join(", ")}`);
    }
    for (const issue of result.issues) {
      log(`       ${colors.red}✗${colors.reset} ${issue}`);
      failed += 1;
    }
    for (const warning of result.warnings) {
      log(`       ${colors.yellow}!${colors.reset} ${warning}`);
      warned += 1;
    }
    log("");
  }

  if (privatePackages.length) {
    log(`${colors.dim}Skipped private packages:${colors.reset}`);
    for (const { pkgJson, dir } of privatePackages) {
      log(`  - ${pkgJson.name} (${path.relative(ROOT, dir)})`);
    }
    log("");
  }

  const packagesWithIssues = results.filter((r) => r.issues.length > 0).length;
  const packagesWithWarnings = results.filter((r) => r.warnings.length > 0).length;

  log("─".repeat(60));
  log(
    `Summary: ${results.length} public packages audited | ` +
      `${colors.green}${results.length - packagesWithIssues} passed checks${colors.reset} | ` +
      `${colors.red}${packagesWithIssues} with errors${colors.reset} | ` +
      `${colors.yellow}${packagesWithWarnings} with warnings${colors.reset}`
  );

  if (failed > 0) {
    log(`\n${colors.red}Package audit failed with ${failed} error(s).${colors.reset}`);
    process.exit(1);
  }

  if (warned > 0) {
    log(`\n${colors.yellow}Package audit completed with ${warned} warning(s).${colors.reset}`);
  } else {
    log(`\n${colors.green}Package audit passed.${colors.reset}`);
  }
}

main();

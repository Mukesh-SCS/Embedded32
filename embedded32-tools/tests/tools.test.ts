/**
 * Tools CLI packaging tests
 */

import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const CLI_PATH = path.join(__dirname, '..', 'dist', 'cli.js');

function runCli(args: string[]) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], {
    encoding: 'utf8',
  });
}

describe('Tools CLI packaging', () => {
  beforeAll(() => {
    expect(fs.existsSync(CLI_PATH)).toBe(true);
    const content = fs.readFileSync(CLI_PATH, 'utf8');
    expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('shows help for --help', () => {
    const result = runCli(['--help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('EMBEDDED32 PLATFORM');
  });

  it('prints version for --version', () => {
    const result = runCli(['--version']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Embedded32 CLI');
  });

  it('returns non-zero for unknown commands', () => {
    const result = runCli(['not-a-real-command']);
    expect(result.status).not.toBe(0);
  });
});

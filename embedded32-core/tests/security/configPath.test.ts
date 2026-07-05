import {
  ConfigPathError,
  ConfigValidationError,
  deepCopyConfig,
  validateConfigObject,
  validateConfigPath,
} from '../../src/security/configPath';
import { ConfigLoader } from '../../src/config/ConfigLoader';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

describe('configPath security', () => {
  it('rejects __proto__ segments', () => {
    expect(() => validateConfigPath('__proto__.polluted')).toThrow(ConfigPathError);
  });

  it('rejects constructor segments', () => {
    expect(() => validateConfigPath('constructor.prototype.polluted')).toThrow(ConfigPathError);
  });

  it('rejects empty segments', () => {
    expect(() => validateConfigPath('app..name')).toThrow(ConfigPathError);
  });

  it('accepts valid nested paths', () => {
    expect(validateConfigPath('app.server.port')).toEqual(['app', 'server', 'port']);
  });

  it('rejects forbidden keys during JSON load', () => {
    const polluted = JSON.parse('{"nested":{"__proto__":{"polluted":true}}}');
    expect(() => validateConfigObject(polluted)).toThrow(ConfigValidationError);
  });

  it('prevents prototype pollution via ConfigLoader.set', async () => {
    const loader = new ConfigLoader();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cfg-'));
    const configPath = path.join(tempDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify({ app: { name: 'ok' } }));

    await loader.load(configPath);
    expect(() => loader.set('__proto__.polluted', true)).toThrow(ConfigPathError);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    fs.rmSync(tempDir, { recursive: true });
  });

  it('returns deep copies from getAll', async () => {
    const loader = new ConfigLoader();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cfg-'));
    const configPath = path.join(tempDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify({ nested: { value: 1 } }));

    await loader.load(configPath);
    const copy = loader.getAll();
    (copy.nested as Record<string, unknown>).value = 99;
    expect(loader.get('nested.value')).toBe(1);
    fs.rmSync(tempDir, { recursive: true });
  });

  it('throws on malformed JSON instead of returning empty config', async () => {
    const loader = new ConfigLoader();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cfg-'));
    const configPath = path.join(tempDir, 'config.json');
    fs.writeFileSync(configPath, '{ invalid');

    await expect(loader.load(configPath)).rejects.toThrow(ConfigValidationError);
    fs.rmSync(tempDir, { recursive: true });
  });

  it('deepCopyConfig isolates nested references', () => {
    const source = { nested: { count: 1 } };
    const copy = deepCopyConfig(source);
    (copy.nested as { count: number }).count = 2;
    expect(source.nested.count).toBe(1);
  });
});

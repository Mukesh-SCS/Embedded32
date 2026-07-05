/**
 * ConfigLoader Tests
 */

import { ConfigLoader, ConfigPathError, ConfigValidationError } from '../src/config/ConfigLoader';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('ConfigLoader', () => {
  let loader: ConfigLoader;
  let tempDir: string;
  let testConfigPath: string;

  beforeEach(() => {
    loader = new ConfigLoader();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-test-'));
    testConfigPath = path.join(tempDir, 'test-config.json');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  describe('loading configuration', () => {
    it('should load a valid JSON config file', async () => {
      const config = { logLevel: 'info', port: 3000 };
      fs.writeFileSync(testConfigPath, JSON.stringify(config));

      const loaded = await loader.load(testConfigPath);

      expect(loaded).toEqual(config);
    });

    it('should throw for missing config file', async () => {
      await expect(loader.load('/non/existent/path.json')).rejects.toThrow(ConfigValidationError);
    });

    it('should load nested configuration', async () => {
      const config = {
        server: {
          host: 'localhost',
          port: 3000,
        },
        database: {
          url: 'mongodb://localhost',
          pool: 10,
        },
      };
      fs.writeFileSync(testConfigPath, JSON.stringify(config));

      const loaded = await loader.load(testConfigPath);

      expect((loaded.server as Record<string, unknown>).port).toBe(3000);
      expect((loaded.database as Record<string, unknown>).pool).toBe(10);
    });
  });

  describe('get configuration', () => {
    beforeEach(async () => {
      const config = {
        app: {
          name: 'TestApp',
          version: '1.0.0',
          features: {
            logging: true,
            caching: true,
          },
        },
        port: 3000,
      };
      fs.writeFileSync(testConfigPath, JSON.stringify(config));
      await loader.load(testConfigPath);
    });

    it('should get top-level config value', () => {
      expect(loader.get('port')).toBe(3000);
    });

    it('should get nested config value', () => {
      expect(loader.get('app.name')).toBe('TestApp');
    });

    it('should get deeply nested config value', () => {
      expect(loader.get('app.features.logging')).toBe(true);
    });

    it('should return default value for missing key', () => {
      expect(loader.get('non.existent.key', 'default')).toBe('default');
    });

    it('should return undefined for missing key without default', () => {
      expect(loader.get('non.existent.key')).toBeUndefined();
    });

    it('should get all configuration as a deep copy', () => {
      const all = loader.getAll();
      (all.app as Record<string, unknown>).name = 'Changed';
      expect(loader.get('app.name')).toBe('TestApp');
    });
  });

  describe('set configuration', () => {
    it('should set top-level config value', async () => {
      fs.writeFileSync(testConfigPath, JSON.stringify({}));
      await loader.load(testConfigPath);
      loader.set('port', 8080);
      expect(loader.get('port')).toBe(8080);
    });

    it('should set nested config value', async () => {
      const config = { app: { name: 'Test' } };
      fs.writeFileSync(testConfigPath, JSON.stringify(config));
      await loader.load(testConfigPath);
      loader.set('app.version', '2.0.0');
      expect(loader.get('app.version')).toBe('2.0.0');
    });

    it('should create nested path if not exists', async () => {
      fs.writeFileSync(testConfigPath, JSON.stringify({}));
      await loader.load(testConfigPath);
      loader.set('new.nested.value', 42);
      expect(loader.get('new.nested.value')).toBe(42);
    });

    it('should reject prototype pollution keys', async () => {
      fs.writeFileSync(testConfigPath, JSON.stringify({}));
      await loader.load(testConfigPath);
      expect(() => loader.set('__proto__.polluted', true)).toThrow(ConfigPathError);
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
  });

  describe('save configuration', () => {
    it('should save configuration to file', async () => {
      fs.writeFileSync(testConfigPath, JSON.stringify({}));
      await loader.load(testConfigPath);
      loader.set('setting', 'value');
      await loader.save(testConfigPath);

      const parsed = JSON.parse(fs.readFileSync(testConfigPath, 'utf-8'));
      expect(parsed.setting).toBe('value');
    });
  });
});

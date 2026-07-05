import * as fs from 'fs/promises';
import * as path from 'path';
import {
  ConfigPathError,
  ConfigValidationError,
  deepCopyConfig,
  validateConfigObject,
  validateConfigPath,
} from '../security/configPath.js';
import { safeConsoleWrite } from '../security/logSanitize.js';

export { ConfigPathError, ConfigValidationError };

function hasOwnProperty(object: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export class ConfigLoader {
  private config: Record<string, unknown> = Object.create(null);

  /**
   * Load configuration from file
   */
  async load(configPath: string): Promise<Record<string, unknown>> {
    const absolutePath = path.resolve(configPath);
    let data: string;
    try {
      data = await fs.readFile(absolutePath, 'utf-8');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ConfigValidationError(`Failed to read config from ${configPath}: ${message}`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ConfigValidationError(`Invalid JSON in ${configPath}: ${message}`);
    }

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new ConfigValidationError(`Configuration root must be a JSON object: ${configPath}`);
    }

    this.config = validateConfigObject(parsed);
    return deepCopyConfig(this.config);
  }

  /**
   * Get configuration value
   */
  get(key: string, defaultValue?: unknown): unknown {
    const keys = validateConfigPath(key);
    let value: unknown = this.config;

    for (const segment of keys) {
      if (!isConfigRecord(value) || !hasOwnProperty(value, segment)) {
        return defaultValue;
      }
      value = value[segment];
    }

    return value;
  }

  /**
   * Set configuration value
   */
  set(key: string, value: unknown): void {
    const keys = validateConfigPath(key);
    let obj = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const segment = keys[i];
      if (!hasOwnProperty(obj, segment) || !isConfigRecord(obj[segment])) {
        obj[segment] = Object.create(null);
      }
      obj = obj[segment] as Record<string, unknown>;
    }

    const leaf = keys[keys.length - 1];
    Object.defineProperty(obj, leaf, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  /**
   * Get entire configuration
   */
  getAll(): Record<string, unknown> {
    return deepCopyConfig(this.config);
  }

  /**
   * Save configuration to file
   */
  async save(configPath: string): Promise<void> {
    const absolutePath = path.resolve(configPath);
    const data = JSON.stringify(this.config, null, 2);
    await fs.writeFile(absolutePath, data, 'utf-8');
  }
}

function isConfigRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @deprecated Internal helper retained for callers migrating away from silent failures.
 */
export function logConfigLoadWarning(configPath: string, error: unknown): void {
  safeConsoleWrite('warn', '[ConfigLoader]', `Failed to load config from ${configPath}`, error);
}

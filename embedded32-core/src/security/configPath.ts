export const FORBIDDEN_CONFIG_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
export const MAX_CONFIG_PATH_DEPTH = 32;
export const MAX_CONFIG_KEY_LENGTH = 128;

export class ConfigPathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigPathError';
  }
}

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Validate a dot-separated configuration path before read/write.
 */
export function validateConfigPath(path: string): string[] {
  if (!path || typeof path !== 'string') {
    throw new ConfigPathError('Configuration path must be a non-empty string');
  }
  if (path.startsWith('.') || path.endsWith('.') || path.includes('..')) {
    throw new ConfigPathError(`Invalid configuration path: ${path}`);
  }

  const segments = path.split('.');
  if (segments.length === 0) {
    throw new ConfigPathError('Configuration path must contain at least one segment');
  }
  if (segments.length > MAX_CONFIG_PATH_DEPTH) {
    throw new ConfigPathError(
      `Configuration path exceeds maximum depth (${MAX_CONFIG_PATH_DEPTH})`
    );
  }

  for (const segment of segments) {
    if (!segment) {
      throw new ConfigPathError(`Empty segment in configuration path: ${path}`);
    }
    if (segment.length > MAX_CONFIG_KEY_LENGTH) {
      throw new ConfigPathError(`Configuration key segment too long in path: ${path}`);
    }
    if (FORBIDDEN_CONFIG_KEYS.has(segment)) {
      throw new ConfigPathError(`Forbidden configuration key segment: ${segment}`);
    }
    if (/[\u0000-\u001F\u007F]/.test(segment)) {
      throw new ConfigPathError(
        `Control characters are not allowed in configuration keys: ${path}`
      );
    }
  }

  return segments;
}

/**
 * Recursively validate parsed JSON configuration objects.
 */
export function validateConfigObject(
  value: unknown,
  path = '',
  depth = 0
): Record<string, unknown> {
  if (depth > MAX_CONFIG_PATH_DEPTH) {
    throw new ConfigValidationError(
      `Configuration nesting exceeds maximum depth at ${path || 'root'}`
    );
  }

  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    if (Array.isArray(value)) {
      return value.map((item, index) => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          return validateConfigObject(item, path ? `${path}[${index}]` : `[${index}]`, depth + 1);
        }
        return item;
      }) as unknown as Record<string, unknown>;
    }
    return value as Record<string, unknown>;
  }

  const source = value as Record<string, unknown>;
  const safe = Object.create(null) as Record<string, unknown>;

  for (const key of Object.keys(source)) {
    if (FORBIDDEN_CONFIG_KEYS.has(key)) {
      throw new ConfigValidationError(`Forbidden configuration key: ${key}`);
    }
    if (!key || key.length > MAX_CONFIG_KEY_LENGTH) {
      throw new ConfigValidationError(`Invalid configuration key: ${key}`);
    }
    if (/[\u0000-\u001F\u007F]/.test(key)) {
      throw new ConfigValidationError(`Control characters are not allowed in key: ${key}`);
    }

    const childPath = path ? `${path}.${key}` : key;
    const child = source[key];
    if (child !== null && typeof child === 'object') {
      safe[key] = validateConfigObject(child, childPath, depth + 1);
    } else {
      safe[key] = child;
    }
  }

  return safe;
}

/**
 * Deep-copy configuration records without prototype pollution vectors.
 */
export function deepCopyConfig<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepCopyConfig(item)) as T;
  }
  const copy = Object.create(null) as Record<string, unknown>;
  for (const key of Object.keys(value as Record<string, unknown>)) {
    copy[key] = deepCopyConfig((value as Record<string, unknown>)[key]);
  }
  return copy as T;
}

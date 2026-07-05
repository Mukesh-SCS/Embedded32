const SECRET_KEY_PATTERN =
  /(password|passwd|secret|token|api[_-]?key|authorization|credential)/i;

/**
 * Produce a log-safe copy of configuration with secret fields redacted.
 */
export function redactSecrets<T>(value: T): T {
  return redactValue(value) as T;
}

function redactValue(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }

  const result = Object.create(null) as Record<string, unknown>;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (SECRET_KEY_PATTERN.test(key)) {
      result[key] = '[REDACTED]';
      continue;
    }
    result[key] = redactValue(child);
  }
  return result;
}

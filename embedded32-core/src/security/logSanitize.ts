const ANSI_ESCAPE =
  /[\u001B\u009B][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><]/g;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const MAX_LOG_VALUE_LENGTH = 8_192;

/**
 * Neutralize characters that could forge log lines or terminal output.
 */
export function sanitizeLogText(value: unknown): string {
  try {
    const text = serializeLogValue(value);
    const truncated =
      text.length > MAX_LOG_VALUE_LENGTH
        ? `${text.slice(0, MAX_LOG_VALUE_LENGTH)}…[truncated]`
        : text;
    return truncated
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(ANSI_ESCAPE, '')
      .replace(CONTROL_CHARS, '');
  } catch {
    return '[unserializable log value]';
  }
}

/**
 * Serialize arbitrary values for safe logging.
 */
export function serializeLogValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (value instanceof Error) {
    const parts = [value.name, value.message].filter(Boolean);
    if (value.stack) parts.push(value.stack);
    return parts.join(': ');
  }
  if (typeof value === 'object') {
    const seen = new WeakSet<object>();
    return JSON.stringify(value, (_key, inner) => {
      if (typeof inner === 'object' && inner !== null) {
        if (seen.has(inner)) return '[Circular]';
        seen.add(inner);
      }
      return inner;
    });
  }
  return String(value);
}

export type SafeConsoleLevel = 'debug' | 'info' | 'warn' | 'error' | 'log';

/**
 * Write to console with a constant format string and sanitized payload.
 */
export function safeConsoleWrite(
  level: SafeConsoleLevel,
  prefix: string,
  message: string,
  data?: unknown
): void {
  const sanitizedPrefix = sanitizeLogText(prefix);
  const sanitizedMessage = sanitizeLogText(message);
  const line = `${sanitizedPrefix} ${sanitizedMessage}`;
  const payload = data === undefined ? line : `${line} ${sanitizeLogText(data)}`;

  switch (level) {
    case 'error':
      console.error('%s', payload);
      break;
    case 'warn':
      console.warn('%s', payload);
      break;
    case 'debug':
      console.debug('%s', payload);
      break;
    case 'info':
    case 'log':
    default:
      console.log('%s', payload);
      break;
  }
}

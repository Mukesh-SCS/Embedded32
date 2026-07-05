const ANSI_ESCAPE =
  /[\u001B\u009B][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><]/g;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const MAX_LOG_VALUE_LENGTH = 8_192;

export function sanitizeLogText(value: unknown): string {
  try {
    const text = serializeLogValue(value);
    const truncated =
      text.length > MAX_LOG_VALUE_LENGTH
        ? `${text.slice(0, MAX_LOG_VALUE_LENGTH)}…[truncated]`
        : text;
    return truncated
      .replace(/\r|\n|\u2028|\u2029/g, (ch) => {
        switch (ch) {
          case '\r':
            return '\\r';
          case '\n':
            return '\\n';
          case '\u2028':
            return '\\u2028';
          case '\u2029':
            return '\\u2029';
          default:
            return '';
        }
      })
      .replace(ANSI_ESCAPE, '')
      .replace(CONTROL_CHARS, '');
  } catch {
    return '[unserializable log value]';
  }
}

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

function composeSanitizedLogLine(parts: string[]): string {
  return parts.filter((part) => part.length > 0).join(' ');
}

export function safeConsoleWrite(
  level: SafeConsoleLevel,
  prefix: string,
  message: string,
  data?: unknown
): void {
  const sanitizedPrefix = sanitizeLogText(prefix);
  const sanitizedMessage = sanitizeLogText(message);
  const sanitizedData = data === undefined ? '' : sanitizeLogText(data);
  const safePayload = composeSanitizedLogLine([
    sanitizedPrefix,
    sanitizedMessage,
    sanitizedData
  ]);
  switch (level) {
    case 'error':
      console.error('%s', safePayload);
      break;
    case 'warn':
      console.warn('%s', safePayload);
      break;
    case 'debug':
      console.debug('%s', safePayload);
      break;
    case 'info':
    case 'log':
    default:
      console.log('%s', safePayload);
      break;
  }
}

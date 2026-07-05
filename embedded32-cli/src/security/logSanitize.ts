const ANSI_ESCAPE =
  /[\u001B\u009B][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><]/g;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Fixed console format strings — never derived from runtime input. */
const LOG_FORMAT_TWO = '%s %s';
const LOG_FORMAT_THREE = '%s %s %s';

export const MAX_LOG_VALUE_LENGTH = 8_192;

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

type ConsoleWriter = (format: string, ...args: unknown[]) => void;

function getConsoleWriter(level: SafeConsoleLevel): ConsoleWriter {
  switch (level) {
    case 'error':
      return console.error.bind(console);
    case 'warn':
      return console.warn.bind(console);
    case 'debug':
      return console.debug.bind(console);
    case 'info':
    case 'log':
    default:
      return console.log.bind(console);
  }
}

export function safeConsoleWrite(
  level: SafeConsoleLevel,
  prefix: string,
  message: string,
  data?: unknown
): void {
  const writer = getConsoleWriter(level);
  const safePrefix = sanitizeLogText(prefix);
  const safeMessage = sanitizeLogText(message);

  if (data === undefined) {
    writer(LOG_FORMAT_TWO, safePrefix, safeMessage);
    return;
  }

  writer(LOG_FORMAT_THREE, safePrefix, safeMessage, sanitizeLogText(data));
}

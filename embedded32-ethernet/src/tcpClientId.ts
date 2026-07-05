import { isIP } from 'net';
import { sanitizeLogText } from './security/logSanitize';

/**
 * Format a remote client identifier for safe logging.
 */
export function formatClientIdForLog(address: string | undefined, port: number | undefined): string {
  const safeAddress = address && isIP(address) ? address : sanitizeLogText(address ?? 'unknown');
  const safePort =
    typeof port === 'number' && Number.isInteger(port) && port >= 0 && port <= 65535
      ? String(port)
      : 'invalid';
  return `${safeAddress}:${safePort}`;
}

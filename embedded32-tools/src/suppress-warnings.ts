/**
 * Warning suppression module - must be imported first
 * Suppresses non-critical warnings from dependencies on Windows
 */

import { safeConsoleWrite, sanitizeLogText } from './security/logSanitize.js';

if (process.platform === 'win32') {
  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const msg = args[0];
    if (typeof msg === 'string' && msg.includes('epoll is built for Linux')) {
      return;
    }
    const sanitized = args.map((arg) => sanitizeLogText(arg)).join(' ');
    safeConsoleWrite('warn', '[warn]', sanitized);
  };
}

export {};

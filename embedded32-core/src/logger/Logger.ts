import { LogEntry } from '../types';
import { safeConsoleWrite, sanitizeLogText } from '../security/logSanitize.js';

export class Logger {
  private level: 'debug' | 'info' | 'warn' | 'error';
  private history: LogEntry[] = [];
  private maxHistory: number = 1000;

  private levelPriority = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(level: 'debug' | 'info' | 'warn' | 'error' = 'info') {
    this.level = level;
  }

  debug(message: string, context?: unknown): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: unknown): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: unknown): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: unknown): void {
    this.log('error', message, context);
  }

  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context?: unknown
  ): void {
    if (this.levelPriority[level] < this.levelPriority[this.level]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message: sanitizeLogText(message),
      timestamp: Date.now(),
      context,
    };

    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}]`;
    const payload =
      context === undefined
        ? sanitizeLogText(message)
        : `${sanitizeLogText(message)} ${sanitizeLogText(context)}`;

    safeConsoleWrite(level, prefix, payload);
  }

  setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.level = level;
  }

  getHistory(): LogEntry[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}

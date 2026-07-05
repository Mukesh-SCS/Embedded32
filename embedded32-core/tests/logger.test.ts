/**
 * Logger Tests
 */

import { Logger } from '../src/logger/Logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger('info');
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log levels', () => {
    it('should log info messages with constant format strings', () => {
      logger.info('Test info message');
      expect(console.log).toHaveBeenCalledWith('%s', expect.any(String));
    });

    it('should log warn messages', () => {
      logger.warn('Test warning message');
      expect(console.warn).toHaveBeenCalledWith('%s', expect.any(String));
    });

    it('should log error messages', () => {
      logger.error('Test error message');
      const history = logger.getHistory();
      expect(history.some((entry) => entry.level === 'error')).toBe(true);
    });

    it('should not log debug messages when level is info', () => {
      logger.debug('Test debug message');
      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('log injection resistance', () => {
    it('escapes forged log lines in messages', () => {
      logger.warn('client-1\n[ERROR] forged log entry');
      const call = (console.warn as jest.Mock).mock.calls[0];
      expect(call[0]).toBe('%s');
      expect(String(call[1])).toContain('client-1\\n[ERROR] forged log entry');
    });
  });

  describe('history tracking', () => {
    it('should store log entries in history', () => {
      logger.info('Test message 1');
      logger.warn('Test warning 2');
      expect(logger.getHistory().length).toBeGreaterThanOrEqual(2);
    });
  });
});

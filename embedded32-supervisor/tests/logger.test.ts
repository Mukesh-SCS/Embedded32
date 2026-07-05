import { Logger } from '../src/logger';

describe('supervisor Logger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('prevents forged log lines via newline injection', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const logger = new Logger('error');
    logger.error('client-1\n[ERROR] forged log entry');

    expect(spy).toHaveBeenCalledWith('%s %s', expect.any(String), expect.any(String));
    const messageArg = String(spy.mock.calls[0]?.[2]);
    expect(messageArg).toContain('client-1\\n[ERROR] forged log entry');
    expect(messageArg.split('\n').length).toBe(1);
  });

  it('sanitizes error context values', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const logger = new Logger('warn');
    logger.warn('event', 'value\r\ninjected');

    expect(spy.mock.calls[0]?.[0]).toBe('%s %s %s');
    expect(String(spy.mock.calls[0]?.[3])).toContain('\\r\\n');
  });
});

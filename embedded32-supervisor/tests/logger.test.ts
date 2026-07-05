import { Logger } from '../src/logger';

describe('supervisor Logger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('prevents forged log lines via newline injection', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const logger = new Logger('error');
    logger.error('client-1\n[ERROR] forged log entry');

    const payload = spy.mock.calls[0] && spy.mock.calls[0][1];
    expect(payload).toContain('client-1\\n[ERROR] forged log entry');
    expect(payload.split('\n').length).toBe(1);
    expect(spy).toHaveBeenCalledWith('%s', expect.any(String));
  });

  it('sanitizes error context values', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const logger = new Logger('warn');
    logger.warn('event', 'value\r\ninjected');

    expect(spy.mock.calls[0][0]).toBe('%s');
    expect(String(spy.mock.calls[0][1])).toContain('\\r\\n');
  });
});

import {
  MAX_LOG_VALUE_LENGTH,
  safeConsoleWrite,
  sanitizeLogText,
  serializeLogValue,
} from '../../src/security/logSanitize';

describe('logSanitize', () => {
  it('escapes format sequences', () => {
    expect(sanitizeLogText('%s %d')).toBe('%s %d');
  });

  it('escapes newline injection', () => {
    expect(sanitizeLogText('client-1\n[ERROR] forged')).toBe('client-1\\n[ERROR] forged');
  });

  it('escapes carriage-return injection', () => {
    expect(sanitizeLogText('line\rforged')).toBe('line\\rforged');
  });

  it('removes ANSI escape sequences', () => {
    expect(sanitizeLogText('\u001b[31mred\u001b[0m')).toBe('red');
  });

  it('serializes Error objects', () => {
    const text = serializeLogValue(new Error('boom'));
    expect(text).toContain('Error');
    expect(text).toContain('boom');
  });

  it('handles circular objects safely', () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.self = obj;
    expect(serializeLogValue(obj)).toContain('[Circular]');
  });

  it('truncates very large messages', () => {
    const huge = 'x'.repeat(MAX_LOG_VALUE_LENGTH + 50);
    const sanitized = sanitizeLogText(huge);
    expect(sanitized.length).toBeLessThan(huge.length);
    expect(sanitized).toContain('[truncated]');
  });

  it('uses constant format strings when writing to console', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    safeConsoleWrite('error', '[TEST]', 'client-1\nforged');
    expect(spy).toHaveBeenCalledWith(
      '%s %s',
      '[TEST]',
      expect.stringContaining('client-1\\nforged')
    );
    spy.mockRestore();
  });
});

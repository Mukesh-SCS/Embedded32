import { formatClientIdForLog } from '../src/tcpClientId';

describe('TCP client log formatting', () => {
  it('escapes forged log lines in remote client identifiers', () => {
    const clientId = formatClientIdForLog('10.0.0.1', 4000);
    expect(clientId).toBe('10.0.0.1:4000');
  });

  it('sanitizes malicious address values', () => {
    const clientId = formatClientIdForLog('client-1\n[ERROR] forged', 4000);
    expect(clientId).toContain('client-1\\n[ERROR] forged');
    expect(clientId.split('\n').length).toBe(1);
  });

  it('rejects invalid ports', () => {
    expect(formatClientIdForLog('10.0.0.1', 99999)).toBe('10.0.0.1:invalid');
  });
});

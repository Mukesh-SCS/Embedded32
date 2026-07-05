import { setupVirtualCAN } from '../src/commands/CANSetupCommand.js';

describe('CANSetupCommand', () => {
  it('rejects malicious interface names before invoking subprocesses', async () => {
    const malicious = ['vcan0; id', '$(id)', 'vcan0\nwhoami', '../../tmp/x'];
    for (const ifname of malicious) {
      const result = await setupVirtualCAN(ifname);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Invalid network interface name/i);
    }
  });
});

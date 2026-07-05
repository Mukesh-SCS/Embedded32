/**
 * Bridge package tests
 */

describe('Bridge package', () => {
  it('loads bridge modules', async () => {
    const mod = await import('../src/index.js');
    expect(mod.CanEthernetBridge).toBeDefined();
    expect(mod.RuleEngine).toBeDefined();
  });
});

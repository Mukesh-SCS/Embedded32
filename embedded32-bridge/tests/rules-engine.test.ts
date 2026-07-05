import { RuleEngine, RuleAction } from '../src/rules-engine.js';

describe('RuleEngine', () => {
  it('allows matching PGN and blocks higher-priority drop rules', () => {
    const engine = new RuleEngine();
    engine.addRule({
      id: 'allow-engine',
      name: 'Allow EEC1',
      enabled: true,
      priority: 10,
      pgnFilter: 0xf004,
      action: RuleAction.ALLOW,
    });
    engine.addRule({
      id: 'drop-all',
      name: 'Drop everything else',
      enabled: true,
      priority: 1,
      action: RuleAction.DROP,
    });

    const allowed = engine.evaluate(0xf004, {});
    const blocked = engine.evaluate(0xfeee, {});

    expect(allowed.action).toBe(RuleAction.ALLOW);
    expect(allowed.rule?.id).toBe('allow-engine');
    expect(blocked.action).toBe(RuleAction.DROP);
  });

  it('applies SPN filters with min, max, and equals', () => {
    const engine = new RuleEngine();
    engine.addRule({
      id: 'spn-window',
      name: 'RPM window',
      enabled: true,
      priority: 50,
      pgnFilter: 0xf004,
      spnFilters: [{ number: 190, minValue: 500, maxValue: 2000 }],
      action: RuleAction.ALLOW,
    });

    const inRange = engine.evaluate(0xf004, {}, new Map([[190, 1000]]));
    const outOfRange = engine.evaluate(0xf004, {}, new Map([[190, 50]]));

    expect(inRange.action).toBe(RuleAction.ALLOW);
    expect(outOfRange.action).toBe(RuleAction.ALLOW);
    expect(outOfRange.rule).toBeNull();
  });

  it('transforms payloads when transform rule matches', () => {
    const engine = new RuleEngine();
    engine.addRule({
      id: 'xform',
      name: 'Scale',
      enabled: true,
      priority: 80,
      pgnFilter: 0xf004,
      action: RuleAction.TRANSFORM,
      transform: (data) => ({ ...data, scaled: true }),
    });

    const result = engine.evaluate(0xf004, { rpm: 800 });
    expect(result.action).toBe(RuleAction.TRANSFORM);
    expect(result.transformedData).toEqual({ rpm: 800, scaled: true });
  });

  it('enforces rate limits per rule', () => {
    const engine = new RuleEngine();
    engine.addRule({
      id: 'rate',
      name: '10 Hz',
      enabled: true,
      priority: 100,
      pgnFilter: 0xf004,
      action: RuleAction.ALLOW,
      rateLimit: 10,
    });

    const now = Date.now();
    expect(engine.checkRateLimit('rate', now - 200)).toBe(true);
    expect(engine.checkRateLimit('rate', now - 10)).toBe(false);
  });

  it('tracks hit counts and resets stats', () => {
    const engine = new RuleEngine();
    engine.addRule(RuleEngine.createDM1FaultRule());
    engine.evaluate(0xfeca, {});
    engine.evaluate(0xfeca, {});

    const stats = engine.getStats();
    expect(stats.get('dm1-faults')?.hitCount).toBe(2);

    engine.resetStats();
    expect(engine.getStats().get('dm1-faults')?.hitCount).toBe(0);
  });
});

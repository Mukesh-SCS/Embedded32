import { validateLinuxInterfaceName } from '../src/security/interfaceName';

describe('validateLinuxInterfaceName', () => {
  const valid = ['vcan0', 'can0', 'test-can.1'];

  it.each(valid)('accepts valid interface %s', (name) => {
    expect(validateLinuxInterfaceName(name)).toBe(name);
  });

  const invalid = [
    'vcan0; id',
    '$(id)',
    '`id`',
    'vcan0 && whoami',
    'vcan0\nwhoami',
    '../../tmp/x',
    '--help',
    'abcdefghijklmnop',
    '-vcan0',
    '',
  ];

  it.each(invalid)('rejects malicious interface %j', (name) => {
    expect(() => validateLinuxInterfaceName(name)).toThrow();
  });
});

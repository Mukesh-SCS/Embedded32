import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ConfigLoader, logRuntimeConfig } from '../src/config-loader';

describe('CLI ConfigLoader security', () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'embedded32-cli-'));
    configPath = path.join(tempDir, 'embedded32.yaml');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true });
    delete process.env.EMBEDDED32_MQTT_USERNAME;
    delete process.env.EMBEDDED32_MQTT_PASSWORD;
  });

  it('rejects inline MQTT credentials in YAML', () => {
    fs.writeFileSync(
      configPath,
      `
ethernet:
  mqtt:
    enabled: false
    broker: mqtt://localhost:1883
    username: inline
    password: inline
`
    );
    const loader = new ConfigLoader(configPath);
    expect(() => loader.load()).toThrow(/must not appear in embedded32\.yaml/);
  });

  it('reads MQTT credentials from environment when enabled', () => {
    process.env.EMBEDDED32_MQTT_USERNAME = 'student';
    process.env.EMBEDDED32_MQTT_PASSWORD = 'secret';
    fs.writeFileSync(
      configPath,
      `
ethernet:
  mqtt:
    enabled: true
    broker: mqtt://localhost:1883
`
    );
    const config = new ConfigLoader(configPath).load();
    expect(config.ethernet?.mqtt?.username).toBe('student');
    expect(config.ethernet?.mqtt?.password).toBe('secret');
  });

  it('redacts credentials when logging configuration', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logRuntimeConfig({
      ethernet: {
        mqtt: {
          enabled: true,
          broker: 'mqtt://localhost:1883',
          username: 'student',
          password: 'secret',
        },
      },
    } as never);

    const joined = spy.mock.calls
      .flat()
      .map((v) => (typeof v === 'string' ? v : JSON.stringify(v)))
      .join(' ');

    expect(joined).toContain('[REDACTED]');
    expect(joined).not.toContain('secret');

    spy.mockRestore();
  });
});

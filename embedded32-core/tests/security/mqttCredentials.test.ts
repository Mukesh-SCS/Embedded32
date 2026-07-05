import * as fs from 'fs';
import * as path from 'path';
import {
  MQTT_PASSWORD_ENV,
  MQTT_USERNAME_ENV,
  MqttCredentialError,
  resolveMqttCredentials,
} from '../../src/security/mqttCredentials';
import { redactSecrets } from '../../src/security/configRedact';

describe('mqttCredentials', () => {
  it('does not require credentials when MQTT is disabled', () => {
    expect(resolveMqttCredentials({ enabled: false, broker: 'mqtt://localhost:1883' })).toEqual({});
  });

  it('reads credentials from environment when MQTT is enabled', () => {
    const creds = resolveMqttCredentials(
      { enabled: true, broker: 'mqtt://localhost:1883' },
      { [MQTT_USERNAME_ENV]: 'student', [MQTT_PASSWORD_ENV]: 'secret' }
    );
    expect(creds).toEqual({ username: 'student', password: 'secret' });
  });

  it('errors when only username is provided', () => {
    expect(() =>
      resolveMqttCredentials(
        { enabled: true, broker: 'mqtt://localhost:1883' },
        { [MQTT_USERNAME_ENV]: 'student' }
      )
    ).toThrow(MqttCredentialError);
  });

  it('redacts secrets from serialized logs', () => {
    const redacted = redactSecrets({
      mqtt: { password: 'secret', broker: 'mqtt://localhost:1883' },
    });
    expect(redacted.mqtt.password).toBe('[REDACTED]');
    expect(redacted.mqtt.broker).toBe('mqtt://localhost:1883');
  });

  it('committed default config omits credential fields', () => {
    const yamlPath = path.resolve(__dirname, '../../../embedded32.yaml');
    const yaml = fs.readFileSync(yamlPath, 'utf8');
    expect(yaml).not.toMatch(/^\s*password\s*:/m);
    expect(yaml).not.toMatch(/^\s*username\s*:/m);
  });
});

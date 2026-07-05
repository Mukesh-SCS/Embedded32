export const MQTT_USERNAME_ENV = 'EMBEDDED32_MQTT_USERNAME';
export const MQTT_PASSWORD_ENV = 'EMBEDDED32_MQTT_PASSWORD';

export interface MqttAuthConfig {
  enabled: boolean;
  broker: string;
  clientId?: string;
}

export interface ResolvedMqttCredentials {
  username?: string;
  password?: string;
}

export class MqttCredentialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MqttCredentialError';
  }
}

export function resolveMqttCredentials(
  mqtt: MqttAuthConfig | undefined,
  env: NodeJS.ProcessEnv = process.env
): ResolvedMqttCredentials {
  if (!mqtt?.enabled) {
    return {};
  }

  const username = env[MQTT_USERNAME_ENV]?.trim();
  const password = env[MQTT_PASSWORD_ENV];

  if (username && !password) {
    throw new MqttCredentialError(
      `${MQTT_PASSWORD_ENV} is required when ${MQTT_USERNAME_ENV} is set`
    );
  }
  if (password && !username) {
    throw new MqttCredentialError(
      `${MQTT_USERNAME_ENV} is required when ${MQTT_PASSWORD_ENV} is set`
    );
  }

  if (username && password) {
    return { username, password };
  }

  return {};
}

export function stripInlineMqttCredentials<T extends Record<string, unknown>>(mqttSection: T): T {
  const copy = { ...mqttSection };
  delete (copy as Record<string, unknown>).username;
  delete (copy as Record<string, unknown>).password;
  return copy;
}

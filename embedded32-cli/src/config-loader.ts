import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { RuntimeConfig } from '@embedded32/supervisor';
import { validateConfigObject } from './security/configPath';
import { redactSecrets } from './security/configRedact';
import {
  MqttCredentialError,
  resolveMqttCredentials,
  stripInlineMqttCredentials,
} from './security/mqttCredentials';
import { safeConsoleWrite } from './security/logSanitize';

/**
 * Configuration loader - reads and validates embedded32.yaml
 */
export class ConfigLoader {
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || this.findConfigFile();
  }

  private findConfigFile(): string {
    const locations = [
      './embedded32.yaml',
      './config/embedded32.yaml',
      path.join(process.cwd(), 'embedded32.yaml'),
      path.join(process.cwd(), 'config', 'embedded32.yaml'),
      path.join(__dirname, '../embedded32.yaml'),
      path.join(__dirname, '../../embedded32.yaml'),
    ];

    for (const location of locations) {
      if (fs.existsSync(location)) {
        return location;
      }
    }

    throw new Error('embedded32.yaml not found in standard locations');
  }

  load(): RuntimeConfig {
    if (!fs.existsSync(this.configPath)) {
      throw new Error(`Configuration file not found: ${this.configPath}`);
    }

    try {
      const fileContent = fs.readFileSync(this.configPath, 'utf-8');
      const parsed = YAML.parse(fileContent) as RuntimeConfig;
      this.rejectInlineMqttCredentials(parsed);
      const validated = validateConfigObject(parsed) as RuntimeConfig;
      this.applyRuntimeMqttCredentials(validated);
      this.validate(validated);
      return validated;
    } catch (error) {
      if (error instanceof MqttCredentialError) {
        throw error;
      }
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Failed to load configuration: ${err.message}`);
    }
  }

  private rejectInlineMqttCredentials(config: RuntimeConfig): void {
    const mqtt = config.ethernet?.mqtt as Record<string, unknown> | undefined;
    if (!mqtt) return;
    if ('username' in mqtt || 'password' in mqtt) {
      throw new Error(
        'MQTT username/password must not appear in embedded32.yaml. Use EMBEDDED32_MQTT_USERNAME and EMBEDDED32_MQTT_PASSWORD environment variables instead.'
      );
    }
  }

  private applyRuntimeMqttCredentials(config: RuntimeConfig): void {
    if (!config.ethernet?.mqtt) return;
    const mqtt = config.ethernet.mqtt;
    const sanitized = stripInlineMqttCredentials(mqtt as Record<string, unknown>);
    Object.assign(mqtt, sanitized);
    delete (mqtt as Record<string, unknown>).username;
    delete (mqtt as Record<string, unknown>).password;

    const credentials = resolveMqttCredentials(mqtt);
    if (credentials.username) {
      mqtt.username = credentials.username;
      mqtt.password = credentials.password;
    }
  }

  private validate(config: RuntimeConfig): void {
    if (!config) {
      throw new Error('Configuration is empty');
    }

    if (config.can && !config.can.interface) {
      throw new Error('CAN interface must be specified');
    }

    if (config.ethernet?.mqtt?.enabled && !config.ethernet.mqtt.broker) {
      throw new Error('MQTT broker URL is required when MQTT is enabled');
    }

    if (config.dashboard?.enabled && !config.dashboard.port) {
      throw new Error('Dashboard port must be specified');
    }
  }

  static createDefault(): RuntimeConfig {
    return {
      can: {
        interface: 'vcan0',
        baudrate: 250000,
        enabled: true,
      },
      j1939: {
        enabled: true,
        databasePath: './data/j1939.db',
      },
      ethernet: {
        udp: {
          enabled: true,
          port: 5000,
        },
        tcp: {
          enabled: true,
          port: 9000,
        },
        mqtt: {
          enabled: false,
          broker: 'mqtt://localhost:1883',
          clientId: 'embedded32-default',
        },
      },
      bridge: {
        canEthernet: {
          enabled: true,
          whitelist: [0xf004, 0xfeca],
          rateLimit: {
            default: 10,
            0xf004: 20,
          },
        },
        canMqtt: {
          enabled: false,
          topicPrefix: 'vehicle',
          payloadFormat: 'nanoproto',
        },
      },
      dashboard: {
        enabled: true,
        port: 5173,
        host: 'localhost',
      },
      simulator: {
        engine: false,
        transmission: false,
        brakes: false,
      },
      logging: {
        level: 'info',
        console: true,
      },
    };
  }

  save(config: RuntimeConfig, filepath: string): void {
    try {
      const safe = redactSecrets(config);
      const yaml = YAML.stringify(safe);
      fs.writeFileSync(filepath, yaml, 'utf-8');
      safeConsoleWrite('log', '[ConfigLoader]', `Configuration saved to: ${filepath}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Failed to save configuration: ${err.message}`);
    }
  }

  getPath(): string {
    return this.configPath;
  }
}

export function logRuntimeConfig(config: RuntimeConfig): void {
  safeConsoleWrite('info', '[ConfigLoader]', 'Loaded configuration', redactSecrets(config));
}

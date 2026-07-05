export type PackageCardMeta = {
  slug: string;
  problem: string;
  runtime: string;
  hardwareFree: boolean;
  level: 'beginner' | 'advanced';
  related?: string;
  install: string;
};

export const PACKAGE_CARDS: Record<string, PackageCardMeta> = {
  can: {
    slug: 'can',
    problem: 'Send and receive CAN frames with mock or virtual drivers.',
    runtime: 'Node.js',
    hardwareFree: true,
    level: 'beginner',
    related: 'j1939',
    install: 'npm install @embedded32/can',
  },
  core: {
    slug: 'core',
    problem: 'Module runtime, message bus, and scheduler for embedded-style apps.',
    runtime: 'Node.js',
    hardwareFree: true,
    level: 'beginner',
    related: 'supervisor',
    install: 'npm install @embedded32/core',
  },
  j1939: {
    slug: 'j1939',
    problem: 'Parse, build, and decode SAE J1939 messages and PGNs.',
    runtime: 'Node.js',
    hardwareFree: true,
    level: 'beginner',
    related: 'can',
    install: 'npm install @embedded32/j1939',
  },
  sim: {
    slug: 'sim',
    problem: 'Simulate engine, transmission, and vehicle ECUs for teaching.',
    runtime: 'Node.js',
    hardwareFree: true,
    level: 'beginner',
    related: 'j1939',
    install: 'npm install @embedded32/sim',
  },
  tools: {
    slug: 'tools',
    problem: 'CLI for traces, simulation, and classroom workflows.',
    runtime: 'Node.js CLI',
    hardwareFree: true,
    level: 'beginner',
    related: 'sim',
    install: 'npm install @embedded32/tools',
  },
  bridge: {
    slug: 'bridge',
    problem: 'Route CAN traffic to MQTT and cloud endpoints.',
    runtime: 'Node.js',
    hardwareFree: true,
    level: 'advanced',
    related: 'ethernet',
    install: 'npm install @embedded32/bridge',
  },
  ethernet: {
    slug: 'ethernet',
    problem: 'TCP/UDP/MQTT clients for gateway and bridge scenarios.',
    runtime: 'Node.js',
    hardwareFree: true,
    level: 'advanced',
    related: 'bridge',
    install: 'npm install @embedded32/ethernet',
  },
  supervisor: {
    slug: 'supervisor',
    problem: 'Load and supervise modules with health monitoring.',
    runtime: 'Node.js',
    hardwareFree: true,
    level: 'advanced',
    related: 'core',
    install: 'npm install @embedded32/supervisor',
  },
  cli: {
    slug: 'cli',
    problem: 'Plugin-based CLI shell for Embedded32 workflows.',
    runtime: 'Node.js CLI',
    hardwareFree: true,
    level: 'advanced',
    related: 'tools',
    install: 'npm install @embedded32/cli',
  },
  'sdk-js': {
    slug: 'sdk-js',
    problem: 'High-level J1939 client SDK for application developers.',
    runtime: 'Node.js / browser bundlers',
    hardwareFree: true,
    level: 'beginner',
    related: 'j1939',
    install: 'npm install @embedded32/sdk-js',
  },
};

export function getPackageCard(slug: string): PackageCardMeta | undefined {
  return PACKAGE_CARDS[slug];
}

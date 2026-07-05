/**
 * Virtual CAN Setup Command
 *
 * Sets up virtual CAN interface (vcan0) on Linux/WSL
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { validateLinuxInterfaceName } from '../security/interfaceName.js';

const execFileAsync = promisify(execFile);

export interface CANSetupResult {
  success: boolean;
  interface: string;
  message: string;
  platform: string;
}

function detectPlatform(): 'linux' | 'wsl' | 'unsupported' {
  const platform = process.platform;

  if (platform === 'linux') {
    try {
      const isWSL = require('fs').existsSync('/proc/version');
      if (isWSL) {
        const version = require('fs').readFileSync('/proc/version', 'utf-8');
        if (version.toLowerCase().includes('microsoft') || version.toLowerCase().includes('wsl')) {
          return 'wsl';
        }
      }
    } catch {
      // Ignore
    }
    return 'linux';
  }

  return 'unsupported';
}

async function isVcanModuleLoaded(): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync('lsmod', []);
    return stdout.split('\n').some((line) => line.startsWith('vcan'));
  } catch {
    return false;
  }
}

async function interfaceExists(ifname: string): Promise<boolean> {
  try {
    await execFileAsync('ip', ['link', 'show', 'dev', ifname]);
    return true;
  } catch {
    return false;
  }
}

async function isInterfaceUp(ifname: string): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync('ip', ['link', 'show', 'dev', ifname]);
    return stdout.includes('state UP') || stdout.includes('state UNKNOWN');
  } catch {
    return false;
  }
}

/**
 * Setup virtual CAN interface
 */
export async function setupVirtualCAN(ifname: string = 'vcan0'): Promise<CANSetupResult> {
  let safeIfname: string;
  try {
    safeIfname = validateLinuxInterfaceName(ifname);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      interface: ifname,
      platform: process.platform,
      message,
    };
  }

  const platform = detectPlatform();

  if (platform === 'unsupported') {
    return {
      success: false,
      interface: safeIfname,
      platform: process.platform,
      message:
        `Virtual CAN is not supported on ${process.platform}.\n\n` +
        `To use virtual CAN, you need:\n` +
        `  • Linux with SocketCAN support, or\n` +
        `  • Windows with WSL2 (Windows Subsystem for Linux)\n\n` +
        `For WSL2 setup:\n` +
        `  1. Install WSL2: wsl --install\n` +
        `  2. Install Ubuntu: wsl --install -d Ubuntu\n` +
        `  3. Run this command inside WSL: embedded32 can up ${safeIfname}\n\n` +
        `The simulation will use an in-memory virtual CAN bus instead.`,
    };
  }

  console.log('%s', `  Platform: ${platform}`);
  console.log('%s', `  Interface: ${safeIfname}`);
  console.log('');

  const moduleLoaded = await isVcanModuleLoaded();
  if (!moduleLoaded) {
    console.log('%s', '  Loading vcan kernel module...');
    try {
      await execFileAsync('sudo', ['modprobe', 'vcan']);
      console.log('%s', '  ✓ vcan module loaded');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        interface: safeIfname,
        platform,
        message: `Failed to load vcan module. Try:\n  sudo modprobe vcan\n\nError: ${message}`,
      };
    }
  } else {
    console.log('%s', '  ✓ vcan module already loaded');
  }

  const exists = await interfaceExists(safeIfname);
  if (!exists) {
    console.log('%s', `  Creating ${safeIfname} interface...`);
    try {
      await execFileAsync('sudo', ['ip', 'link', 'add', 'dev', safeIfname, 'type', 'vcan']);
      console.log('%s', `  ✓ ${safeIfname} interface created`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        interface: safeIfname,
        platform,
        message: `Failed to create interface. Try:\n  sudo ip link add dev ${safeIfname} type vcan\n\nError: ${message}`,
      };
    }
  } else {
    console.log('%s', `  ✓ ${safeIfname} interface exists`);
  }

  const isUp = await isInterfaceUp(safeIfname);
  if (!isUp) {
    console.log('%s', `  Bringing ${safeIfname} up...`);
    try {
      await execFileAsync('sudo', ['ip', 'link', 'set', 'dev', safeIfname, 'up']);
      console.log('%s', `  ✓ ${safeIfname} is up`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        interface: safeIfname,
        platform,
        message: `Failed to bring interface up. Try:\n  sudo ip link set dev ${safeIfname} up\n\nError: ${message}`,
      };
    }
  } else {
    console.log('%s', `  ✓ ${safeIfname} is already up`);
  }

  console.log('');
  try {
    const { stdout } = await execFileAsync('ip', ['-details', 'link', 'show', 'dev', safeIfname]);
    console.log('%s', '  Interface details:');
    for (const line of stdout.split('\n')) {
      console.log('%s', `  ${line}`);
    }
  } catch {
    // Ignore
  }

  return {
    success: true,
    interface: safeIfname,
    platform,
    message: `${safeIfname} is ready for CAN traffic`,
  };
}

/**
 * Print vcan setup instructions for manual setup
 */
export function printManualSetupInstructions(ifname: string = 'vcan0'): void {
  const safeIfname = validateLinuxInterfaceName(ifname);
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    VIRTUAL CAN SETUP INSTRUCTIONS                          ║
╚════════════════════════════════════════════════════════════════════════════╝

To set up virtual CAN manually on Linux/WSL:

  # Load the vcan kernel module
  sudo modprobe vcan

  # Create virtual CAN interface
  sudo ip link add dev ${safeIfname} type vcan

  # Bring the interface up
  sudo ip link set dev ${safeIfname} up

  # Verify it's working
  ip -details link show ${safeIfname}

Once set up, you can run:

  embedded32 simulate vehicle/basic-truck
  embedded32 monitor ${safeIfname}

For Windows without WSL:
  The simulator will use an in-memory virtual CAN bus automatically.
  This works for development but won't integrate with real CAN tools.
`);
}

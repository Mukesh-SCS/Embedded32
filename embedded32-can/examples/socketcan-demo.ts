import { CANInterface, SocketCANDriver } from '../src/index.js';

/**
 * SocketCAN example: Real CAN communication on Linux
 *
 * Requirements:
 * - Linux-based system with SocketCAN support
 * - CAN interface available (e.g., can0, vcan0)
 *
 * Setup virtual CAN for testing:
 *   sudo ip link add dev vcan0 type vcan
 *   sudo ip link set up vcan0
 *
 * Run this example:
 *   npm run build
 *   node dist/examples/socketcan-demo.js
 */
async function socketcanExample() {
  console.log('=== SocketCAN Driver Example ===\n');

  let can: CANInterface;

  try {
    // Initialize SocketCAN driver
    const driver = new SocketCANDriver('vcan0'); // Use vcan0 for virtual testing
    can = new CANInterface(driver);

    console.log('✅ Connected to vcan0');

    // Register message handler
    can.onMessage((frame) => {
      console.log('📨 Received:', {
        id: `0x${frame.id.toString(16).toUpperCase()}`,
        data: frame.data,
        extended: frame.extended,
        timestamp: frame.timestamp,
      });
    });

    // Send some test frames
    console.log('\n📤 Sending frames...');

    can.send({
      id: 0x100,
      data: [0xaa, 0xbb, 0xcc, 0xdd],
      extended: false,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    can.send({
      id: 0x7df, // OBD-II request
      data: [0x02, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00],
      extended: false,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('\n✅ Example complete');
    can.close();
  } catch (err) {
    console.error('❌ Error:', (err as Error).message);
    process.exit(1);
  }
}

socketcanExample();

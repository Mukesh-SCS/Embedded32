/**
 * Basic J1939 Example (hardware-free)
 *
 * Demonstrates parsing, decoding, and mock CAN I/O using workspace packages.
 * Run from repository root after `npm run build`:
 *   npx tsx examples/j1939-basic.ts
 */

import { MockCANDriver, CANInterface } from '@embedded32/can';
import { parseJ1939Id, buildJ1939Id, decodeJ1939, getPGNInfo } from '@embedded32/j1939';

async function basicJ1939Example(): Promise<void> {
  console.log('Embedded32 J1939 basic example\n');

  const j1939Id = 0x18f00401;
  const parsed = parseJ1939Id(j1939Id);

  console.log('1. Parsed J1939 ID');
  console.log(`   ID:       0x${j1939Id.toString(16).toUpperCase()}`);
  console.log(`   Priority: ${parsed.priority}`);
  console.log(`   PGN:      0x${parsed.pgn.toString(16).toUpperCase().padStart(5, '0')}`);
  console.log(`   SA:       0x${parsed.sa.toString(16).toUpperCase().padStart(2, '0')}`);

  const pgnInfo = getPGNInfo(parsed.pgn);
  if (pgnInfo) {
    console.log(`   Name:     ${pgnInfo.name}`);
  }

  console.log('\n2. Decode frame');
  const decoded = decodeJ1939({
    id: j1939Id,
    data: [0x00, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70],
    extended: true,
  });
  console.log(`   ${decoded.name} from SA 0x${decoded.sa.toString(16)}`);

  console.log('\n3. Build ID round-trip');
  const builtId = buildJ1939Id({ priority: 6, pgn: 0xf004, sa: 0x00 });
  console.log(`   Built: 0x${builtId.toString(16).toUpperCase()}`);

  console.log('\n4. Mock CAN send/receive');
  const can = new CANInterface(new MockCANDriver());
  await new Promise<void>((resolve) => {
    can.onMessage((frame) => {
      const msg = decodeJ1939(frame);
      console.log(`   RX PGN 0x${msg.pgn.toString(16)} from SA 0x${msg.sa.toString(16)}`);
      can.close();
      resolve();
    });
    can.send({
      id: j1939Id,
      data: [0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88],
      extended: true,
    });
  });

  console.log('\nDone.');
}

basicJ1939Example().catch((error) => {
  console.error(error);
  process.exit(1);
});

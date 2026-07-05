/**
 * Lab 2 — J1939 messaging (starter)
 *
 *   npx tsx labs/lab-02-j1939-messaging/starter/lab.ts
 */

import { parseJ1939Id, buildJ1939Id, decodeJ1939, getPGNInfo } from '@embedded32/j1939';

const SAMPLE_ID = 0x18f00400;
const SAMPLE_DATA = [0x00, 0x00, 0x00, 0x7d, 0x40, 0x1f, 0x00, 0x00];

async function main(): Promise<void> {
  // Task 1 — parse the 29-bit identifier
  const parsed = parseJ1939Id(SAMPLE_ID);
  console.log(`LAB02_PRIORITY=${parsed.priority}`);
  console.log(`LAB02_PGN=0x${parsed.pgn.toString(16).toUpperCase()}`);
  console.log(`LAB02_SA=0x${parsed.sa.toString(16).toUpperCase().padStart(2, '0')}`);

  const info = getPGNInfo(parsed.pgn);
  console.log(`LAB02_NAME=${info?.name ?? 'Unknown'}`);

  // Task 2 — decode payload
  const decoded = decodeJ1939({
    id: SAMPLE_ID,
    data: SAMPLE_DATA,
    extended: true,
  });
  console.log(`LAB02_DECODED_NAME=${decoded.name}`);

  // Task 3 — build a new ID (engine ECU at SA 0x00, PGN EEC1, priority 6)
  // TODO: call buildJ1939Id with { priority: 6, pgn: 0xf004, sa: 0x00 }
  const builtId = 0; // replace with buildJ1939Id(...)
  console.log(`LAB02_BUILT_ID=0x${builtId.toString(16).toUpperCase()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

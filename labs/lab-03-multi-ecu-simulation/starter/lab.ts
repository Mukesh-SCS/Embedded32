/**
 * Lab 3 — Multi-ECU simulation (starter)
 *
 *   npx tsx labs/lab-03-multi-ecu-simulation/starter/lab.ts
 */

import { VirtualCANPort } from '@embedded32/can';
import { J1939PortImpl, parseJ1939Id, PGN } from '@embedded32/j1939';
import { EngineECU, TransmissionECU, DeterministicScheduler } from '@embedded32/sim';

const RUN_MS = 600;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const bus = new VirtualCANPort('lab03-bus');
  const sourceAddresses = new Set<number>();
  const pgns = new Set<number>();
  let frameCount = 0;

  bus.onFrame((frame) => {
    frameCount++;
    const parsed = parseJ1939Id(frame.id);
    sourceAddresses.add(parsed.sa);
    pgns.add(parsed.pgn);
  });

  // TODO: Create J1939PortImpl for engine (SA 0x00) and transmission (SA 0x03)
  // TODO: Create EngineECU and TransmissionECU with rateMs 100
  // TODO: bindJ1939Port on each ECU
  // TODO: Register both ECUs on DeterministicScheduler(10), start, wait RUN_MS, stop

  const scheduler = new DeterministicScheduler(10);
  // student wiring here

  await sleep(RUN_MS);
  scheduler.stop();
  bus.close();

  console.log(`LAB03_ECU_COUNT=${sourceAddresses.size}`);
  console.log(`LAB03_FRAME_COUNT=${frameCount}`);
  console.log(`LAB03_HAS_EEC1=${pgns.has(PGN.EEC1)}`);
  console.log(`LAB03_HAS_ETC1=${pgns.has(PGN.ETC1)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Lab 3 - Multi-ECU simulation (solution)
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

  const enginePort = new J1939PortImpl(bus, 0x00);
  const transPort = new J1939PortImpl(bus, 0x03);

  const engine = new EngineECU({ name: 'engine', address: 0x00, rateMs: 100 });
  const transmission = new TransmissionECU({
    name: 'transmission',
    address: 0x03,
    rateMs: 100,
  });

  engine.bindJ1939Port(enginePort);
  transmission.bindJ1939Port(transPort);

  const scheduler = new DeterministicScheduler(10);
  scheduler.register(engine);
  scheduler.register(transmission);
  scheduler.start();

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

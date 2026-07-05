/**
 * Lab 1 — CAN communication basics (solution)
 */

import { CANInterface, MockCANDriver } from '@embedded32/can';
import type { CANFrame } from '@embedded32/can';

const FILTER_ID = 0x200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function acceptFrame(frame: CANFrame): boolean {
  return frame.id === FILTER_ID;
}

async function main(): Promise<void> {
  const can = new CANInterface(new MockCANDriver());
  let sent = 0;
  let matched = 0;

  can.onMessage((frame) => {
    if (acceptFrame(frame)) {
      matched++;
      console.log(`MATCH id=0x${frame.id.toString(16)} data=[${frame.data.join(', ')}]`);
    }
  });

  const frames: CANFrame[] = [
    { id: 0x100, data: [1, 2, 3], extended: false },
    { id: 0x200, data: [4, 5, 6], extended: false },
    { id: 0x300, data: [7, 8, 9], extended: false },
  ];

  for (const frame of frames) {
    can.send(frame);
    sent++;
    await sleep(30);
  }

  await sleep(50);
  can.close();

  console.log(`LAB01_SENT=${sent}`);
  console.log(`LAB01_MATCHED=${matched}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

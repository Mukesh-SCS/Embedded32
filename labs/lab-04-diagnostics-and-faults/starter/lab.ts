/**
 * Lab 4 - Diagnostics and fault injection (starter)
 *
 *   npx tsx labs/lab-04-diagnostics-and-faults/starter/lab.ts
 */

import {
  DiagnosticsManager,
  buildJ1939Id,
  PGN_DM1,
  type DiagnosticTroubleCode,
} from '@embedded32/j1939';

/** Simulated engine ECU source address */
const ENGINE_SA = 0x00;

/**
 * TODO: Build an 8-byte DM1 payload with:
 * - MIL lamp ON (byte 0 bit 2 → use 0x04)
 * - SPN 26 (Engine Coolant Temperature), FMI 0 (above normal), OC 1
 *
 * Hint from course docs: bytes 1-4 encode the first DTC.
 * Example from examples/j1939-diagnostics.ts: [0x04, 0x1a, 0x00, 0x00, 0x01, ...]
 */
function buildCoolantFaultDm1(): number[] {
  // TODO: return correct 8-byte array
  return [0, 0, 0, 0, 0, 0, 0, 0];
}

function summarizeDtc(dtc: DiagnosticTroubleCode): string {
  return `SPN ${dtc.spn} (${dtc.spnDescription}) FMI ${dtc.fmi} - ${dtc.fmiDescription}`;
}

async function main(): Promise<void> {
  const dm = new DiagnosticsManager();
  const payload = buildCoolantFaultDm1();
  const message = dm.processDM1(ENGINE_SA, payload);

  if (!message) {
    console.log('LAB04_ERROR=no_dm1');
    process.exit(1);
  }

  const dtc = message.activeDTCs[0];
  const dm1Id = buildJ1939Id({ priority: 6, pgn: PGN_DM1, sa: ENGINE_SA });

  console.log(`LAB04_DM1_ID=0x${dm1Id.toString(16).toUpperCase()}`);
  console.log(`LAB04_MIL=${message.lamps.mil}`);
  console.log(`LAB04_DTC_SPN=${dtc?.spn ?? 0}`);
  console.log(`LAB04_DTC_FMI=${dtc?.fmi ?? -1}`);
  console.log(`LAB04_SUMMARY=${summarizeDtc(dtc)}`);
  console.log(`LAB04_ACTIVE_COUNT=${dm.getActiveDTCs(ENGINE_SA).length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

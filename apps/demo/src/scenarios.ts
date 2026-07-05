import type { ScenarioMeta } from './types';

/** Canonical scenario metadata registry. Descriptions are not duplicated in UI components. */
export const SCENARIO_META: Record<string, ScenarioMeta> = {
  'normal-operation': {
    scenario: 'normal-operation',
    title: 'Normal Operation',
    description: 'Engine and transmission broadcasts at cruise-like values',
    concepts: ['Periodic broadcast', 'EEC1', 'ET1', 'Multi-ECU bus'],
    ecus: ['Engine ECU', 'Transmission ECU'],
    observations: ['Steady engine speed', 'Coolant within range', 'No fault lamps'],
    faultSeverity: 'none',
    studentNotice: 'Notice how each ECU broadcasts on its own schedule with distinct source addresses.',
    relatedLab: 'lab-01-can-basics',
  },
  'engine-overheat': {
    scenario: 'engine-overheat',
    title: 'Engine Overheat',
    description: 'Coolant temperature elevated followed by DM1 active fault from engine ECU',
    concepts: ['ET1', 'DM1', 'Fault escalation'],
    ecus: ['Engine ECU'],
    observations: ['Rising coolant temp', 'DM1 fault posted', 'MIL lamp active'],
    faultSeverity: 'high',
    studentNotice: 'Watch how a sensor reading precedes an active diagnostic trouble code.',
    relatedLab: 'lab-04-diagnostics-and-faults',
  },
  'sensor-failure': {
    scenario: 'sensor-failure',
    title: 'Sensor Failure',
    description: 'Barometric pressure SPN reports erratic above-normal reading',
    concepts: ['AMB', 'SPN/FMI', 'Sensor faults'],
    ecus: ['Engine ECU'],
    observations: ['Invalid sensor value', 'DM1 with FMI 0'],
    faultSeverity: 'medium',
    studentNotice: 'Compare the barometric pressure reading against expected ambient values.',
    relatedLab: 'lab-04-diagnostics-and-faults',
  },
  'high-bus-load': {
    scenario: 'high-bus-load',
    title: 'High Bus Load',
    description: 'Rapid alternating EEC1 and ETC1 frames for bus load discussion',
    concepts: ['Bus load', 'Frame rate', 'Bandwidth'],
    ecus: ['Engine ECU', 'Transmission ECU'],
    observations: ['High frame rate', 'Bus load meter rises', 'No faults'],
    faultSeverity: 'none',
    studentNotice: 'Observe how frame frequency affects estimated bus utilization.',
    relatedLab: 'lab-02-j1939-messaging',
  },
  'address-claim-conflict': {
    scenario: 'address-claim-conflict',
    title: 'Address Claim Conflict',
    description: 'Two ECUs send Address Claimed (PGN 60928) for the same source address with different NAME values',
    concepts: ['Address claiming', 'NAME arbitration', 'PGN 60928'],
    ecus: ['Engine ECU', 'Transmission ECU'],
    observations: ['Two Address Claimed frames', 'Same source address', 'Different NAME values'],
    faultSeverity: 'high',
    studentNotice: 'Two devices claim address 0x00. Lower NAME value wins arbitration in J1939.',
    relatedLab: 'lab-02-j1939-messaging',
  },
  'multi-packet-message': {
    scenario: 'multi-packet-message',
    title: 'Multi-Packet Message (BAM)',
    description: 'TP.CM BAM announce and TP.DT data frames for teaching (not full transport validation)',
    concepts: ['TP.CM', 'TP.DT', 'BAM reassembly'],
    ecus: ['Engine ECU'],
    observations: ['BAM announcement', 'Sequential TP.DT packets', 'Reassembly progress'],
    faultSeverity: 'none',
    studentNotice: 'Follow the BAM sequence numbers and watch reassembly complete.',
    relatedLab: 'lab-02-j1939-messaging',
  },
};

export function getScenarioMeta(scenario: string): ScenarioMeta | undefined {
  return SCENARIO_META[scenario];
}

export type LabCardMeta = {
  slug: string;
  number: string;
  shortTitle: string;
  duration: string;
  hardware: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objective: string;
  prerequisites: string[];
};

export const LAB_CARDS: Record<string, LabCardMeta> = {
  'lab-01-can-basics': {
    slug: 'lab-01-can-basics',
    number: '01',
    shortTitle: 'CAN BASICS',
    duration: '45–60 MIN',
    hardware: 'NO HARDWARE',
    difficulty: 'beginner',
    objective: 'Identify CAN frame fields, interpret hex traces, and explain broadcast vs addressed frames.',
    prerequisites: ['Basic programming', 'Completed getting-started guide'],
  },
  'lab-02-j1939-messaging': {
    slug: 'lab-02-j1939-messaging',
    number: '02',
    shortTitle: 'J1939 MESSAGING',
    duration: '60–75 MIN',
    hardware: 'NO HARDWARE',
    difficulty: 'beginner',
    objective: 'Decode PGNs, source addresses, and scaling for common engine messages.',
    prerequisites: ['Lab 01 or equivalent CAN familiarity'],
  },
  'lab-03-multi-ecu-simulation': {
    slug: 'lab-03-multi-ecu-simulation',
    number: '03',
    shortTitle: 'MULTI-ECU SIM',
    duration: '60–90 MIN',
    hardware: 'NO HARDWARE',
    difficulty: 'intermediate',
    objective: 'Run a multi-ECU simulation and correlate bus traffic with vehicle behavior.',
    prerequisites: ['Lab 02', 'Node.js development environment'],
  },
  'lab-04-diagnostics-and-faults': {
    slug: 'lab-04-diagnostics-and-faults',
    number: '04',
    shortTitle: 'DIAGNOSTICS',
    duration: '45–60 MIN',
    hardware: 'NO HARDWARE',
    difficulty: 'intermediate',
    objective: 'Interpret DM1 messages, SPN/FMI pairs, and lamp status bytes.',
    prerequisites: ['Lab 02', 'Diagnostics concept guide'],
  },
};

export function getLabCard(slug: string): LabCardMeta | undefined {
  return LAB_CARDS[slug];
}

export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Start',
    items: [
      { label: 'Getting started', href: '/docs/getting-started' },
      { label: 'First run', href: '/docs/tutorials/first-run' },
      { label: 'Package guide', href: '/docs/package-guide' },
    ],
  },
  {
    title: 'Learn',
    items: [
      { label: 'CAN concepts', href: '/docs/concepts/can' },
      { label: 'J1939 concepts', href: '/docs/concepts/j1939' },
      { label: 'ECU simulation', href: '/docs/concepts/ecu-simulation' },
      { label: 'Diagnostics', href: '/docs/concepts/diagnostics' },
      { label: 'Bridge & MQTT', href: '/docs/concepts/bridge' },
      { label: 'Runtime', href: '/docs/concepts/runtime' },
    ],
  },
  {
    title: 'Education',
    items: [
      { label: 'Course overview', href: '/docs/education/course-module' },
      { label: 'Student guide', href: '/docs/education/student-guide' },
      { label: 'Instructor guide', href: '/docs/education/instructor-guide' },
      { label: 'Learning outcomes', href: '/docs/education/learning-outcomes' },
    ],
  },
  {
    title: 'Labs',
    items: [
      { label: 'All labs', href: '/labs' },
      { label: 'Lab 1 - CAN basics', href: '/labs/lab-01-can-basics' },
      { label: 'Lab 2 - J1939 messaging', href: '/labs/lab-02-j1939-messaging' },
      { label: 'Lab 3 - Multi-ECU sim', href: '/labs/lab-03-multi-ecu-simulation' },
      { label: 'Lab 4 - Diagnostics', href: '/labs/lab-04-diagnostics-and-faults' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { label: 'Packages', href: '/packages' },
      { label: 'Interactive demo', href: '/demo' },
      { label: 'API reference', href: '/api-ref/index.html' },
      { label: 'Architecture', href: '/docs/architecture' },
      { label: 'Citation', href: '/cite' },
    ],
  },
];

export const FOOTER_SECTIONS: NavSection[] = [
  {
    title: 'Learn',
    items: [
      { label: 'Getting started', href: '/docs/getting-started' },
      { label: 'Classroom labs', href: '/labs' },
      { label: 'Interactive demo', href: '/demo' },
      { label: 'For instructors', href: '/teach' },
    ],
  },
  {
    title: 'Build',
    items: [
      { label: 'Packages', href: '/packages' },
      { label: 'API reference', href: '/api-ref/index.html' },
      { label: 'Architecture', href: '/docs/architecture' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    title: 'Community',
    items: [
      { label: 'Contribute', href: '/contribute' },
      { label: 'GitHub', href: 'https://github.com/Mukesh-SCS/Embedded32' },
      { label: 'About', href: '/about' },
    ],
  },
  {
    title: 'Legal & status',
    items: [
      { label: 'Citation', href: '/cite' },
      { label: 'MIT License', href: 'https://github.com/Mukesh-SCS/Embedded32/blob/main/LICENSE' },
      { label: 'Security', href: 'https://github.com/Mukesh-SCS/Embedded32/blob/main/SECURITY.md' },
    ],
  },
];

/** @deprecated use FOOTER_SECTIONS */
export const FOOTER_LINKS: NavItem[] = FOOTER_SECTIONS.flatMap((s) => s.items);

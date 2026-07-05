import type { Metadata } from 'next';
import { MaturityBanner, SiteFooter, SiteHeader } from '@/components/SiteChrome';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Embedded32 — CAN & J1939 education platform',
    template: '%s · Embedded32',
  },
  description:
    'Open-source TypeScript platform for learning CAN, SAE J1939, ECU simulation, and diagnostics without hardware.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MaturityBanner />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

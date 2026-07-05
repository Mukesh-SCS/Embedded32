import type { Metadata } from 'next';
import { MaturityBanner, SiteFooter, SiteHeader } from '@/components/SiteChrome';
import './globals.css';

const SITE_URL = 'https://mukesh-scs.github.io/Embedded32';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Embedded32 - CAN & J1939 education platform',
    template: '%s · Embedded32',
  },
  description:
    'Open-source TypeScript platform for learning CAN, SAE J1939, ECU simulation, and diagnostics without hardware.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Embedded32',
    title: 'Embedded32 - CAN & J1939 education platform',
    description:
      'Learn CAN, J1939, ECU simulation, and diagnostics with hardware-free labs and a browser demo.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Embedded32',
    description: 'CAN & J1939 education platform with browser demo and classroom labs.',
  },
  robots: { index: true, follow: true },
  manifest: '/Embedded32/manifest.webmanifest',
  icons: { icon: '/Embedded32/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MaturityBanner />
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

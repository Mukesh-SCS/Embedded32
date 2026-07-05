'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { withBasePath } from '@/lib/basePath';
import styles from './site-chrome.module.css';

const PRIMARY_NAV = [
  { label: 'Docs', href: '/docs/getting-started', testId: 'nav-docs' },
  { label: 'Labs', href: '/labs', testId: 'nav-labs' },
  { label: 'Packages', href: '/packages', testId: 'nav-packages' },
  { label: 'Demo', href: '/demo', testId: 'nav-demo' },
  { label: 'API', href: '/api-ref/index.html', external: true },
  { label: 'GitHub', href: 'https://github.com/Mukesh-SCS/Embedded32', external: true },
];

function navIsActive(pathname: string, href: string): boolean {
  if (href.startsWith('http') || href.startsWith('/api-ref')) return false;
  if (href === '/labs') return pathname.startsWith('/labs');
  if (href === '/packages') return pathname.startsWith('/packages');
  if (href === '/demo') return pathname.startsWith('/demo');
  if (href.startsWith('/docs')) return pathname.startsWith('/docs');
  return pathname === href;
}

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.topNav} aria-label="Primary">
      {PRIMARY_NAV.map((item) => {
        const active = navIsActive(pathname, item.href);
        const cls = active ? styles.activeNav : undefined;
        if (item.external) {
          const href = item.href.startsWith('/api-ref') ? withBasePath(item.href) : item.href;
          return (
            <a
              key={item.href}
              href={href}
              className={cls}
              {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {item.label}
            </a>
          );
        }
        return (
          <Link key={item.href} href={item.href} className={cls} data-testid={item.testId}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <details className={styles.mobileNav} data-testid="mobile-nav">
      <summary className={styles.mobileNavSummary} aria-label="Open navigation menu">
        Menu
      </summary>
      <nav className={styles.mobileNavPanel} aria-label="Mobile primary">
        {PRIMARY_NAV.map((item) => {
          const active = navIsActive(pathname, item.href);
          if (item.external) {
            const href = item.href.startsWith('/api-ref') ? withBasePath(item.href) : item.href;
            return (
              <a
                key={item.href}
                href={href}
                className={active ? styles.activeNav : undefined}
                {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {item.label}
              </a>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? styles.activeNav : undefined}
              data-testid={item.testId}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </details>
  );
}

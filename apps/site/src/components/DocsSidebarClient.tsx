'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { withBasePath } from '@/lib/basePath';
import { NAV_SECTIONS } from '@/lib/nav';
import styles from './site-chrome.module.css';

function isApiRef(href: string): boolean {
  return href.startsWith('/api-ref');
}

export function DocsSidebarClient({ activePath }: { activePath?: string }) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebarWrap}>
      <details className={styles.sidebarMobile} open>
        <summary className={styles.sidebarSummary}>Documentation navigation</summary>
        <nav className={styles.sidebar} aria-label="Documentation">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className={styles.sidebarSection}>
              <h2>{section.title}</h2>
              <ul>
                {section.items.map((item) => {
                  const isActive = activePath === item.href || pathname === item.href;
                  if (isApiRef(item.href)) {
                    return (
                      <li key={item.href}>
                        <a href={withBasePath(item.href)}>{item.label}</a>
                      </li>
                    );
                  }
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={isActive ? styles.activeLink : undefined}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </details>
    </aside>
  );
}

import Link from 'next/link';
import { withBasePath } from '@/lib/basePath';
import { FOOTER_LINKS, NAV_SECTIONS } from '@/lib/nav';
import styles from './site-chrome.module.css';

function isApiRef(href: string): boolean {
  return href.startsWith('/api-ref');
}

export function MaturityBanner() {
  return (
    <div className={styles.banner} role="note">
      <strong>Teaching platform.</strong> Embedded32 is for learning and prototyping — not
      automotive-certified, safety-certified, or a complete SAE J1939 stack.
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>E32</span>
          <span>Embedded32</span>
        </Link>
        <nav className={styles.topNav} aria-label="Primary">
          <Link href="/docs/getting-started">Docs</Link>
          <Link href="/labs">Labs</Link>
          <Link href="/packages">Packages</Link>
          <a href={withBasePath('/api-ref/index.html')}>API</a>
          <Link href="/demo">Demo</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p>MIT © Mukesh Mani Tripathi — open-source education platform for CAN &amp; J1939.</p>
        <nav className={styles.footerLinks} aria-label="Footer">
          {FOOTER_LINKS.map((item) =>
            item.href.startsWith('http') ? (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </footer>
  );
}

export function DocsSidebar({ activePath }: { activePath?: string }) {
  return (
    <aside className={styles.sidebar}>
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className={styles.sidebarSection}>
          <h2>{section.title}</h2>
          <ul>
            {section.items.map((item) => (
              <li key={item.href}>
                {isApiRef(item.href) ? (
                  <a href={withBasePath(item.href)}>{item.label}</a>
                ) : (
                  <Link
                    href={item.href}
                    className={activePath === item.href ? styles.activeLink : undefined}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}

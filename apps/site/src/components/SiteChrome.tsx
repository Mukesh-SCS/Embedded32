import Link from 'next/link';
import { FOOTER_SECTIONS } from '@/lib/nav';
import { StatusStrip } from '@/components/ui/StatusStrip';
import { DocsSidebarClient } from './DocsSidebarClient';
import { MainNav, MobileNav } from './MainNav';
import styles from './site-chrome.module.css';

export function MaturityBanner() {
  return (
    <StatusStrip variant="dark" role="note">
      <span>EDUCATION BUILD // NOT SAFETY-CERTIFIED // SYNTHETIC DEMO DATA</span>
      <span className={styles.bannerDetail}>
        Embedded32 is for learning and prototyping — not automotive-certified, safety-certified, or a complete SAE
        J1939 stack.
      </span>
    </StatusStrip>
  );
}

export function SiteHeader() {
  return (
    <header className={styles.header} data-testid="site-header">
      <a href="#main-content" className="skipLink">
        Skip to main content
      </a>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand} data-testid="site-home-link">
          <span className={styles.brandMark} aria-hidden="true">
            E32
          </span>
          <span className={styles.brandText}>Embedded32</span>
        </Link>
        <div className={styles.desktopNav}>
          <MainNav />
        </div>
        <MobileNav />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className={styles.footerHeading}>{section.title}</h2>
            <ul className={styles.footerList}>
              {section.items.map((item) => (
                <li key={item.href}>
                  {item.href.startsWith('http') ? (
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href}>{item.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className={styles.footerCopy}>MIT © Mukesh Mani Tripathi — open-source CAN &amp; J1939 education platform.</p>
    </footer>
  );
}

export function DocsSidebar({ activePath }: { activePath?: string }) {
  return <DocsSidebarClient activePath={activePath} />;
}

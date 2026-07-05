import type { Metadata } from 'next';
import Link from 'next/link';
import { BrutalButton } from '@/components/ui/BrutalButton';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <div className={`page ${styles.wrap}`}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Route not found</h1>
      <p className={styles.lead}>This path is not part of the Embedded32 static site export.</p>
      <div className={styles.actions}>
        <BrutalButton variant="yellow" href="/">
          Home
        </BrutalButton>
        <BrutalButton variant="cyan" href="/docs/getting-started">
          Documentation
        </BrutalButton>
        <Link href="/demo">Demo</Link>
      </div>
    </div>
  );
}

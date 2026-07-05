import type { ReactNode } from 'react';
import styles from './ui.module.css';
import type { Variant } from './BrutalButton';

const calloutVariant: Record<Variant, string | undefined> = {
  default: undefined,
  yellow: styles.cardYellow,
  cyan: styles.cardCyan,
  green: styles.cardGreen,
  warning: styles.cardWarning,
  danger: styles.cardDanger,
  dark: styles.cardDark,
};

export function Callout({
  title,
  variant = 'default',
  children,
}: {
  title?: string;
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <aside className={[styles.callout, calloutVariant[variant]].filter(Boolean).join(' ')}>
      {title && <p className={styles.calloutTitle}>{title}</p>}
      <div className={styles.calloutBody}>{children}</div>
    </aside>
  );
}

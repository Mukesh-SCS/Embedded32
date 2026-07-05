import styles from './ui.module.css';
import type { Variant } from './BrutalButton';

const badgeVariant: Record<Variant, string | undefined> = {
  default: undefined,
  yellow: styles.badgeYellow,
  cyan: styles.badgeCyan,
  green: styles.badgeGreen,
  warning: styles.badgeWarning,
  danger: styles.badgeDanger,
  dark: styles.badgeDark,
};

export function Badge({ variant = 'default', children }: { variant?: Variant; children: React.ReactNode }) {
  return <span className={[styles.badge, badgeVariant[variant]].filter(Boolean).join(' ')}>{children}</span>;
}

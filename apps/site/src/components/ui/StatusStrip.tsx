import styles from './ui.module.css';
import type { Variant } from './BrutalButton';

export function StatusStrip({
  children,
  variant = 'default',
  role = 'status',
}: {
  children: React.ReactNode;
  variant?: Variant | 'dark';
  role?: 'status' | 'note';
}) {
  return (
    <div
      className={[styles.statusStrip, variant === 'dark' ? styles.statusStripDark : undefined]
        .filter(Boolean)
        .join(' ')}
      role={role}
    >
      {children}
    </div>
  );
}

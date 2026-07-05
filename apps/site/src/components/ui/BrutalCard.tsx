import type { ReactNode } from 'react';
import styles from './ui.module.css';
import type { Variant } from './BrutalButton';

const cardVariant: Record<Variant, string | undefined> = {
  default: undefined,
  yellow: styles.cardYellow,
  cyan: styles.cardCyan,
  green: styles.cardGreen,
  warning: styles.cardWarning,
  danger: styles.cardDanger,
  dark: styles.cardDark,
};

export function BrutalCard({
  variant = 'default',
  className,
  children,
  ...props
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const Tag = 'article';
  return (
    <Tag className={[styles.card, cardVariant[variant], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </Tag>
  );
}

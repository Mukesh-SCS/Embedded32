import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { withBasePath } from '@/lib/basePath';
import styles from './ui.module.css';

export type Variant = 'default' | 'yellow' | 'cyan' | 'green' | 'warning' | 'danger' | 'dark';

const variantClass: Record<Variant, string | undefined> = {
  default: undefined,
  yellow: styles.btnYellow,
  cyan: styles.btnCyan,
  green: styles.btnGreen,
  warning: styles.btnWarning,
  danger: styles.btnDanger,
  dark: styles.btnDark,
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
  children: ReactNode;
};

export function BrutalButton({ variant = 'default', className, href, children, ...props }: Props) {
  const cls = [styles.btn, variantClass[variant], className].filter(Boolean).join(' ');
  if (href) {
    const resolved = href.startsWith('/') ? withBasePath(href) : href;
    return (
      <a
        href={resolved}
        className={cls}
        {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}

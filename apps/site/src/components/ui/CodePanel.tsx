'use client';

import { useCallback, useState } from 'react';
import styles from './ui.module.css';

export function CodePanel({ code, language = 'code' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [code]);

  return (
    <div className={styles.codePanel}>
      <div className={styles.codePanelHeader}>
        <span>{language}</span>
        <button type="button" className={styles.copyBtn} onClick={copy} aria-label="Copy code">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={styles.codePanelBody}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

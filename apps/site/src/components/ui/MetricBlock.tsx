import styles from './ui.module.css';

export function MetricBlock({ label, value, testId }: { label: string; value: string | number; testId?: string }) {
  return (
    <div className={styles.metricBlock}>
      <span className={styles.metricLabel}>{label}</span>
      <strong className={styles.metricValue} data-testid={testId}>
        {value}
      </strong>
    </div>
  );
}

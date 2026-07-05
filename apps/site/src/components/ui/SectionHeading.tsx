import styles from './ui.module.css';

export function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 className={styles.sectionHeading} id={id}>
      {children}
    </h2>
  );
}

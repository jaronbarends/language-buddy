import styles from './Loader.module.css';

export default function Loader({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div className={styles.loader} role="status" aria-label={ariaLabel}>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
    </div>
  );
}

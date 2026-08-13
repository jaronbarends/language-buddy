import styles from './Evaluation.module.css';

export default function Evaluation({ evaluation }: { evaluation: string }) {
  return <div className={styles.evaluation}>{evaluation}</div>;
}

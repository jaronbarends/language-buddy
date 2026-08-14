import styles from './Evaluation.module.css';

export default function Evaluation({ evaluation }: { evaluation: string }) {
  return (
    <div className={styles.evaluation}>
      <h1>Evaluation</h1>
      <div className={styles.evaluationContent}>{evaluation}</div>
    </div>
  );
}

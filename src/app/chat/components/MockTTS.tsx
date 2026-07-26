import styles from './MockTTS.module.css';

export default function MockTTS() {
  return (
    <div>
      <textarea id="mockTTS" className={styles.textarea} />
    </div>
  );
}

import styles from './page.module.css';

export default function ConversationPage() {
  return (
    <div className={styles.page}>
      <div className={styles.chatArea}>chat</div>
      <div className={styles.controlsArea}>controls</div>
    </div>
  );
}

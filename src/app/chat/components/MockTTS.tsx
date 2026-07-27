import { type ChatPhase } from '@/app/chat/chatReducer';

import styles from './MockTTS.module.css';

export default function MockTTS({ phase }: { phase: ChatPhase }) {
  return (
    <div>
      <textarea id="mockTTS" className={styles.textarea} disabled={phase.status !== 'listening'} />
    </div>
  );
}

import { ChatPhase } from '@/app/chat/chatConversation/chatReducer';

import styles from './ErrorArea.module.css';

export default function ErrorArea({ phase }: { phase: ChatPhase }) {
  if (phase.status !== 'error') {
    return <></>;
  }

  return <div className={styles.component}>{phase.error.error}</div>;
}

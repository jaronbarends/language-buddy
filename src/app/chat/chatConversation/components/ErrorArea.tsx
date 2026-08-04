import { ChatPhase } from '@/app/chat/chatConversation/chatReducer';
import { hasError } from '@/app/chat/chatConversation/chatReducer';

import styles from './ErrorArea.module.css';

export default function ErrorArea({ phase }: { phase: ChatPhase }) {
  if (!hasError(phase)) {
    return <></>;
  }

  return <div className={styles.component}>{phase.error.error}</div>;
}

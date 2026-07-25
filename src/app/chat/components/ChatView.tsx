import { type ChatState } from '@/app/chat/chatReducer';

import styles from './ChatView.module.css';

type PropsType = {
  state: ChatState;
};

export default function ChatView({ state }: PropsType) {
  return <div className={styles.component}>Chat view</div>;
}

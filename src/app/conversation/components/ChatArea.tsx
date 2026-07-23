import { type ChatState } from '@/app/conversation/chatReducer';

import styles from './ChatArea.module.css';

type PropsType = {
  state: ChatState;
};

export default function ChatArea({ state }: PropsType) {
  return <div className={styles.component}>Chat Area</div>;
}

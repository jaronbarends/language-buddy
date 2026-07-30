import clsx from 'clsx';

import { type ThreadItem } from '@/app/chat/chatConversation/chatReducer';

import styles from './ThreadView.module.css';

export default function ThreadView({ threadItems }: { threadItems: ThreadItem[] }) {
  return (
    <div className={styles.component}>
      <ol className={styles.threadItems}>
        {threadItems.map((item, idx) => {
          const authorClassName =
            item.author === 'ai' ? styles.messageFromAi : styles.messageFromUser;
          return (
            <li key={idx} className={clsx(styles.message, authorClassName)}>
              {item.message}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

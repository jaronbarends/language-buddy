import clsx from 'clsx';

import { type ThreadItem } from '@/app/chat/chatReducer';

import styles from './ChatView.module.css';

export default function ChatView({ threadItems }: { threadItems: ThreadItem[] }) {
  console.log('rerender');
  return (
    <div className={styles.component}>
      Chat view
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

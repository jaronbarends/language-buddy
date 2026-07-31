import clsx from 'clsx';

import { type ThreadItem } from '@/app/chat/chatConversation/chatReducer';
import { type LanguageVoice } from '@/lib/language';

import { AIThreadItemContent } from './AIThreadItemContent';

import styles from './ThreadView.module.css';

type threadItemsProps = {
  threadItems: ThreadItem[];
  languageVoice: LanguageVoice;
};

export default function ThreadView({ threadItems, languageVoice }: threadItemsProps) {
  return (
    <div className={styles.component}>
      <ol className={styles.threadItems}>
        {threadItems.map((item, idx) => {
          const authorClassName =
            item.author === 'ai' ? styles.messageFromAi : styles.messageFromUser;
          return (
            <li key={idx} className={clsx(styles.message, authorClassName)}>
              {item.author === 'ai' ? (
                <AIThreadItemContent message={item.message} languageVoice={languageVoice} />
              ) : (
                <div className={styles.itemContent}>{item.message}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

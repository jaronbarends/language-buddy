import clsx from 'clsx';
import { useEffect } from 'react';

import { type ThreadItem } from '@/app/chat/chatConversation/chatReducer';
import { type ChatPhase } from '@/app/chat/chatConversation/chatReducer';
import { type LanguageVoice } from '@/lib/language';
import { speakMessage } from '@/lib/textToSpeech';

import styles from './ThreadView.module.css';

type threadItemsProps = {
  phase: ChatPhase;
  threadItems: ThreadItem[];
  languageVoice: LanguageVoice;
  onAISpeechEnd: () => void;
};

export default function ThreadView({
  phase,
  threadItems,
  languageVoice,
  onAISpeechEnd,
}: threadItemsProps) {
  useEffect(() => {
    if (phase.status !== 'aiTurnSpeaking') {
      return;
    }
    startAISpeechWithLastMessage();
  }, [phase]);

  return (
    <div className={styles.component}>
      <ol className={styles.threadItems}>
        {threadItems.map((item, idx) => {
          const authorClassName =
            item.author === 'ai' ? styles.messageFromAi : styles.messageFromUser;
          return (
            <li key={idx} className={clsx(styles.message, authorClassName)}>
              <div className={styles.itemContent}>{item.message}</div>
              {/* {item.author === 'ai' && languageVoice && (
                <div className={styles.buttonWrapper}>button</div>
              )} */}
            </li>
          );
        })}
      </ol>
    </div>
  );

  function startAISpeechWithLastMessage() {
    const message = threadItems[threadItems.length - 1].message;
    speakMessage(message, languageVoice, onAISpeechEnd);
  }
}

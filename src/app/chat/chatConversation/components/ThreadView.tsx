import clsx from 'clsx';
import { useEffect, useRef } from 'react';

import { type ThreadItem } from '@/app/chat/chatConversation/chatReducer';
import { type ChatPhase } from '@/app/chat/chatConversation/chatReducer';
import { type LanguageVoice } from '@/lib/language';
import { cancelSpeech, speakMessage } from '@/lib/textToSpeech';

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
  const threadViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase.status !== 'aiTurnSpeaking') {
      return;
    }
    if (!languageVoice) {
      onAISpeechEnd();
      return;
    }

    let speechIsCancelled = false;
    startAISpeechWithLastMessage();

    return () => {
      speechIsCancelled = true;
      cancelSpeech();
    };

    function startAISpeechWithLastMessage() {
      const message = threadItems[threadItems.length - 1].message;
      speakMessage(message, languageVoice, () => {
        if (!speechIsCancelled) {
          onAISpeechEnd();
        }
      });
    }
  }, [phase]);

  useEffect(() => {
    if (phase.status === 'aiTurnSpeaking' || phase.status === 'waitingForAI') {
      threadViewRef.current?.scrollTo({
        top: threadViewRef.current?.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [threadItems]);

  return (
    <div className={styles.threadView} ref={threadViewRef}>
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
}

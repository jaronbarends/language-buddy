import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { type ThreadItem } from '@/app/chat/chatConversation/chatReducer';
import { type ChatPhase } from '@/app/chat/chatConversation/chatReducer';
import { type LanguageVoice } from '@/lib/language';
import { cancelSpeech, speakMessage } from '@/lib/textToSpeech';

import SpeechBalloon from './SpeechBalloon';

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
  const [showAIPendingBalloon, setShowAIPendingBalloon] = useState<boolean>(false);

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
  }, [threadItems, showAIPendingBalloon]);

  useEffect(() => {
    if (phase.status !== 'waitingForAI') {
      return;
    }

    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      setShowAIPendingBalloon(true);
    }, 500);

    return () => {
      clearTimeout(timer);
      setShowAIPendingBalloon(false);
    };
  }, [phase]);

  return (
    <div className={styles.threadView} ref={threadViewRef}>
      <ol className={styles.threadItems}>
        {threadItems.map((item, idx) => {
          return (
            <SpeechBalloon key={idx} author={item.author} tag="li">
              <div className={styles.itemContent}>{item.message}</div>
              {/* {item.author === 'ai' && languageVoice && (
                <div className={styles.buttonWrapper}>button</div>
              )} */}
            </SpeechBalloon>
          );
        })}
        {showAIPendingBalloon && (
          <SpeechBalloon author="ai" tag="li">
            &hellip;
          </SpeechBalloon>
        )}
      </ol>
    </div>
  );
}

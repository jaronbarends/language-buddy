import { useEffect, useRef, useState } from 'react';

import {
  isAITurnSpeaking,
  isWaitingForAI,
  shouldAutoScrollThread,
  type ThreadItem,
  type ChatPhase,
} from '@/app/chat/chatConversation/chatReducer';
import Loader from '@/components/Loader';
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
  const showFakeBalloons = false;

  useEffect(() => {
    if (!isAITurnSpeaking(phase)) {
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
  }, [phase, threadItems, languageVoice, onAISpeechEnd]);

  useEffect(() => {
    if (shouldAutoScrollThread(phase)) {
      threadViewRef.current?.scrollTo({
        top: threadViewRef.current?.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [phase, threadItems, showAIPendingBalloon]);

  useEffect(() => {
    if (!isWaitingForAI(phase)) {
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

        {showFakeBalloons && <FakeBalloons />}
        {showAIPendingBalloon && (
          <SpeechBalloon author="ai" tag="li">
            <Loader />
          </SpeechBalloon>
        )}
      </ol>
    </div>
  );
}

function FakeBalloons() {
  return (
    <>
      <SpeechBalloon author="ai" tag="li">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam assumenda ad quibusdam!
        Voluptas repellendus animi fugit nobis, consequatur molestiae iusto reiciendis rem
        laboriosam dolorum illo temporibus, eaque, quidem officia voluptate!
      </SpeechBalloon>

      <SpeechBalloon author="user" tag="li">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam assumenda ad quibusdam!
        Voluptas repellendus animi fugit nobis, consequatur molestiae iusto reiciendis rem
        laboriosam dolorum illo temporibus, eaque, quidem officia voluptate!
      </SpeechBalloon>
      <SpeechBalloon author="ai" tag="li">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam assumenda ad quibusdam!
        Voluptas repellendus animi fugit nobis, consequatur molestiae iusto reiciendis rem
        laboriosam dolorum illo temporibus, eaque, quidem officia voluptate!
      </SpeechBalloon>

      <SpeechBalloon author="user" tag="li">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam assumenda ad quibusdam!
        Voluptas repellendus animi fugit nobis, consequatur molestiae iusto reiciendis rem
        laboriosam dolorum illo temporibus, eaque, quidem officia voluptate!
      </SpeechBalloon>
    </>
  );
}

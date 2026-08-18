import { useEffect, useRef } from 'react';

import {
  isAITurnSpeaking,
  isWaitingForEvaluation,
  shouldAutoScrollThread,
  type ThreadItem,
  type ChatPhase,
} from '@/app/chat/chatConversation/chatReducer';
import Feedback from '@/components/Feedback';
import { type LanguageVoice } from '@/lib/language';
import { cancelSpeech, speakMessage } from '@/lib/textToSpeech';

import Evaluation, { EvaluationLoader } from './Evaluation';
import SpeechBalloon from './SpeechBalloon';

import styles from './ThreadView.module.css';

type threadItemsProps = {
  phase: ChatPhase;
  threadItems: ThreadItem[];
  languageVoice: LanguageVoice;
  openingHint: string | undefined;
  onAISpeechEnd: () => void;
};

export default function ThreadView({
  phase,
  threadItems,
  languageVoice,
  openingHint,
  onAISpeechEnd,
}: threadItemsProps) {
  const threadViewRef = useRef<HTMLDivElement>(null);
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
      const lastMessage = threadItems.findLast((item) => item.type === 'message');
      if (!lastMessage) {
        return;
      }

      speakMessage(lastMessage.message, languageVoice, () => {
        if (!speechIsCancelled) {
          onAISpeechEnd();
        }
      });
    }
  }, [phase, threadItems, languageVoice, onAISpeechEnd]);

  useEffect(() => {
    if (shouldAutoScrollThread(phase)) {
      scrollToEnd();
      // we need to scroll again when bounce-animation is done. This is hard to get right, so call scroll multiple time
      for (let i = 1; i <= 3; i++) {
        setTimeout(() => {
          scrollToEnd();
        }, 100 * i);
      }
    }
  }, [phase, threadItems]);

  return (
    <div className={styles.threadView} ref={threadViewRef}>
      {openingHint && <Feedback type="info">{openingHint}</Feedback>}
      <ol className={styles.threadItems}>
        {threadItems.map((item, idx) => {
          if (item.type === 'message') {
            return (
              <SpeechBalloon key={idx} author={item.author} tag="li" isPending={item.isPending}>
                {item.message}
              </SpeechBalloon>
            );
          } else {
            return (
              <li key={idx}>
                <Evaluation evaluation={item.evaluation} />
              </li>
            );
          }
        })}

        {showFakeBalloons && <FakeBalloons />}
        {isWaitingForEvaluation(phase) && <EvaluationLoader />}
      </ol>
    </div>
  );

  function scrollToEnd() {
    threadViewRef.current?.scrollTo({
      top: threadViewRef.current?.scrollHeight,
      behavior: 'smooth',
    });
  }
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

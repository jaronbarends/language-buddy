import clsx from 'clsx';
import { useEffect } from 'react';

import { type ThreadItem } from '@/app/chat/chatConversation/chatReducer';
import { type ChatPhase } from '@/app/chat/chatConversation/chatReducer';
import { type LanguageVoice } from '@/lib/language';

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
    startSpeech(message);
  }

  function startAISpeech(message: string) {
    // speak ai response
    // use TTS finish event
    //console.log(`[SpeechToText's last utterance's end event fires]`);
    setTimeout(onAISpeechEnd, 500);
  }

  function startSpeech(rawMessage: string) {
    if (!languageVoice || !('speechSynthesis' in window)) {
      return;
    }

    const synth = window.speechSynthesis;
    // Chrome will only play short utterances (max 200 - 300 words). Divide long text into sentences, so text remains short. SpeechSynthesis leaves a small pause between utterances, so sentences is a good way to split up text
    const sentences = rawMessage.split('.');

    sentences.forEach((sentence, i) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.voice = languageVoice;
      // much difference between chrome and safari. 1.4 is fine in chrome, but way to fast in safari.
      utterance.rate = 1.5;

      // every utterance has an end event, but speech is only ended when the
      // last utterance's end event fires
      if (i === sentences.length - 1) {
        utterance.addEventListener('end', onAISpeechEnd);
      }
      synth.speak(utterance);
    });
  }
}

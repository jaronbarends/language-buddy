import { clsx } from 'clsx';
import { type ChangeEvent } from 'react';

import { isListening, userIsInInputFlow, messageCanBeEdited } from '../chatReducer';
import { type ChatPhase } from '../chatReducer';
import SpeechBalloon from './SpeechBalloon';

import styles from './SpeechResults.module.css';

type SpeechResultsProps = {
  liveTranscript: string;
  phase: ChatPhase;
  editedMessage: string;
  onMessageChange: (message: string) => void;
};

export default function SpeechResults({
  liveTranscript,
  phase,
  editedMessage,
  onMessageChange,
}: SpeechResultsProps) {
  const suffix =
    !isListening(phase) ? ''
    : liveTranscript === '' ? <span>Listening&hellip;</span>
    : <span>&hellip;</span>;

  return (
    <div className={styles.speechResults}>
      <SpeechBalloon author="user" tag="div">
        <div className={styles.balloonContent}>
          {userIsInInputFlow(phase) && <ListeningIndicator phase={phase} />}
          {messageCanBeEdited(phase) ?
            <textarea onChange={handleMessageChange} value={editedMessage}></textarea>
          : <div className={styles.transcript} role="status" aria-live="polite" aria-atomic="true">
              {liveTranscript}
              {suffix}
            </div>
          }
        </div>
      </SpeechBalloon>
    </div>
  );

  function handleMessageChange(evt: ChangeEvent<HTMLTextAreaElement>) {
    onMessageChange(evt.currentTarget.value);
  }
}

function ListeningIndicator({ phase }: { phase: ChatPhase }) {
  return (
    <div
      className={clsx(
        styles.listeningIndicator,
        !isListening(phase) && styles.listeningIndicatorIdle
      )}
    ></div>
  );
}

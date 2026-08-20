import { clsx } from 'clsx';

import {
  isListening,
  userIsInInputFlow,
  messageCanBeEdited,
  shouldShowRecognitionPreview,
} from '../chatReducer';
import { type ChatPhase } from '../chatReducer';
import MessageEditor from './MessageEditor';
import SpeechBalloon from './SpeechBalloon';

import styles from './SpeechResults.module.css';

type SpeechResultsProps = {
  liveTranscript: string;
  phase: ChatPhase;
  languageTag: string;
  onMessageChange: (message: string) => void;
};

export default function SpeechResults({
  liveTranscript,
  phase,
  languageTag,
  onMessageChange,
}: SpeechResultsProps) {
  if (!shouldShowRecognitionPreview(phase)) {
    return null;
  }

  const suffix =
    !isListening(phase) ? ''
    : liveTranscript === '' ? <span lang="en">Listening&hellip;</span>
    : <span>&hellip;</span>;

  return (
    <div className={styles.speechResults} lang={languageTag}>
      <SpeechBalloon author="user" tag="div">
        <div className={styles.balloonContent}>
          {userIsInInputFlow(phase) && <ListeningIndicator phase={phase} />}
          {messageCanBeEdited(phase) ?
            <MessageEditor
              key={phase.userMessage}
              onMessageChange={onMessageChange}
              initialValue={phase.userMessage}
              languageTag={languageTag}
            />
          : <div role="status" aria-live="polite" aria-atomic="true">
              {phase.status === 'sendingUserReply' ? phase.userMessage : liveTranscript}
              {suffix}
            </div>
          }
        </div>
      </SpeechBalloon>
    </div>
  );
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

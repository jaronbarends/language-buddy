import { clsx } from 'clsx';

import { isListening, userIsInInputFlow, shouldShowRecognitionPreview } from '../chatReducer';
import { type ChatPhase } from '../chatReducer';
import SpeechBalloon from './SpeechBalloon';

import styles from './SpeechResults.module.css';

type SpeechResultsProps = {
  liveTranscript: string;
  phase: ChatPhase;
};

export default function SpeechResults({ liveTranscript, phase }: SpeechResultsProps) {
  if (!shouldShowRecognitionPreview(phase)) {
    return null;
  }
  const suffix =
    !isListening(phase) ? ''
    : liveTranscript === '' ? <span>Listening&hellip;</span>
    : <span>&hellip;</span>;
  return (
    <div className={styles.speechResults}>
      <SpeechBalloon author="user" tag="div">
        <div className={styles.balloonContent}>
          {userIsInInputFlow(phase) && <ListeningIndicator phase={phase} />}
          <div className={styles.transcript} role="status" aria-live="polite" aria-atomic="true">
            {liveTranscript}
            {suffix}
          </div>
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

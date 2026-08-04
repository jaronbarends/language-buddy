import { isListening, shouldShowRecognitionPreview } from '../chatReducer';
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
    <SpeechBalloon author="user" tag="div">
      <div className={styles.results} role="status" aria-live="polite" aria-atomic="true">
        {liveTranscript}
        {suffix}
      </div>
    </SpeechBalloon>
  );
}

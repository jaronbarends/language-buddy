import { type ChatPhase } from '../chatReducer';

import styles from './SpeechResults.module.css';

type SpeechResultsProps = {
  liveTranscript: string;
  phase: ChatPhase;
};

export default function SpeechResults({ liveTranscript, phase }: SpeechResultsProps) {
  const suffix =
    phase.status !== 'listening' ? (
      ''
    ) : liveTranscript === '' ? (
      <span>Listening&hellip;</span>
    ) : (
      <span>&hellip;</span>
    );
  return (
    <div className={styles.results}>
      {liveTranscript}
      {suffix}
    </div>
  );
}

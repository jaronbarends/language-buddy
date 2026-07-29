import { type RefObject } from 'react';

import { type ChatPhase } from '../chatReducer';

import styles from './SpeechResults.module.css';

type SpeechResultsProps = {
  // speechResults: SpeechRecognitionAlternative[];
  liveTranscript: string;
  phase: ChatPhase;
};

export default function SpeechResults({ liveTranscript, phase }: SpeechResultsProps) {
  return (
    <div className={styles.results}>
      {/* {speechResults.map((result, idx) => (
        <span key={idx}>{result.transcript}</span>
      ))} */}
      {liveTranscript}
      {phase.status === 'listening' && <span>&hellip;</span>}
    </div>
  );
}

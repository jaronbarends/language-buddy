import { type RefObject } from 'react';

import { type ChatPhase } from '../chatReducer';

import styles from './SpeechResults.module.css';

type SpeechResultsProps = {
  speechResults: SpeechRecognitionAlternative[];
  phase: ChatPhase;
};

export default function SpeechResults({ speechResults, phase }: SpeechResultsProps) {
  return (
    <div className={styles.results}>
      {speechResults.map((result, idx) => (
        <span key={idx}>{result.transcript}</span>
      ))}
      {phase.status === 'listening' && <span>&hellip;</span>}
    </div>
  );
}

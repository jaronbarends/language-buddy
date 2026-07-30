import { useImperativeHandle, useState, useRef, useEffect, type Ref } from 'react';

import { type ChatPhase } from '../chatReducer';

import styles from './MockSTT.module.css';

export type MockSTTHandle = {
  getMockValue: () => string;
};

type MockSTTProps = {
  ref: Ref<MockSTTHandle>;
  phase: ChatPhase;
};

export default function MockSTT({ ref, phase }: MockSTTProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<string>('');
  const [transcript, setTranscript] = useState<string>('');
  useImperativeHandle(ref, () => {
    return {
      getMockValue() {
        return transcriptRef.current ?? '';
      },
    };
  }, []);

  useEffect(() => {
    if (phase.status !== 'waitingForAI') {
      return;
    }
    setTranscriptByRef('');
  }, [phase]);

  return (
    <textarea
      ref={textareaRef}
      className={styles.mockSTT}
      disabled={phase.status !== 'listening'}
      value={transcript}
      onChange={(event) => setTranscriptByRef(event.target.value)}
    ></textarea>
  );

  function setTranscriptByRef(value: string) {
    transcriptRef.current = value;
    setTranscript(transcriptRef.current);
  }
}

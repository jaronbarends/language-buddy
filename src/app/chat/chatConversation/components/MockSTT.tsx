import { useImperativeHandle, useState, useRef, useEffect, type Ref } from 'react';

import { isListening, isWaitingForAI, type ChatPhase } from '../chatReducer';

import styles from './MockSTT.module.css';

export type MockSTTHandle = {
  getMockValue: () => string;
};

type MockSTTProps = {
  mockRef: Ref<MockSTTHandle>;
  phase: ChatPhase;
};

export default function MockSTT({ mockRef, phase }: MockSTTProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<string>('');
  const [transcript, setTranscript] = useState<string>('');
  useImperativeHandle(mockRef, () => {
    return {
      getMockValue() {
        return transcriptRef.current ?? '';
      },
    };
  }, []);

  useEffect(() => {
    if (!isWaitingForAI(phase)) {
      return;
    }
    setTranscriptByRef('');
  }, [phase]);

  return (
    <textarea
      ref={textareaRef}
      className={styles.mockSTT}
      disabled={!isListening(phase)}
      value={transcript}
      onChange={(event) => setTranscriptByRef(event.target.value)}
    ></textarea>
  );

  function setTranscriptByRef(value: string) {
    transcriptRef.current = value;
    setTranscript(transcriptRef.current);
  }
}

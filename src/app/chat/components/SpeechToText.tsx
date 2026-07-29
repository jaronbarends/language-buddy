import 'dotenv/config';
import { useEffect, useRef, useState } from 'react';

import { type ChatPhase } from '@/app/chat/chatReducer';
import MockSTT, { type MockSTTHandle } from '@/app/chat/components/MockSTT';
import SpeechResults from '@/app/chat/components/SpeechResults';

import styles from './SpeechToText.module.css';

type SpeechToTextProps = {
  phase: ChatPhase;
  onTranscriptCreated: (transcript: string) => void;
  onError: () => void;
  languageTag: string;
};

const shouldShowMockSTT = process.env.NEXT_PUBLIC_USE_MOCK_STT === 'true';

export default function SpeechToText({
  phase,
  onTranscriptCreated,
  onError,
  languageTag,
}: SpeechToTextProps) {
  const recognitionRef = useRef<SpeechRecognition>(null);
  const recognitionShouldBeActiveRef = useRef<boolean>(false);
  // ref to ensure same object across recreated event handlers
  // always update ref before setSpeechResults
  const speechResultsRef = useRef<SpeechRecognitionAlternative[]>([]);
  const [speechResults, setSpeechResults] = useState<SpeechRecognitionAlternative[]>([]);
  const mockRef = useRef<MockSTTHandle>(null);

  useEffect(() => {
    recognitionRef.current = initSpeechRecognition(languageTag);
  }, [languageTag]);

  useEffect(() => {
    if (phase.status !== 'listening') {
      return;
    }
    startListening();
  }, [phase]);

  useEffect(() => {
    if (phase.status !== 'listeningStopped') {
      return;
    }
    stopListening();
  }, [phase]);

  useEffect(() => {
    if (phase.status !== 'waitingForAI') {
      return;
    }
    clearSpeechResultsByRef();
  }, [phase]);

  return (
    <div className={styles.speechToText}>
      <SpeechResults speechResults={speechResults} phase={phase} />
      {/* <div className={styles.feedback}>listening...</div> */}
      {shouldShowMockSTT && <MockSTT ref={mockRef} phase={phase} />}
    </div>
  );

  function initSpeechRecognition(languageTag: string): SpeechRecognition {
    const CrossBrowserSpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!CrossBrowserSpeechRecognition) {
      // TODO: handle this
      throw new Error('Speech recognition is not supported in this browser');
    }
    const recognition = new CrossBrowserSpeechRecognition();

    recognition.continuous = true;
    recognition.lang = languageTag;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = handleResult;
    recognition.onend = handleEnd;
    // todo add additional listeners for feedback like soundStart

    return recognition;
  }

  function startListening() {
    recognitionShouldBeActiveRef.current = true;
    recognitionRef.current?.start();
    console.log('recognitionShouldBeActiveRef.current:', recognitionShouldBeActiveRef.current);
  }

  function stopListening() {
    recognitionShouldBeActiveRef.current = false;
    recognitionRef.current?.stop();
    // we don't have the final result here yet. we have that when onend fires
  }

  // handleResult may be called multiple times when user has pause
  function handleResult(event: SpeechRecognitionEvent) {
    // event.results is SpeechRecognitionResultList object representing all the speech recognition results for the current session.
    // resultIndex is the lowest index that is actually changes.
    // each SpeechRecognitionResult can contain multiple SpeechRecognitionAlternative objects (we have set that to 1 with recognition.maxAlternatives)
    // SpeechRecognitionResult is no array, but can be queried with [index]
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (!result.isFinal) continue; // not necessary when interimResults=false, but keep it in case we change that

      addSpeechResult(result[0]);
    }
  }

  function handleEnd() {
    // speechRecognition auto-ends after a long pause by user
    // if that happens, start it again.
    // recognition.continuous = true prevents onend to fire on short pauses, and that we capture all the results
    if (recognitionShouldBeActiveRef.current) {
      recognitionRef.current?.start(); // end was triggered by silence timeout, not wanted
    } else {
      let fullTranscript = createFullTranscript();
      if (fullTranscript === '') {
        fullTranscript = mockRef.current?.getMockValue() ?? '';
      }
      onTranscriptCreated(fullTranscript);
    }
  }

  function addSpeechResult(result: SpeechRecognitionAlternative) {
    if (!result.transcript) {
      // when you say only one short word, it gives empty transcript.
      return;
    }
    setSpeechResultsByRef(result);
  }

  function createFullTranscript(): string {
    const results = speechResultsRef.current;
    if (results.length === 0) {
      return '';
    }
    const transcripts: string[] = results.map((result) => result.transcript);
    const fullTranscript = transcripts.join(' ');
    return fullTranscript;
  }

  /*
  recognition's event handlers are only assigned once.
  If those functions refer to speechResult, that closes over the snapshot of speechResult at the time the function was created.
  On subsequent renders, speechResult points to a different snapshot.
  Using a ref avoids that problem: .current is always the live, current value, no matter which render's closure reads it. Unlike speechResults, which is frozen at whichever render created the closure.
  */
  function setSpeechResultsByRef(result: SpeechRecognitionAlternative) {
    speechResultsRef.current = [...speechResultsRef.current, result];
    setSpeechResults(speechResultsRef.current);
  }

  function clearSpeechResultsByRef() {
    speechResultsRef.current = [];
    setSpeechResults(speechResultsRef.current);
  }
}

import { useEffect, useRef, useState } from 'react';

import { type ChatPhase } from '@/app/chat/chatReducer';
import SpeechResults from '@/app/chat/components/SpeechResults';

import styles from './SpeechToText.module.css';

type SpeechToTextProps = {
  phase: ChatPhase;
  onTranscriptCreated: (transcript: string) => void;
  onError: () => void;
  languageTag: string;
};

export default function SpeechToText({
  phase,
  onTranscriptCreated,
  onError,
  languageTag,
}: SpeechToTextProps) {
  const recognitionRef = useRef<SpeechRecognition>(null);
  const recognitionShouldBeActiveRef = useRef<boolean>(false);
  const [speechResults, setSpeechResults] = useState<SpeechRecognitionAlternative[]>([]);

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

  return (
    <div className={styles.speechToText}>
      <SpeechResults speechResults={speechResults} />
      {/* <div className={styles.feedback}>listening...</div> */}
    </div>
  );

  function startListening() {
    console.log('recognition.start()');
    recognitionRef.current?.start();
  }

  function stopListening() {
    console.log('recognition.stop()');
    recognitionShouldBeActiveRef.current = false;
    recognitionRef.current?.stop();
  }

  function initSpeechRecognition(languageTag: string): SpeechRecognition {
    const CrossBrowserSpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!CrossBrowserSpeechRecognition) {
      // TODO: handle this
      throw new Error('Speech recognition is not supported in this browser');
    }
    const recognition = new CrossBrowserSpeechRecognition();
    console.log('tag:', languageTag);

    recognition.continuous = true;
    recognition.lang = languageTag;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = handleResult;
    recognition.onend = handleEnd;
    // todo add additional listeners for feedback like soundStart

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

    function addSpeechResult(result: SpeechRecognitionAlternative) {
      if (!result.transcript) {
        // when you say only one short word, it gives empty transcript.
        return;
      }
      setSpeechResults((prev) => [...prev, result]);
    }

    function handleEnd() {
      // speechRecognition auto-ends after a short pause by user
      // if that happens, start it again.
      // recognition.continuous = true ensures we capture all the results
      if (recognitionShouldBeActiveRef.current) {
        console.log('prevent end');
        recognition.start(); // end was triggered by silence timeout, not wanted
      } else {
        console.log('really end - recognition service has disconnected');
      }
    }

    return recognition;
  }
}

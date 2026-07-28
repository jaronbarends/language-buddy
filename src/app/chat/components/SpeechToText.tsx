import { useEffect, useRef, useState } from 'react';

import { type ChatPhase } from '@/app/chat/chatReducer';
import { SpeechTranscript } from '@/lib/speechTranscript';

import styles from './SpeechToText.module.css';

type SpeechToTextProps = {
  phase: ChatPhase;
  onTranscriptCreated: (transcript: SpeechTranscript) => void;
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
  const [transcripts, setTranscripts] = useState<SpeechTranscript[]>([]);

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
      <div className={styles.transcript}>transcript</div>
      {/* <div className={styles.feedback}>listening...</div> */}
    </div>
  );

  function startListening() {
    console.log('recognition init + start()');
  }

  function stopListening() {
    console.log('recognition.stop()');
  }

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

    // handleResult may be called multiple times when user has pause
    function handleResult(event: SpeechRecognitionEvent) {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result.isFinal) continue; // not necessary when interimResults=false, but keep it in case we change that

        // renderResult(result[0]);
        // const transcript: SpeechTranscript =
      }
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

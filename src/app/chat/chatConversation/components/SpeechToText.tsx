// import 'dotenv/config';
import { useEffect, useRef, useState } from 'react';

import {
  canStartReply,
  canStartWithUser,
  isListening,
  isWaitingForAI,
  listeningShouldBeStopped,
  listeningShouldBeCancelled,
  type ChatPhase,
} from '@/app/chat/chatConversation/chatReducer';

import MockSTT, { type MockSTTHandle } from './MockSTT';
import SpeechResults from './SpeechResults';

import styles from './SpeechToText.module.css';

type SpeechToTextProps = {
  phase: ChatPhase;
  onTranscriptCreated: (transcript: string) => void;
  onListeningCancelled: () => void;
  onError: (message: string) => void;
  languageTag: string;
};

const shouldShowMockSTT = process.env.NEXT_PUBLIC_USE_MOCK_STT === 'true';

export default function SpeechToText({
  phase,
  onTranscriptCreated,
  onListeningCancelled,
  onError,
  languageTag,
}: SpeechToTextProps) {
  const recognitionRef = useRef<SpeechRecognition>(null);
  const recognitionShouldBeActiveRef = useRef<boolean>(false);
  const stopReasonRef = useRef<'send' | 'cancel'>('send');
  // use ref combined with state to ensure same object across recreated event handlers
  // always update ref before setting liveTranscript
  const liveTranscriptRef = useRef<string>('');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const mockRef = useRef<MockSTTHandle>(null);

  useEffect(() => {
    recognitionRef.current = initSpeechRecognition(languageTag);
    // deliberately leave deps array empty. If languageTag were to change,
    // we'd only need to reassign recognition's lang property, not recreate it.
    // handleResult/handleEnd (assigned inside initSpeechRecognition) close over
    // refs (always read via .current, so no staleness) and over onTranscriptCreated/
    // onListeningCancelled/onError, which themselves only forward to a stable dispatch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (canStartReply(phase) || canStartWithUser(phase)) {
      setLiveTranscriptByRef('');
    }
  });

  useEffect(() => {
    if (isListening(phase)) {
      startListening();
    }
  }, [phase]);

  useEffect(() => {
    if (listeningShouldBeStopped(phase)) {
      stopListening();
    }
  }, [phase]);

  useEffect(() => {
    if (listeningShouldBeCancelled(phase)) {
      cancelListening();
    }
  }, [phase]);

  useEffect(() => {
    if (isWaitingForAI(phase)) {
      setLiveTranscriptByRef('');
    }
  }, [phase]);

  return (
    <div className={styles.speechToText}>
      <SpeechResults liveTranscript={liveTranscript} phase={phase} />
      {shouldShowMockSTT && <MockSTT ref={mockRef} phase={phase} />}
    </div>
  );

  function initSpeechRecognition(languageTag: string): SpeechRecognition {
    const CrossBrowserSpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!CrossBrowserSpeechRecognition) {
      // TODO: handle this
      onError('Speech recognition is not supported in this browser');
      throw new Error();
    }
    const recognition = new CrossBrowserSpeechRecognition();

    recognition.continuous = true;
    recognition.lang = languageTag;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = handleResult;
    recognition.onend = handleEnd;
    // todo add additional listeners for feedback like soundStart

    return recognition;
  }

  function startListening() {
    recognitionShouldBeActiveRef.current = true;
    recognitionRef.current?.start();
  }

  function stopListening() {
    stopReasonRef.current = 'send';
    recognitionShouldBeActiveRef.current = false;
    recognitionRef.current?.stop();
    // we don't have the final result here yet. we have that when onend fires
  }

  function cancelListening() {
    stopReasonRef.current = 'cancel';
    recognitionShouldBeActiveRef.current = false;
    recognitionRef.current?.abort();
    // we don't have the final result here yet. we have that when onend fires
  }

  // handleResult may be called multiple times when user has pause
  function handleResult(event: SpeechRecognitionEvent) {
    // event.results is SpeechRecognitionResultList object representing all the speech recognition results for the current session.
    // each SpeechRecognitionResult can contain multiple SpeechRecognitionAlternative objects, but we have set that to 1 with recognition.maxAlternatives
    // SpeechRecognitionResult is no array, but can be queried with [index]
    const resultsArray = [...event.results];
    const transcript = resultsArray
      .map((result) => {
        return result[0].transcript;
      })
      .join(' ')
      .replace(/ {2,}/g, ' '); // transcripts sometimes end with space, sometimes not. remove double spaces

    setLiveTranscriptByRef(transcript);
  }

  function handleEnd() {
    // speechRecognition auto-ends after a long pause by user
    // if that happens, start it again.
    // recognition.continuous = true prevents onend to fire on short pauses, and that we capture all the results
    if (recognitionShouldBeActiveRef.current) {
      recognitionRef.current?.start(); // end was triggered by silence timeout, not wanted
    } else {
      if (stopReasonRef.current === 'cancel') {
        onListeningCancelled();
      } else {
        let transcript = liveTranscriptRef.current;
        if (transcript === '') {
          transcript = mockRef.current?.getMockValue() ?? '';
        }
        onTranscriptCreated(transcript);
      }
    }
  }

  /*
  recognition's event handlers are only assigned once.
  If those functions refer to liveTranscript, that closes over the snapshot of liveTranscript at the time the function was created.
  On subsequent renders, liveTranscript points to a different snapshot.
  Using a ref avoids that problem: .current is always the live, current value, no matter which render's closure reads it. Unlike liveTranscript, which is frozen at whichever render created the closure.
  */
  function setLiveTranscriptByRef(transcript: string) {
    liveTranscriptRef.current = transcript;
    setLiveTranscript(liveTranscriptRef.current);
  }
}

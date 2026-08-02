'use client';
import { useReducer, useState, useRef, useEffect } from 'react';

import { AIError, sendChatMessage, type AIChatResult } from '@/lib/aiService';
import { type ChatConfig } from '@/lib/chatConfig';
import { type LanguageVoice } from '@/lib/language';
import { cancelSpeech } from '@/lib/textToSpeech';

import { chatReducer, type ChatState } from './chatReducer';
import ControlsArea from './components/ControlsArea';
import DevHelper from './components/DevHelper';
import ErrorArea from './components/ErrorArea';
import SpeechToText from './components/SpeechToText';
import ThreadView from './components/ThreadView';

import styles from './ChatConversation.module.css';

type ChatConversationProps = {
  chatConfig: ChatConfig;
  languageVoice: LanguageVoice;
  onEndSession: () => void;
};

export default function ChatConversation({
  chatConfig,
  languageVoice,
  onEndSession,
}: ChatConversationProps) {
  const [previousInteractionId, setPreviousInteractionId] = useState<string | undefined>();
  const initalChatState: ChatState = { threadItems: [], phase: { status: 'chatStartPending' } };
  const [state, dispatch] = useReducer(chatReducer, initalChatState);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);
  const hasStartedRef = useRef<boolean>(false);
  const requestIdRef = useRef<number>(0);

  useEffect(() => {
    if (state.phase.status !== 'chatStartPending' || hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    startChat();
  }, [state.phase]);

  return (
    <>
      <div className={styles.component}>
        <ThreadView
          phase={state.phase}
          threadItems={state.threadItems}
          languageVoice={languageVoice}
          onAISpeechEnd={handleAISpeechEnd}
        />
        <ErrorArea phase={state.phase} />
        <SpeechToText
          phase={state.phase}
          onTranscriptCreated={handleTranscriptCreated}
          onError={handleError}
          languageTag={chatConfig.language.languageTag}
        />
        <ControlsArea
          onStopChat={handleStopChat}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          onSendUserMessage={handleSendUserMessage}
          onEndSession={onEndSession}
          phase={state.phase}
        />
      </div>
      <DevHelper phase={state.phase} language={chatConfig.language} />
    </>
  );

  function startChat() {
    if (chatConfig.aiHasFirstTurn) {
      startChatWithAI();
    } else {
      startChatWithUser();
    }
  }

  function handleStopChat() {
    dispatch({ type: 'STOP_CHAT' });
    requestIdRef.current++; // ensure any pending requests are made stale
    abortControllerRef.current?.abort();
    cancelSpeech();
  }

  function handleStartListening() {
    startListening();
  }

  function handleStopListening() {
    dispatch({ type: 'STOP_LISTENING' });
  }

  function handleTranscriptCreated(transcript: string) {
    if (transcript === '') {
      dispatch({ type: 'TRANSCRIPT_EMPTY' });
      return;
    }
    dispatch({ type: 'TRANSCRIPT_CREATED', payload: { transcript } });
  }

  function handleError() {
    // TODO decide how to handle non-api errors
  }

  async function startChatWithAI() {
    const input = 'start the conversation according to the system instructions';
    dispatch({ type: 'AI_START_INPUT_SENT' });

    await sendMessageToAI(input);
  }

  function startChatWithUser() {
    dispatch({ type: 'START_CHAT_WITH_USER' });
  }

  function startListening() {
    dispatch({ type: 'START_LISTENING' });
  }

  async function handleSendUserMessage() {
    if (state.phase.status !== 'readyForSendingUserReply') {
      return;
    }

    const input = state.phase.transcript;
    dispatch({ type: 'USER_MESSAGE_SENT', payload: { message: input } });

    await sendMessageToAI(input);
  }

  // function startAISpeech(message: string) {
  //   // speak ai response
  //   // use TTS finish event
  //   //console.log(`[SpeechToText's last utterance's end event fires]`);
  //   setTimeout(() => {
  //     dispatch({ type: 'AI_FINISHED_SPEAKING' });
  //   }, 500);
  // }

  function handleAISpeechEnd() {
    dispatch({ type: 'AI_FINISHED_SPEAKING' });
  }

  async function sendMessageToAI(input: string): Promise<void> {
    let reply: AIChatResult;
    abortControllerRef.current = new AbortController();
    requestIdRef.current++;
    const requestId = requestIdRef.current;

    try {
      reply = await sendChatMessage({
        input,
        previousInteractionId,
        systemInstruction: chatConfig.systemInstruction,
        abortSignal: abortControllerRef.current.signal,
      });
      if (requestIsStale(requestId)) {
        return;
      }
    } catch (error) {
      if (requestIsStale(requestId)) {
        return;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        return; // user cancelled, not a real error, don't dispatch
      }
      dispatch({ type: 'ERROR', payload: { error: error as AIError } });
      return;
    }

    if (!reply.success) {
      // then reply must be error object
      dispatch({ type: 'ERROR', payload: { error: reply } });
      return;
    }

    setPreviousInteractionId(reply.interactionId);
    dispatch({ type: 'AI_RESPONSE_RECEIVED', payload: { message: reply.message } });
  }

  function requestIsStale(requestId: number): boolean {
    return requestId !== requestIdRef.current;
  }
}

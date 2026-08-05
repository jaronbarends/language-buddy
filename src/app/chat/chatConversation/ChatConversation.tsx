'use client';
import { useReducer, useState, useRef, useEffect } from 'react';

import { AIError, sendChatMessage, type AIChatResult } from '@/lib/aiService';
import { type ChatConfig } from '@/lib/chatConfig';
import { type LanguageVoice } from '@/lib/language';

import { shouldSendReply, chatReducer, chatStartIsPending, type ChatState } from './chatReducer';
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
  const startChatRef = useRef<() => void>(() => {});

  // Keep up to date via this effect (not useCallback) so startChat always uses
  // the latest chatConfig and startChatWithUser. We don't want chatConfig or
  // startChatWithUser as dependencies in the useEffect that calls startChatRef.current
  // below, because them changing mid-session shouldn't re-trigger chat start.
  useEffect(() => {
    startChatRef.current = () => {
      if (chatConfig.aiHasFirstTurn) {
        startChatWithAI();
      } else {
        startChatWithUser();
      }
    };
    // deliberately leave out dependency array - we want this to run on every render to stay current
  });

  useEffect(() => {
    if (!chatStartIsPending(state.phase) || hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    startChatRef.current();
  }, [state.phase]);

  useEffect(() => {
    if (shouldSendReply(state.phase)) {
      handleSendUserMessage();
    }
  });

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
          onListeningCancelled={handleListeningCancelled}
          onError={handleError}
          languageTag={chatConfig.language.languageTag}
        />
        <ControlsArea
          onStartListening={handleStartListening}
          onSendRequested={handleSendRequested}
          onCancelListening={handleCancelListening}
          onSendUserMessage={handleSendUserMessage}
          onEndSession={onEndSession}
          phase={state.phase}
        />
      </div>
      {process.env.NEXT_PUBLIC_SHOW_DEV_HELPER && (
        <DevHelper phase={state.phase} language={chatConfig.language} />
      )}
    </>
  );

  function handleStartListening() {
    startListening();
  }

  function handleSendRequested() {
    dispatch({ type: 'STOP_LISTENING', payload: { intent: 'send' } });
  }

  function handleTranscriptCreated(transcript: string) {
    if (transcript === '') {
      dispatch({ type: 'TRANSCRIPT_EMPTY' });
      return;
    }
    dispatch({ type: 'TRANSCRIPT_CREATED', payload: { transcript } });
  }

  function handleError(message: string) {
    // TODO decide how to handle non-api errors
    throw new Error(message);
  }

  function handleCancelListening() {
    dispatch({ type: 'CANCEL_LISTENING' });
  }

  function handleListeningCancelled() {
    dispatch({ type: 'LISTENING_CANCELLED' });
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
    if (!shouldSendReply(state.phase)) {
      return;
    }

    const input = state.phase.transcript;
    dispatch({ type: 'USER_MESSAGE_SENT', payload: { message: input } });

    await sendMessageToAI(input);
  }

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
